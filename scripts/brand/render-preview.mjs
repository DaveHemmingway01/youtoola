import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const root = process.cwd();
const reviewDirectory = path.join(root, "docs/brand/reviews/raster-production");
await mkdir(reviewDirectory, { recursive: true });

const readDataUrl = async (filePath, mime) => {
  const value = await readFile(path.join(root, filePath));
  return `data:${mime};base64,${value.toString("base64")}`;
};
const [logoReference, symbolReference, logoCandidate, symbolCandidate] =
  await Promise.all([
    readDataUrl("docs/brand/references/youtoola-logo.jpg", "image/jpeg"),
    readDataUrl("docs/brand/references/youtoola-symbol.jpg", "image/jpeg"),
    readDataUrl("public/brand/youtoola-logo.png", "image/png"),
    readDataUrl("public/brand/youtoola-symbol.png", "image/png"),
  ]);

const browser = await chromium.launch({ headless: true });
const utilityPage = await browser.newPage();

const alignedReference = async ({
  source,
  canvasWidth,
  canvasHeight,
  sourceCrop,
  destination,
}) =>
  utilityPage.evaluate(
    async ({ source, canvasWidth, canvasHeight, sourceCrop, destination }) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas 2D context is unavailable.");
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        image,
        sourceCrop.x,
        sourceCrop.y,
        sourceCrop.width,
        sourceCrop.height,
        destination.x,
        destination.y,
        destination.width,
        destination.height,
      );
      return canvas.toDataURL("image/png");
    },
    { source, canvasWidth, canvasHeight, sourceCrop, destination },
  );

const logoScale = 3000 / (1487 + 30);
const alignedLogoReference = await alignedReference({
  source: logoReference,
  canvasWidth: 3000,
  canvasHeight: 819,
  sourceCrop: { x: 20, y: 9, width: 1487, height: 384 },
  destination: {
    x: 15 * logoScale,
    y: 15 * logoScale,
    width: 1487 * logoScale,
    height: 384 * logoScale,
  },
});
const alignedSymbolReference = await alignedReference({
  source: symbolReference,
  canvasWidth: 2048,
  canvasHeight: 2048,
  sourceCrop: { x: 6, y: 9, width: 375, height: 326 },
  destination: {
    x: 164,
    y: 290.0333938118996,
    width: 1720,
    height: 1495.2533333333333,
  },
});

