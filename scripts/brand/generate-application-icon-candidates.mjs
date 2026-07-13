import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const root = process.cwd();
const brandDirectory = path.join(root, "public/brand");
const sourcePath = path.join(brandDirectory, "youtoola-symbol.png");
const expectedSourceHash =
  "c240dd3396a4d9c766b1d772e5bc4b6d148a89a337b88b8ca69b12daab9e326c";
const background = "#000A3F";
const specs = [
  { name: "apple-touch-icon.png", size: 180, scale: 0.75 },
  { name: "icon-192.png", size: 192, scale: 23 / 32 },
  { name: "icon-512.png", size: 512, scale: 23 / 32 },
];
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

const normalizePng = (png) => {
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

const source = await readFile(sourcePath);
const sourceHashBefore = sha256(source);
if (sourceHashBefore !== expectedSourceHash) {
  throw new Error(
    `Approved symbol hash changed: ${sourceHashBefore}; expected ${expectedSourceHash}.`,
  );
}

const browser = await chromium.launch({ headless: true });
let rendered;
try {
  const page = await browser.newPage();
  rendered = await page.evaluate(
    async ({ sourceUrl, background, specs }) => {
      const image = new Image();
      image.src = sourceUrl;
      await image.decode();
      if (image.naturalWidth !== 2048 || image.naturalHeight !== 2048) {
        throw new Error("Approved symbol must remain 2048×2048.");
      }

      return Object.fromEntries(
        specs.map(({ name, size, scale }) => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas 2D context is unavailable.");
          context.fillStyle = background;
          context.fillRect(0, 0, size, size);
          const renderedSize = size * scale;
          const offset = (size - renderedSize) / 2;
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = "high";
          context.drawImage(
            image,
            0,
            0,
            2048,
            2048,
            offset,
            offset,
            renderedSize,
            renderedSize,
          );
          return [name, canvas.toDataURL("image/png")];
        }),
      );
    },
    {
      sourceUrl: `data:image/png;base64,${source.toString("base64")}`,
      background,
      specs,
    },
  );
} finally {
  await browser.close();
}

const outputs = [];
for (const spec of specs) {
  const dataUrl = rendered[spec.name];
  const png = normalizePng(
    Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64"),
  );
  await writeFile(path.join(brandDirectory, spec.name), png);
  outputs.push({
    file: `public/brand/${spec.name}`,
    dimensions: `${spec.size}×${spec.size}`,
    bytes: png.length,
    sha256: sha256(png),
  });
}

const sourceHashAfter = sha256(await readFile(sourcePath));
if (sourceHashAfter !== expectedSourceHash) {
  throw new Error("Approved symbol changed during application-icon generation.");
}

console.log(
  JSON.stringify(
    {
      source: {
        file: "public/brand/youtoola-symbol.png",
        dimensions: "2048×2048",
        sha256Before: sourceHashBefore,
        sha256After: sourceHashAfter,
      },
      background: { hex: background, rgba: [0, 10, 63, 255] },
      outputs,
    },
    null,
    2,
  ),
);
