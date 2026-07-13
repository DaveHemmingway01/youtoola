import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const root = process.cwd();
const reportPath = path.join(
  root,
  "docs/brand/reviews/raster-production/technical-validation-report.md",
);
const expected = [
  ["youtoola-logo.png", 3000, 819],
  ["youtoola-logo-1500.png", 1500, 410],
  ["youtoola-logo-750.png", 750, 205],
  ["youtoola-symbol.png", 2048, 2048],
  ["youtoola-symbol-1024.png", 1024, 1024],
  ["youtoola-symbol-512.png", 512, 512],
];
const checks = [];
const check = (name, condition, detail) =>
  checks.push({ name, passed: Boolean(condition), detail });

const assets = await Promise.all(
  expected.map(async ([name, width, height]) => {
    const filePath = path.join(root, "public/brand", name);
    const buffer = await readFile(filePath);
    const pngSignature = buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    const actualWidth = buffer.readUInt32BE(16);
    const actualHeight = buffer.readUInt32BE(20);
    const bitDepth = buffer[24];
    const colourType = buffer[25];
    const hasSrgbDeclaration = buffer.includes(Buffer.from("sRGB"));
    check(`${name}: PNG signature`, pngSignature, "Valid PNG signature.");
    check(
      `${name}: dimensions`,
      actualWidth === width && actualHeight === height,
      `${actualWidth}×${actualHeight}; expected ${width}×${height}.`,
    );
    check(
      `${name}: 8-bit RGBA`,
      bitDepth === 8 && colourType === 6,
      `IHDR bit depth ${bitDepth}, colour type ${colourType}.`,
    );
    check(
      `${name}: explicit sRGB`,
      hasSrgbDeclaration,
      "Standard sRGB rendering-intent chunk is present.",
    );
    return {
      name,
      width,
      height,
      dataUrl: `data:image/png;base64,${buffer.toString("base64")}`,
    };
  }),
);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const asset of assets) {
    const metrics = await page.evaluate(async ({ source, width, height }) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas 2D context is unavailable.");
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      const corners = [
        3,
        (width - 1) * 4 + 3,
        ((height - 1) * width) * 4 + 3,
        (height * width - 1) * 4 + 3,
      ].map((index) => pixels[index]);
      let transparent = 0;
      let opaque = 0;
      let partial = 0;
      let whiteFringe = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        const alpha = pixels[index + 3];
        if (alpha === 0) transparent += 1;
        if (alpha === 255) opaque += 1;
        if (alpha > 0 && alpha < 255) {
          partial += 1;
          if (
            alpha >= 10 &&
            pixels[index] > 220 &&
            pixels[index + 1] > 220 &&
            pixels[index + 2] > 220
          ) {
            whiteFringe += 1;
          }
        }
      }
      return {
        decodedWidth: image.naturalWidth,
        decodedHeight: image.naturalHeight,
        corners,
        transparent,
        opaque,
        partial,
        whiteFringe,
        total: width * height,
      };
    }, { source: asset.dataUrl, width: asset.width, height: asset.height });
    check(
      `${asset.name}: browser decode`,
      metrics.decodedWidth === asset.width && metrics.decodedHeight === asset.height,
      `Chromium decoded ${metrics.decodedWidth}×${metrics.decodedHeight}.`,
    );
    check(
      `${asset.name}: transparent corners`,
      metrics.corners.every((alpha) => alpha === 0),
      `Corner alpha values: ${metrics.corners.join(", ")}.`,
    );
    check(
      `${asset.name}: genuine alpha channel`,
      metrics.transparent > 0 && metrics.opaque > 0 && metrics.partial > 0,
      `${metrics.transparent} transparent, ${metrics.opaque} opaque, ${metrics.partial} partially transparent pixels.`,
    );
    check(
      `${asset.name}: no opaque background rectangle`,
      metrics.transparent / metrics.total > 0.05,
      `${((metrics.transparent / metrics.total) * 100).toFixed(2)}% fully transparent pixels.`,
    );
    check(
      `${asset.name}: no white edge fringe`,
      metrics.whiteFringe === 0,
      `${metrics.whiteFringe} partially transparent near-white pixels detected.`,
    );
  }
} finally {
  await browser.close();
}

const failed = checks.filter(({ passed }) => !passed);
const report = [
  "# Raster Brand Candidate Technical Validation",
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
