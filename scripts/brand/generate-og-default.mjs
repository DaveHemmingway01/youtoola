import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

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
    const dataUrl = await page.evaluate(
      async ({ logoUrl, spec }) => {
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

        context.fillStyle = "#FFFFFF";
        context.font = "700 42px Arial, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "alphabetic";
        const measured = context.measureText(spec.tagline).width;
        if (measured > spec.width - spec.safeMargin.horizontal * 2) {
          throw new Error("Approved brand promise exceeds the social safe area.");
        }
        context.fillText(spec.tagline, spec.width / 2, spec.taglineBaseline);

        return canvas.toDataURL("image/png");
      },
      {
        logoUrl: `data:image/png;base64,${logo.toString("base64")}`,
        spec: OG_DEFAULT_SPEC,
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