const compare = async (reference, candidate, width, height) =>
  utilityPage.evaluate(
    async ({ reference, candidate, width, height }) => {
      const load = async (source, background) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas 2D context is unavailable.");
        if (background) {
          context.fillStyle = background;
          context.fillRect(0, 0, width, height);
        }
        context.drawImage(image, 0, 0, width, height);
        return context.getImageData(0, 0, width, height).data;
      };
      const referencePixels = await load(reference, null);
      const candidatePixels = await load(candidate, null);
      const differenceCanvas = document.createElement("canvas");
      differenceCanvas.width = width;
      differenceCanvas.height = height;
      const differenceContext = differenceCanvas.getContext("2d");
      if (!differenceContext) throw new Error("Difference context is unavailable.");
      const differencePixels = differenceContext.createImageData(width, height);
      const alphaCanvas = document.createElement("canvas");
      alphaCanvas.width = width;
      alphaCanvas.height = height;
      const alphaContext = alphaCanvas.getContext("2d");
      if (!alphaContext) throw new Error("Alpha context is unavailable.");
      const alphaPixels = alphaContext.createImageData(width, height);
      let intersection = 0;
      let union = 0;
      let colourDifference = 0;
      let partialPixels = 0;
      let whiteFringePixels = 0;
      for (let index = 0; index < referencePixels.length; index += 4) {
        const candidateAlpha = candidatePixels[index + 3] / 255;
        const referenceOpaque =
          Math.max(
            255 - referencePixels[index],
            255 - referencePixels[index + 1],
            255 - referencePixels[index + 2],
          ) > 20;
        const candidateOpaque = candidatePixels[index + 3] >= 8;
        if (referenceOpaque || candidateOpaque) union += 1;
        if (referenceOpaque && candidateOpaque) {
          intersection += 1;
        }
        const composited = [0, 1, 2].map(
          (channel) =>
            candidatePixels[index + channel] * candidateAlpha +
            255 * (1 - candidateAlpha),
        );
        if (referenceOpaque || candidateOpaque) {
          colourDifference +=
            Math.abs(referencePixels[index] - composited[0]) +
            Math.abs(referencePixels[index + 1] - composited[1]) +
            Math.abs(referencePixels[index + 2] - composited[2]);
        }
        const difference = Math.min(
          255,
          ((Math.abs(referencePixels[index] - composited[0]) +
            Math.abs(referencePixels[index + 1] - composited[1]) +
            Math.abs(referencePixels[index + 2] - composited[2])) /
            3) *
            8,
        );
        differencePixels.data[index] = difference;
        differencePixels.data[index + 1] = Math.max(0, difference * 1.5 - 128);
        differencePixels.data[index + 2] = 0;
        differencePixels.data[index + 3] = 255;
        const alpha = candidatePixels[index + 3];
        alphaPixels.data[index] = alpha;
        alphaPixels.data[index + 1] = alpha;
        alphaPixels.data[index + 2] = alpha;
        alphaPixels.data[index + 3] = 255;
        if (alpha > 0 && alpha < 255) {
          partialPixels += 1;
          if (
            alpha >= 10 &&
            candidatePixels[index] > 220 &&
            candidatePixels[index + 1] > 220 &&
            candidatePixels[index + 2] > 220
          ) {
            whiteFringePixels += 1;
          }
        }
      }
      differenceContext.putImageData(differencePixels, 0, 0);
      alphaContext.putImageData(alphaPixels, 0, 0);
      return {
        silhouetteIou: intersection / union,
        meanRgbChannelDifference: colourDifference / Math.max(1, union) / 3,
        partialPixels,
        whiteFringePixels,
        differenceDataUrl: differenceCanvas.toDataURL("image/png"),
        alphaDataUrl: alphaCanvas.toDataURL("image/png"),
      };
    },
    { reference, candidate, width, height },
  );

const [logoComparison, symbolComparison] = await Promise.all([
  compare(alignedLogoReference, logoCandidate, 3000, 819),
  compare(alignedSymbolReference, symbolCandidate, 2048, 2048),
]);

const cropOnBackground = async ({ source, crop, background, scale }) =>
  utilityPage.evaluate(
    async ({ source, crop, background, scale }) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = crop.width * scale;
      canvas.height = crop.height * scale;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas 2D context is unavailable.");
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = false;
      context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      return canvas.toDataURL("image/png");
    },
    { source, crop, background, scale },
  );
const edgePatches = await Promise.all([
  cropOnBackground({
    source: logoCandidate,
    crop: { x: 20, y: 20, width: 220, height: 170 },
    background: "#000A3F",
    scale: 4,
  }),
  cropOnBackground({
    source: logoCandidate,
    crop: { x: 520, y: 500, width: 220, height: 170 },
    background: "#000A3F",
    scale: 4,
  }),
]);

const screenshot = async ({ name, html, width, height }) => {
  const page = await browser.newPage({ viewport: { width, height } });
  try {
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));
    await page.screenshot({ path: path.join(reviewDirectory, name) });
  } finally {
    await page.close();
  }
};
const base = `*{box-sizing:border-box}html,body{margin:0;font:18px Arial,sans-serif;color:#000A3F}img{display:block;max-width:100%;height:auto}`;
const panels = (left, right, leftLabel, rightLabel) => `<style>${base}body{padding:40px;background:#F5F7FB}.grid{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:28px}figure{margin:0;padding:30px;background:#FFF;border:1px solid #D6DCE8;border-radius:16px;display:grid;align-content:center;gap:24px}figcaption{text-align:center;font-weight:700}</style><div class="grid"><figure><img src="${left}" alt="${leftLabel}"><figcaption>${leftLabel}</figcaption></figure><figure><img src="${right}" alt="${rightLabel}"><figcaption>${rightLabel}</figcaption></figure></div>`;
const overlay = (reference, candidate, aspect, label) => `<style>${base}body{display:grid;place-items:center;background:#FFF}.frame{position:relative;width:1200px;aspect-ratio:${aspect};border:1px solid #D6DCE8}.frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}.candidate{opacity:.5}p{position:absolute;bottom:22px;margin:0;font-weight:700}</style><div class="frame"><img src="${reference}" alt="Reference"><img class="candidate" src="${candidate}" alt="Candidate"></div><p>${label}</p>`;

