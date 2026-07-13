import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const root = process.cwd();
const brandDirectory = path.join(root, "public/brand");
const sourcePath = path.join(brandDirectory, "youtoola-symbol.png");
const expectedSourceHash =
  "c240dd3396a4d9c766b1d772e5bc4b6d148a89a337b88b8ca69b12daab9e326c";
const sizes = [16, 32, 48, 64];
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const sha256 = (buffer) =>
  createHash("sha256").update(buffer).digest("hex");

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const createChunk = (typeName, data) => {
  const type = Buffer.from(typeName, "ascii");
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  type.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([type, data])), 8 + data.length);
  return chunk;
};

const readChunks = (png) => {
  if (!png.subarray(0, 8).equals(signature)) {
    throw new Error("Chromium returned an invalid PNG.");
  }
  const chunks = [];
  let offset = 8;
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > png.length) throw new Error("PNG chunk exceeds file length.");
    chunks.push({
      type: png.toString("ascii", offset + 4, offset + 8),
      data: png.subarray(offset + 8, offset + 8 + length),
    });
    offset = end;
  }
  return chunks;
};

const normalizePng = (png) => {
  const chunks = readChunks(png);
  const ihdr = chunks.find(({ type }) => type === "IHDR");
  const idat = chunks.filter(({ type }) => type === "IDAT");
  const iend = chunks.find(({ type }) => type === "IEND");
  if (!ihdr || idat.length === 0 || !iend) {
    throw new Error("PNG is missing a required chunk.");
  }
  return Buffer.concat([
    signature,
    createChunk("IHDR", ihdr.data),
    createChunk("sRGB", Buffer.from([0])),
    ...idat.map(({ data }) => createChunk("IDAT", data)),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
};

const buildIco = (entries) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(entries.length * 16);
  let dataOffset = header.length + directory.length;
  entries.forEach(({ size, png }, index) => {
    const offset = index * 16;
    directory[offset] = size;
    directory[offset + 1] = size;
    directory[offset + 2] = 0;
    directory[offset + 3] = 0;
    directory.writeUInt16LE(1, offset + 4);
    directory.writeUInt16LE(32, offset + 6);
    directory.writeUInt32LE(png.length, offset + 8);
    directory.writeUInt32LE(dataOffset, offset + 12);
    dataOffset += png.length;
  });

  return Buffer.concat([header, directory, ...entries.map(({ png }) => png)]);
};

const source = await readFile(sourcePath);
const sourceHash = sha256(source);
if (sourceHash !== expectedSourceHash) {
  throw new Error(
    `Approved symbol hash changed: ${sourceHash}; expected ${expectedSourceHash}.`,
  );
}

const browser = await chromium.launch({ headless: true });
let rendered;
try {
  const page = await browser.newPage();
  rendered = await page.evaluate(
    async ({ sourceUrl, sizes: targetSizes }) => {
      const image = new Image();
      image.src = sourceUrl;
      await image.decode();
      if (image.naturalWidth !== 2048 || image.naturalHeight !== 2048) {
        throw new Error("Approved symbol must remain 2048×2048.");
      }

      return Object.fromEntries(
        targetSizes.map((size) => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas 2D context is unavailable.");
          context.clearRect(0, 0, size, size);
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = "high";
          context.drawImage(image, 0, 0, 2048, 2048, 0, 0, size, size);
          return [size, canvas.toDataURL("image/png")];
        }),
      );
    },
    {
      sourceUrl: `data:image/png;base64,${source.toString("base64")}`,
      sizes,
    },
  );
} finally {
  await browser.close();
}

await mkdir(brandDirectory, { recursive: true });
const entries = [];
for (const size of sizes) {
  const dataUrl = rendered[size];
  const png = normalizePng(
    Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64"),
  );
  const name = `favicon-${size}x${size}.png`;
  await writeFile(path.join(brandDirectory, name), png);
  entries.push({ size, name, png });
}

const ico = buildIco(entries);
await writeFile(path.join(brandDirectory, "favicon.ico"), ico);

console.log(
  JSON.stringify(
    {
      source: {
        file: "public/brand/youtoola-symbol.png",
        dimensions: "2048×2048",
        sha256: sourceHash,
      },
      outputs: [
        ...entries.map(({ name, size, png }) => ({
          file: `public/brand/${name}`,
          dimensions: `${size}×${size}`,
          bytes: png.length,
          sha256: sha256(png),
        })),
        {
          file: "public/brand/favicon.ico",
          entries: sizes,
          bytes: ico.length,
          sha256: sha256(ico),
        },
      ],
    },
    null,
    2,
  ),
);
