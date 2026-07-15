import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { inflateRawSync } from "node:zlib";

import { chromium } from "playwright";

export const OG_DEFAULT_SPEC = Object.freeze({
  background: "#000A3F",
  height: 630,
  logoPanel: Object.freeze({ height: 300, radius: 32, width: 1020, x: 90, y: 96 }),
  logoRender: Object.freeze({ width: 900, x: 150, y: 123 }),
  safeMargin: Object.freeze({ horizontal: 80, vertical: 60 }),
  tagline: "Useful tools. No account. No nonsense.",
  taglineBaseline: 505,
  width: 1200,
});

export const APPROVED_LOGO_HASH =
  "d2e096a9c186027ecdc576281b7b5c71488dda007f37c122172e471bbd749a05";

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// Frozen RGB pixels for the owner-approved tagline. Keeping the approved
// lettering as pixels avoids platform font substitution while preserving the
// production asset byte-for-byte across Chromium hosts.
const approvedTaglineLayer = Object.freeze({
  data: "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",
  height: 33,
  width: 787,
  x: 207,
  y: 473,
});

export const sha256 = (buffer) =>
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

export function normalizePng(png) {
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
      data: png.subarray(offset + 8, offset + 8 + length),
      type: png.toString("ascii", offset + 4, offset + 8),
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
}

export async function renderOgDefault(logo) {
  if (sha256(logo) !== APPROVED_LOGO_HASH) {
    throw new Error("Approved Youtoola logo hash does not match the frozen brand record.");
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const taglineRgb = inflateRawSync(
      Buffer.from(approvedTaglineLayer.data, "base64"),
    );
    if (taglineRgb.length !== approvedTaglineLayer.width * approvedTaglineLayer.height * 3) {
      throw new Error("Approved tagline pixel layer is invalid.");
    }
    const dataUrl = await page.evaluate(
      async ({ logoUrl, spec, tagline, taglineRgbUrl }) => {
        const image = new Image();
        image.src = logoUrl;
        await image.decode();
        if (image.naturalWidth !== 3000 || image.naturalHeight !== 819) {
          throw new Error("Approved logo must remain 3000×819.");
        }

        const canvas = document.createElement("canvas");
        canvas.width = spec.width;
        canvas.height = spec.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas 2D context is unavailable.");

        context.fillStyle = spec.background;
        context.fillRect(0, 0, spec.width, spec.height);

        context.fillStyle = "#F8FAFC";
        context.beginPath();
        context.roundRect(
          spec.logoPanel.x,
          spec.logoPanel.y,
          spec.logoPanel.width,
          spec.logoPanel.height,
          spec.logoPanel.radius,
        );
        context.fill();

        const renderedHeight = spec.logoRender.width * (819 / 3000);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(
          image,
          0,
          0,
          3000,
          819,
          spec.logoRender.x,
          spec.logoRender.y,
          spec.logoRender.width,
          renderedHeight,
        );

        const encoded = atob(taglineRgbUrl);
        const taglinePixels = context.createImageData(tagline.width, tagline.height);
        for (let source = 0, target = 0; source < encoded.length; source += 3, target += 4) {
          taglinePixels.data[target] = encoded.charCodeAt(source);
          taglinePixels.data[target + 1] = encoded.charCodeAt(source + 1);
          taglinePixels.data[target + 2] = encoded.charCodeAt(source + 2);
          taglinePixels.data[target + 3] = 255;
        }
        context.putImageData(taglinePixels, tagline.x, tagline.y);

        return canvas.toDataURL("image/png");
      },
      {
        logoUrl: `data:image/png;base64,${logo.toString("base64")}`,
        spec: OG_DEFAULT_SPEC,
        tagline: approvedTaglineLayer,
        taglineRgbUrl: taglineRgb.toString("base64"),
      },
    );
    return normalizePng(
      Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64"),
    );
  } finally {
    await browser.close();
  }
}

async function main() {
  const root = process.cwd();
  const logoPath = path.join(root, "public/brand/youtoola-logo.png");
  const outputPath = path.join(root, "public/brand/og-default.png");
  const logo = await readFile(logoPath);
  const before = sha256(logo);
  const output = await renderOgDefault(logo);
  await writeFile(outputPath, output);
  const after = sha256(await readFile(logoPath));
  if (before !== after || after !== APPROVED_LOGO_HASH) {
    throw new Error("Frozen Youtoola logo changed during OG generation.");
  }
  console.log(JSON.stringify({
    output: {
      bytes: output.length,
      dimensions: `${OG_DEFAULT_SPEC.width}×${OG_DEFAULT_SPEC.height}`,
      file: "public/brand/og-default.png",
      sha256: sha256(output),
    },
    source: {
      file: "public/brand/youtoola-logo.png",
      sha256After: after,
      sha256Before: before,
    },
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