try {
  await screenshot({
    name: "original-beside-transparent-on-white.png",
    width: 1500,
    height: 700,
    html: panels(logoReference, logoCandidate, "Approved JPG", "Transparent production candidate on white"),
  });
  for (const [name, background, label, foreground] of [
    ["logo-soft-off-white.png", "#F7F9FC", "Soft off-white — #F7F9FC", "#000A3F"],
    ["logo-dark-navy.png", "#000A3F", "Dark navy — #000A3F", "#FFFFFF"],
    ["logo-neutral-grey.png", "#D8DCE5", "Neutral grey — #D8DCE5", "#000A3F"],
  ]) {
    await screenshot({
      name,
      width: 1200,
      height: 460,
      html: `<style>${base}html,body{width:100%;height:100%;background:${background};color:${foreground}}body{display:grid;place-items:center}figure{width:1000px;margin:0}figcaption{text-align:center;margin-top:28px;font-weight:700}</style><figure><img src="${logoCandidate}" alt="Transparent logo"><figcaption>${label}</figcaption></figure>`,
    });
  }
  await screenshot({
    name: "logo-overlay-50-50.png",
    width: 1400,
    height: 520,
    html: overlay(alignedLogoReference, logoCandidate, "3000/819", "Approved JPG base + transparent candidate at 50%"),
  });
  await screenshot({
    name: "symbol-overlay-50-50.png",
    width: 900,
    height: 1000,
    html: overlay(alignedSymbolReference, symbolCandidate, "1/1", "Approved symbol JPG base + transparent candidate at 50%"),
  });
  await screenshot({
    name: "absolute-difference.png",
    width: 1400,
    height: 520,
    html: `<style>${base}body{display:grid;place-items:center;background:#111;color:#FFF}img{width:1200px}p{position:absolute;bottom:22px;margin:0;font-weight:700}</style><img src="${logoComparison.differenceDataUrl}" alt="Absolute difference"><p>Black = exact or near-exact; red/yellow = larger RGB difference (8× amplified)</p>`,
  });
  const logoWidths = [120, 160, 240, 375, 750];
  await screenshot({
    name: "logo-contact-sheet.png",
    width: 1000,
    height: 1000,
    html: `<style>${base}body{padding:28px 48px;background:#F5F7FB}.row{min-height:138px;display:grid;grid-template-columns:90px 1fr;align-items:center;border-bottom:1px solid #D6DCE8}.logo{width:var(--width)}</style>${logoWidths.map((width) => `<div class="row"><strong>${width}px</strong><img class="logo" style="--width:${width}px" src="${logoCandidate}" alt="Logo ${width}px"></div>`).join("")}`,
  });
  const symbolWidths = [16, 24, 32, 48, 64, 128, 512];
  await screenshot({
    name: "symbol-contact-sheet.png",
    width: 1000,
    height: 1300,
    html: `<style>${base}body{padding:28px 48px;background:#F5F7FB}.row{min-height:96px;display:grid;grid-template-columns:90px 1fr;align-items:center;border-bottom:1px solid #D6DCE8}.row:last-child{min-height:550px}.symbol{width:var(--width)}</style>${symbolWidths.map((width) => `<div class="row"><strong>${width}px</strong><img class="symbol" style="--width:${width}px" src="${symbolCandidate}" alt="Symbol ${width}px"></div>`).join("")}`,
  });
  await screenshot({
    name: "alpha-channel-visualization.png",
    width: 1400,
    height: 520,
    html: `<style>${base}body{display:grid;place-items:center;background:#222;color:#FFF}img{width:1200px;border:1px solid #555}p{position:absolute;bottom:22px;margin:0;font-weight:700}</style><img src="${logoComparison.alphaDataUrl}" alt="Alpha channel"><p>White = opaque; black = transparent; grey = antialiased alpha edge</p>`,
  });
  await screenshot({
    name: "edge-fringe-inspection-400-percent.png",
    width: 1900,
    height: 900,
    html: `<style>${base}body{padding:28px;background:#F5F7FB}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}figure{margin:0;background:#000A3F;border:1px solid #D6DCE8;padding:16px}img{width:100%;image-rendering:pixelated}figcaption{padding:14px;color:#FFF;text-align:center;font-weight:700}</style><div class="grid"><figure><img src="${edgePatches[0]}" alt="Outer edge at 400 percent"><figcaption>Outer rounded edge at 400%</figcaption></figure><figure><img src="${edgePatches[1]}" alt="Inner edge at 400 percent"><figcaption>Inner cut-out and dot edge at 400%</figcaption></figure></div>`,
  });

  const report = `# Raster Production Comparison Report

## Processing method

- The approved JPGs are decoded as sRGB source appearance.
- White-background removal uses a 4-pixel local edge neighbourhood, maximum-channel distance from white, reconstructed alpha, and inverse white-matte colour decontamination.
- Pixels below the controlled noise floor are discarded; near-opaque interior pixels are preserved as opaque.
- The largest PNG in each family is produced first with Chromium/Skia high-quality deterministic resampling. Smaller files are derived only from that largest transparent master.
- No tracing, font substitution, recolouring, generative processing, sharpening, or new artwork is used.

## Output geometry

- Logo source artwork bounds: 1487×384 pixels; 15 source-pixel padding (3.91% of artwork height).
- Logo master: 3000×819; derivatives: 1500×410 and 750×205.
- Symbol source artwork bounds: 375×326 pixels.
- Symbol master: 2048×2048; 164-pixel minimum horizontal padding (8.01%); artwork remains proportional at 1720×1495.25 and is optically centred using its alpha-weighted centroid, constrained by minimum padding.
- Symbol derivatives: 1024×1024 and 512×512.

## Visual comparison

- Logo silhouette agreement: ${(logoComparison.silhouetteIou * 100).toFixed(2)}%.
- Symbol silhouette agreement: ${(symbolComparison.silhouetteIou * 100).toFixed(2)}%.
- Logo mean RGB-channel deviation after compositing both at matching scale on white: ${logoComparison.meanRgbChannelDifference.toFixed(2)}/255 across artwork pixels.
- Symbol mean RGB-channel deviation: ${symbolComparison.meanRgbChannelDifference.toFixed(2)}/255.
- Logo partially transparent antialiasing pixels: ${logoComparison.partialPixels.toLocaleString("en-US")}.
- Symbol partially transparent antialiasing pixels: ${symbolComparison.partialPixels.toLocaleString("en-US")}.
- Near-white partially transparent fringe pixels detected: logo ${logoComparison.whiteFringePixels}; symbol ${symbolComparison.whiteFringePixels}.

## Remaining limitations

- JPEG compression noise and the absence of the original alpha matte make edge reconstruction inherently approximate at subpixel level.
- Very small symbol renders inherit the approved raster geometry and may lose gradient detail through normal downsampling.
- The dark-background preview is for halo inspection. The dark navy wordmark has insufficient contrast there; a later approved monochrome light variant is required for dark interfaces.
`;
  await writeFile(
    path.join(reviewDirectory, "processing-and-comparison-report.md"),
    report,
    "utf8",
  );
} finally {
  await utilityPage.close();
  await browser.close();
}

console.log(`Rendered raster reviews in ${path.relative(root, reviewDirectory)}`);
