import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const root = process.cwd();
const brandDirectory = path.join(root, "public/brand");
const reportPath = path.join(
  root,
  "docs/brand/reviews/favicon/technical-validation-report.md",
);
const sourcePath = path.join(brandDirectory, "youtoola-symbol.png");
const expectedSourceHash =
  "c240dd3396a4d9c766b1d772e5bc4b6d148a89a337b88b8ca69b12daab9e326c";
const sizes = [16, 32, 48, 64];
const expectedOutputHashes = new Map([
  [16, "df7ed4cc45542d7ee90ac1ae2e7bef4a3f333561778858e527206b929c657d2e"],
  [32, "ab5fe330d3c3a5706ede6192603918bfa3e6145646340d691502ce8ad79a39f3"],
  [48, "60312cc13c13225738614924a29fbf064c4e7e1589abe98f0659fd628b911c12"],
  [64, "747ce1971551489a6fc9cf06ed111613e69d9c4e0abe00ff945636311924fd20"],
]);
const expectedIcoHash =
  "81a006e16159b950c3172b31fd33306945d5b8ae113516a28b7c00db937c3b01";
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const allowedChunks = new Set(["IHDR", "sRGB", "IDAT", "IEND"]);
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

const checks = [];
const check = (name, passed, detail) =>
  checks.push({ name, passed: Boolean(passed), detail });

const parsePng = (png) => {
  if (!png.subarray(0, 8).equals(signature)) {
    throw new Error("Invalid PNG signature.");
  }
  const chunks = [];
  let offset = 8;
  while (offset < png.length) {
    if (offset + 12 > png.length) throw new Error("Truncated PNG chunk.");
    const length = png.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > png.length) throw new Error("PNG chunk exceeds file length.");
    const type = png.toString("ascii", offset + 4, offset + 8);
    const typeAndData = png.subarray(offset + 4, offset + 8 + length);
    const expectedCrc = png.readUInt32BE(offset + 8 + length);
    if (crc32(typeAndData) !== expectedCrc) {
      throw new Error(`Invalid PNG CRC for ${type}.`);
    }
    chunks.push({ type, data: png.subarray(offset + 8, offset + 8 + length) });
    offset = end;
  }
  const ihdr = chunks.find(({ type }) => type === "IHDR");
  if (!ihdr || ihdr.data.length !== 13) throw new Error("Invalid PNG IHDR.");
  return {
    width: ihdr.data.readUInt32BE(0),
    height: ihdr.data.readUInt32BE(4),
    bitDepth: ihdr.data[8],
    colourType: ihdr.data[9],
    chunks,
  };
};

const parseIco = (ico) => {
  if (ico.length < 6) throw new Error("ICO header is truncated.");
  if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) {
    throw new Error("ICO header is invalid.");
  }
  const count = ico.readUInt16LE(4);
  if (ico.length < 6 + count * 16) throw new Error("ICO directory is truncated.");
  return Array.from({ length: count }, (_, index) => {
    const directoryOffset = 6 + index * 16;
    const width = ico[directoryOffset] || 256;
    const height = ico[directoryOffset + 1] || 256;
    const length = ico.readUInt32LE(directoryOffset + 8);
    const offset = ico.readUInt32LE(directoryOffset + 12);
    if (offset < 6 + count * 16 || offset + length > ico.length) {
      throw new Error(`ICO entry ${index + 1} has invalid bounds.`);
    }
    return {
      width,
      height,
      planes: ico.readUInt16LE(directoryOffset + 4),
      bitCount: ico.readUInt16LE(directoryOffset + 6),
      length,
      offset,
      data: ico.subarray(offset, offset + length),
    };
  });
};

const source = await readFile(sourcePath);
const sourceHash = sha256(source);
check(
  "approved source-master hash",
  sourceHash === expectedSourceHash,
  `${sourceHash}; expected ${expectedSourceHash}.`,
);

