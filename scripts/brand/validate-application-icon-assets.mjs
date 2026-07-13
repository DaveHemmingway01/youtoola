import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const root = process.cwd();
const brandDirectory = path.join(root, "public/brand");
const reportPath = path.join(
  root,
  "docs/brand/reviews/application-icons/technical-validation-report.md",
);
const expectedSourceHash =
  "c240dd3396a4d9c766b1d772e5bc4b6d148a89a337b88b8ca69b12daab9e326c";
const sourcePath = path.join(brandDirectory, "youtoola-symbol.png");
const background = [0, 10, 63, 255];
const specs = [
  {
    name: "apple-touch-icon.png",
    size: 180,
    scale: 0.75,
    expectedBounds: [33, 41, 146, 139],
  },
  {
    name: "icon-192.png",
    size: 192,
    scale: 23 / 32,
    expectedBounds: [38, 46, 153, 146],
  },
  {
    name: "icon-512.png",
    size: 512,
    scale: 23 / 32,
    expectedBounds: [101, 123, 410, 392],
  },
];
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
    const expectedCrc = png.readUInt32BE(offset + 8 + length);
    if (crc32(png.subarray(offset + 4, offset + 8 + length)) !== expectedCrc) {
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

const source = await readFile(sourcePath);
const sourceHashBefore = sha256(source);
check(
  "approved source-master hash before validation",
  sourceHashBefore === expectedSourceHash,
  `${sourceHashBefore}; expected ${expectedSourceHash}.`,
);

const assets = await Promise.all(
  specs.map(async (spec) => {
    const png = await readFile(path.join(brandDirectory, spec.name));
    const parsed = parsePng(png);
    const srgb = parsed.chunks.filter(({ type }) => type === "sRGB");
    check(`${spec.name}: valid PNG`, true, "Signature, chunks and CRCs are valid.");
    check(
      `${spec.name}: dimensions`,
      parsed.width === spec.size && parsed.height === spec.size,
      `${parsed.width}×${parsed.height}; expected ${spec.size}×${spec.size}.`,
    );
    check(
      `${spec.name}: 8-bit RGBA`,
      parsed.bitDepth === 8 && parsed.colourType === 6,
      `Bit depth ${parsed.bitDepth}; colour type ${parsed.colourType}.`,
    );
    check(
      `${spec.name}: explicit standard sRGB`,
      srgb.length === 1 && srgb[0].data.length === 1 && srgb[0].data[0] === 0,
      `sRGB chunks: ${srgb.length}.`,
    );
    check(
      `${spec.name}: no unexpected metadata`,
      parsed.chunks.every(({ type }) => allowedChunks.has(type)),
      `Chunks: ${parsed.chunks.map(({ type }) => type).join(", ")}.`,
    );
    return {
      ...spec,
      png,
      hash: sha256(png),
      dataUrl: `data:image/png;base64,${png.toString("base64")}`,
    };
  }),
);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const asset of assets) {
    const metrics = await page.evaluate(
      async ({ source, size, background }) => {
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
          Array.from(pixels.subarray(0, 4)),
          Array.from(pixels.subarray((size - 1) * 4, size * 4)),
          Array.from(
            pixels.subarray((size - 1) * size * 4, (size - 1) * size * 4 + 4),
          ),
          Array.from(pixels.subarray((size * size - 1) * 4, size * size * 4)),
        ];
        let opaque = 0;
        let minX = size;
        let minY = size;
        let maxX = -1;
        let maxY = -1;
        let maxRadius = 0;
        let edgeMismatch = 0;
        for (let index = 0; index < size * size; index += 1) {
          const offset = index * 4;
          const x = index % size;
          const y = Math.floor(index / size);
          if (pixels[offset + 3] === 255) opaque += 1;
          const differs =
            pixels[offset] !== background[0] ||
            pixels[offset + 1] !== background[1] ||
            pixels[offset + 2] !== background[2];
          if (differs) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            maxRadius = Math.max(
              maxRadius,
              Math.hypot(x - (size - 1) / 2, y - (size - 1) / 2),
            );
          }
          if (
            (x === 0 || y === 0 || x === size - 1 || y === size - 1) &&
            (differs || pixels[offset + 3] !== 255)
          ) {
            edgeMismatch += 1;
          }
        }
        return {
          decoded: [image.naturalWidth, image.naturalHeight],
          corners,
          opaque,
          bounds: [minX, minY, maxX, maxY],
          maxRadialPercent: (maxRadius / size) * 100,
          edgeMismatch,
        };
      },
      { source: asset.dataUrl, size: asset.size, background },
    );
    check(
      `${asset.name}: browser decode`,
      metrics.decoded[0] === asset.size && metrics.decoded[1] === asset.size,
      `Chromium decoded ${metrics.decoded.join("×")}.`,
    );
    check(
      `${asset.name}: approved opaque corners`,
      metrics.corners.every((corner) =>
        corner.every((value, index) => value === background[index]),
      ),
      `Corners: ${metrics.corners.map((corner) => corner.join(",")).join(" | ")}.`,
    );
    check(
      `${asset.name}: fully opaque canvas`,
      metrics.opaque === asset.size * asset.size,
      `${metrics.opaque} of ${asset.size * asset.size} pixels are opaque.`,
    );
    check(
      `${asset.name}: exact symbol contribution bounds`,
      metrics.bounds.every(
        (value, index) => value === asset.expectedBounds[index],
      ),
      `${metrics.bounds.join(", ")}; expected ${asset.expectedBounds.join(", ")}.`,
    );
    check(
      `${asset.name}: maskable safe-area radius`,
      metrics.maxRadialPercent <= 40,
      `${metrics.maxRadialPercent.toFixed(2)}% maximum radius; limit 40%.`,
    );
    if (asset.size !== 180) {
      const contributionWidth = metrics.bounds[2] - metrics.bounds[0] + 1;
      check(
        `${asset.name}: Android 66/108 width safe area`,
        contributionWidth / asset.size <= 66 / 108,
        `${((contributionWidth / asset.size) * 100).toFixed(2)}% contribution width; limit ${((66 / 108) * 100).toFixed(2)}%.`,
      );
    }
    check(
      `${asset.name}: no background seams`,
      metrics.edgeMismatch === 0,
      `${metrics.edgeMismatch} outer-edge mismatches.`,
    );
    asset.metrics = metrics;
  }
} finally {
  await browser.close();
}

const sourceHashAfter = sha256(await readFile(sourcePath));
check(
  "approved source-master hash after validation",
  sourceHashAfter === expectedSourceHash,
  `${sourceHashAfter}; expected ${expectedSourceHash}.`,
);

const failed = checks.filter(({ passed }) => !passed);
const report = [
  "# Application Icon Candidate Technical Validation",
  "",
  `Source master SHA-256: \`${sourceHashBefore}\``,
  "",
  "## Candidate hashes",
  "",
  ...assets.map(
    ({ name, size, hash }) =>
      `- \`public/brand/${name}\` — ${size}×${size} — \`${hash}\``,
  ),
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
