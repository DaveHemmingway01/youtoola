import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";

import {
  APPROVED_LOGO_HASH,
  OG_DEFAULT_SPEC,
  renderOgDefault,
} from "./generate-og-default.mjs";

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const allowedChunks = new Set(["IHDR", "sRGB", "IDAT", "IEND"]);
const background = [0, 10, 63, 255];

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

export function parsePng(png) {
  if (!png.subarray(0, 8).equals(signature)) throw new Error("Invalid PNG signature.");
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
    chunks.push({ data: png.subarray(offset + 8, offset + 8 + length), type });
    offset = end;
  }
  const ihdr = chunks.find(({ type }) => type === "IHDR");
  if (!ihdr || ihdr.data.length !== 13) throw new Error("Invalid PNG IHDR.");
  return {
    bitDepth: ihdr.data[8],
    chunks,
    colourType: ihdr.data[9],
    height: ihdr.data.readUInt32BE(4),
    width: ihdr.data.readUInt32BE(0),
  };
}

export function validateStaticOgAsset(png) {
  const checks = [];
  const check = (name, passed, detail) =>
    checks.push({ detail, name, passed: Boolean(passed) });
  let parsed;
  try {
    parsed = parsePng(png);
    check("valid PNG", true, "Signature, chunks and CRCs are valid.");
  } catch (error) {
    check("valid PNG", false, error instanceof Error ? error.message : "Invalid PNG.");
    return checks;
  }
  const srgb = parsed.chunks.filter(({ type }) => type === "sRGB");
  check(
    "dimensions",
    parsed.width === OG_DEFAULT_SPEC.width && parsed.height === OG_DEFAULT_SPEC.height,
    `${parsed.width}×${parsed.height}; expected 1200×630.`,
  );
  check(
    "8-bit RGBA",
    parsed.bitDepth === 8 && parsed.colourType === 6,
    `Bit depth ${parsed.bitDepth}; colour type ${parsed.colourType}.`,
  );
  check(
    "explicit standard sRGB",
    srgb.length === 1 && srgb[0].data.length === 1 && srgb[0].data[0] === 0,
    `sRGB chunks: ${srgb.length}.`,
  );
  check(
    "no unexpected metadata",
    parsed.chunks.every(({ type }) => allowedChunks.has(type)),
    `Chunks: ${parsed.chunks.map(({ type }) => type).join(", ")}.`,
  );
  check(
    "compression target",
    png.length < 250 * 1024,
    `${png.length} bytes; target below ${250 * 1024} bytes.`,
  );
  return checks;
}

async function inspectPixels(png) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    return await page.evaluate(async ({ background, source, spec }) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = spec.width;
      canvas.height = spec.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas 2D context is unavailable.");
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, spec.width, spec.height).data;
      let opaque = 0;
      let safeMarginMismatch = 0;
      for (let y = 0; y < spec.height; y += 1) {
        for (let x = 0; x < spec.width; x += 1) {
          const offset = (y * spec.width + x) * 4;
          if (pixels[offset + 3] === 255) opaque += 1;
          const inOuterSafeMargin =
            x < spec.safeMargin.horizontal ||
            x >= spec.width - spec.safeMargin.horizontal ||
            y < spec.safeMargin.vertical ||
            y >= spec.height - spec.safeMargin.vertical;
          if (inOuterSafeMargin && (
            pixels[offset] !== background[0] ||
            pixels[offset + 1] !== background[1] ||
            pixels[offset + 2] !== background[2] ||
            pixels[offset + 3] !== background[3]
          )) safeMarginMismatch += 1;
        }
      }
      const corners = [
        0,
        (spec.width - 1) * 4,
        (spec.height - 1) * spec.width * 4,
        (spec.width * spec.height - 1) * 4,
      ].map((offset) => Array.from(pixels.subarray(offset, offset + 4)));
      return {
        corners,
        decoded: [image.naturalWidth, image.naturalHeight],
        opaque,
        safeMarginMismatch,
      };
    }, {
      background,
      source: `data:image/png;base64,${png.toString("base64")}`,
      spec: OG_DEFAULT_SPEC,
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  const root = process.cwd();
  const assetPath = path.join(root, "public/brand/og-default.png");
  const logoPath = path.join(root, "public/brand/youtoola-logo.png");
  const reportPath = path.join(root, "docs/brand/reviews/og-default/technical-validation-report.md");
  const png = await readFile(assetPath);
  const logo = await readFile(logoPath);
  const checks = [...validateStaticOgAsset(png)];
  const check = (name, passed, detail) =>
    checks.push({ detail, name, passed: Boolean(passed) });

  check(
    "frozen logo hash",
    sha256(logo) === APPROVED_LOGO_HASH,
    `${sha256(logo)}; expected ${APPROVED_LOGO_HASH}.`,
  );
  const metrics = await inspectPixels(png);
  check(
    "browser decode",
    metrics.decoded[0] === 1200 && metrics.decoded[1] === 630,
    `Chromium decoded ${metrics.decoded.join("×")}.`,
  );
  check(
    "opaque canvas",
    metrics.opaque === 1200 * 630,
    `${metrics.opaque} of ${1200 * 630} pixels are opaque.`,
  );
  check(
    "approved navy corners",
    metrics.corners.every((corner) => corner.every((value, index) => value === background[index])),
    metrics.corners.map((corner) => corner.join(",")).join(" | "),
  );
  check(
    "safe margins",
    metrics.safeMarginMismatch === 0,
    `${metrics.safeMarginMismatch} non-background pixels inside the outer 80×60px safe margin.`,
  );
  const regenerated = await renderOgDefault(logo);
  check(
    "deterministic regeneration",
    regenerated.equals(png),
    `Candidate ${sha256(png)}; regenerated ${sha256(regenerated)}.`,
  );

  const failed = checks.filter(({ passed }) => !passed);
  const report = [
    "# Default Open Graph Candidate Validation",
    "",
    `Candidate SHA-256: \`${sha256(png)}\``,
    `Frozen logo SHA-256: \`${sha256(logo)}\``,
    "",
    ...checks.map(({ detail, name, passed }) =>
      `- ${passed ? "PASS" : "FAIL"} — **${name}:** ${detail}`),
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
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