const candidates = await Promise.all(
  sizes.map(async (size) => {
    const name = `favicon-${size}x${size}.png`;
    const png = await readFile(path.join(brandDirectory, name));
    let parsed;
    try {
      parsed = parsePng(png);
      check(`${name}: PNG signature and structure`, true, "Valid PNG structure.");
    } catch (error) {
      check(`${name}: PNG signature and structure`, false, error.message);
      throw error;
    }
    const chunkNames = parsed.chunks.map(({ type }) => type);
    const srgb = parsed.chunks.filter(({ type }) => type === "sRGB");
    check(
      `${name}: dimensions`,
      parsed.width === size && parsed.height === size,
      `${parsed.width}×${parsed.height}; expected ${size}×${size}.`,
    );
    check(
      `${name}: 8-bit RGBA`,
      parsed.bitDepth === 8 && parsed.colourType === 6,
      `Bit depth ${parsed.bitDepth}; colour type ${parsed.colourType}.`,
    );
    check(
      `${name}: explicit standard sRGB`,
      srgb.length === 1 && srgb[0].data.length === 1 && srgb[0].data[0] === 0,
      `sRGB chunks: ${srgb.length}.`,
    );
    check(
      `${name}: no unnecessary metadata`,
      parsed.chunks.every(({ type }) => allowedChunks.has(type)),
      `Chunks: ${chunkNames.join(", ")}.`,
    );
    check(
      `${name}: approved production hash`,
      sha256(png) === expectedOutputHashes.get(size),
      `${sha256(png)}; expected ${expectedOutputHashes.get(size)}.`,
    );
    return {
      name,
      size,
      png,
      hash: sha256(png),
      dataUrl: `data:image/png;base64,${png.toString("base64")}`,
    };
  }),
);
const ico = await readFile(path.join(brandDirectory, "favicon.ico"));
check(
  "favicon.ico: approved production hash",
  sha256(ico) === expectedIcoHash,
  `${sha256(ico)}; expected ${expectedIcoHash}.`,
);

const expectedBounds = new Map([
  [16, [1, 2, 14, 13]],
  [32, [2, 4, 29, 27]],
  [48, [3, 6, 44, 41]],
  [64, [5, 9, 58, 55]],
]);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const candidate of candidates) {
    const metrics = await page.evaluate(
      async ({ source, size }) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas 2D context is unavailable.");
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, size, size).data;
        const corners = [
          pixels[3],
          pixels[(size - 1) * 4 + 3],
          pixels[((size - 1) * size) * 4 + 3],
          pixels[(size * size - 1) * 4 + 3],
        ];
        let transparent = 0;
        let opaque = 0;
        let partial = 0;
        let whiteFringe = 0;
        let minX = size;
        let minY = size;
        let maxX = -1;
        let maxY = -1;
        for (let index = 0; index < size * size; index += 1) {
          const offset = index * 4;
          const alpha = pixels[offset + 3];
          if (alpha === 0) transparent += 1;
          if (alpha === 255) opaque += 1;
          if (alpha > 0 && alpha < 255) {
            partial += 1;
            if (
              alpha >= 10 &&
              pixels[offset] > 220 &&
              pixels[offset + 1] > 220 &&
              pixels[offset + 2] > 220
            ) {
              whiteFringe += 1;
            }
          }
          if (alpha > 0) {
            const x = index % size;
            const y = Math.floor(index / size);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
        return {
          decoded: [image.naturalWidth, image.naturalHeight],
          corners,
          transparent,
          opaque,
          partial,
          whiteFringe,
          bounds: [minX, minY, maxX, maxY],
        };
      },
      { source: candidate.dataUrl, size: candidate.size },
    );
    check(
      `${candidate.name}: browser decode`,
      metrics.decoded[0] === candidate.size && metrics.decoded[1] === candidate.size,
      `Chromium decoded ${metrics.decoded.join("×")}.`,
    );
    check(
      `${candidate.name}: transparent corners`,
      metrics.corners.every((alpha) => alpha === 0),
      `Corner alpha: ${metrics.corners.join(", ")}.`,
    );
    check(
      `${candidate.name}: genuine alpha and no background rectangle`,
      metrics.transparent > 0 && metrics.opaque > 0 && metrics.partial > 0,
      `${metrics.transparent} transparent, ${metrics.opaque} opaque, ${metrics.partial} partial pixels.`,
    );
    check(
      `${candidate.name}: preserved transparent padding`,
      metrics.bounds.every(
        (value, index) => value === expectedBounds.get(candidate.size)[index],
      ),
      `Alpha bounds: ${metrics.bounds.join(", ")}; expected ${expectedBounds
        .get(candidate.size)
        .join(", ")}.`,
    );
    check(
      `${candidate.name}: no white fringe`,
      metrics.whiteFringe === 0,
      `${metrics.whiteFringe} near-white translucent pixels.`,
    );
    candidate.metrics = metrics;
  }
  const icoDecode = await page.evaluate(async (sourceUrl) => {
    const image = new Image();
    image.src = sourceUrl;
    await image.decode();
    return [image.naturalWidth, image.naturalHeight];
  }, `data:image/x-icon;base64,${ico.toString("base64")}`);
  check(
    "favicon.ico: Chromium browser decode",
    icoDecode[0] === 64 && icoDecode[1] === 64,
    `Chromium decoded the largest entry as ${icoDecode.join("×")}.`,
  );
} finally {
  await browser.close();
}

let icoEntries = [];
try {
  icoEntries = parseIco(ico);
  check("favicon.ico: valid header and directory", true, "Valid ICO structure.");
} catch (error) {
  check("favicon.ico: valid header and directory", false, error.message);
  throw error;
}
check(
  "favicon.ico: four entries",
  icoEntries.length === 4,
  `${icoEntries.length} entries.`,
);
icoEntries.forEach((entry, index) => {
  const candidate = candidates[index];
  const expectedOffset =
    6 +
    icoEntries.length * 16 +
    candidates
      .slice(0, index)
      .reduce((total, value) => total + value.png.length, 0);
  check(
    `favicon.ico: ${candidate.size}×${candidate.size} directory entry`,
    entry.width === candidate.size &&
      entry.height === candidate.size &&
      entry.planes === 1 &&
      entry.bitCount === 32,
    `${entry.width}×${entry.height}, ${entry.planes} plane, ${entry.bitCount}-bit.`,
  );
  check(
    `favicon.ico: ${candidate.size}×${candidate.size} embedded PNG equality`,
    entry.offset === expectedOffset &&
      entry.length === candidate.png.length &&
      entry.data.equals(candidate.png),
    `Offset ${entry.offset}; expected ${expectedOffset}. ${entry.length} embedded bytes; ${candidate.png.length} source bytes.`,
  );
});
const expectedEnd = icoEntries.at(-1)?.offset + icoEntries.at(-1)?.length;
check(
  "favicon.ico: exact offsets and length",
  expectedEnd === ico.length,
  `Last entry ends at ${expectedEnd}; file length ${ico.length}.`,
);

const failed = checks.filter(({ passed }) => !passed);
const report = [
  "# Favicon Production Asset Technical Validation",
  "",
  `Source master SHA-256: \`${sourceHash}\``,
  "",
  "## Output hashes",
  "",
  ...candidates.map(
    ({ name, size, hash }) =>
      `- \`public/brand/${name}\` — ${size}×${size} — \`${hash}\``,
  ),
  `- \`public/brand/favicon.ico\` — four PNG entries — \`${sha256(ico)}\``,
  "",
  "## Checks",
  "",
  ...checks.map(
    ({ name, passed, detail }) =>
      `- ${passed ? "PASS" : "FAIL"} — **${name}:** ${detail}`,
  ),
  "",
  `Result: **${failed.length === 0 ? "PASS" : "FAIL"}**`,
  "",
].join("\n");

if (process.argv.includes("--write-report")) {
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, "utf8");
}
console.log(report);
if (failed.length > 0) process.exitCode = 1;
