import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const root = process.cwd();
const outputDirectory = path.join(root, "public/brand");
const logoReference = await readFile(
  path.join(root, "docs/brand/references/youtoola-logo.jpg"),
);
const symbolReference = await readFile(
  path.join(root, "docs/brand/references/youtoola-symbol.jpg"),
);
const asDataUrl = (buffer) =>
  `data:image/jpeg;base64,${buffer.toString("base64")}`;
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
const declareSrgb = (png) => {
  if (png.includes(Buffer.from("sRGB"))) return png;
  const type = Buffer.from("sRGB");
  const data = Buffer.from([0]);
  const chunk = Buffer.alloc(13);
  chunk.writeUInt32BE(data.length, 0);
  type.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([type, data])), 9);
  return Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]);
};

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const result = await page.evaluate(
    async ({ logoSource, symbolSource }) => {
      const load = async (source) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        return image;
      };

      const removeWhiteBackground = async (source) => {
        const image = await load(source);
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas 2D context is unavailable.");
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const strength = new Uint8Array(canvas.width * canvas.height);
        for (let index = 0; index < strength.length; index += 1) {
          const offset = index * 4;
          strength[index] = Math.max(
            255 - pixels.data[offset],
            255 - pixels.data[offset + 1],
            255 - pixels.data[offset + 2],
          );
        }

        const output = context.createImageData(canvas.width, canvas.height);
        const radius = 4;
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = -1;
        let maxY = -1;
        let alphaWeight = 0;
        let weightedX = 0;
        let weightedY = 0;

        for (let y = 0; y < canvas.height; y += 1) {
          for (let x = 0; x < canvas.width; x += 1) {
            const pixelIndex = y * canvas.width + x;
            const observedStrength = strength[pixelIndex];
            if (observedStrength <= 2) continue;
            let localMaximum = 0;
            for (let sampleY = Math.max(0, y - radius); sampleY <= Math.min(canvas.height - 1, y + radius); sampleY += 1) {
              for (let sampleX = Math.max(0, x - radius); sampleX <= Math.min(canvas.width - 1, x + radius); sampleX += 1) {
                localMaximum = Math.max(
                  localMaximum,
                  strength[sampleY * canvas.width + sampleX],
                );
              }
            }
            if (localMaximum < 24) continue;
            let alpha = Math.max(
              0,
              Math.min(1, (observedStrength - 2) / (localMaximum - 2)),
            );
            if (alpha > 0.94) alpha = 1;
            if (alpha < 0.015) continue;

            const offset = pixelIndex * 4;
            for (let channel = 0; channel < 3; channel += 1) {
              const observed = pixels.data[offset + channel];
              output.data[offset + channel] = Math.max(
                0,
                Math.min(255, (observed - 255 * (1 - alpha)) / alpha),
              );
            }
            output.data[offset + 3] = Math.round(alpha * 255);
            if (alpha >= 0.02) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
              alphaWeight += alpha;
              weightedX += x * alpha;
              weightedY += y * alpha;
            }
          }
        }
        if (maxX < minX || maxY < minY) throw new Error("No artwork detected.");
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.putImageData(output, 0, 0);
        return {
          canvas,
          bounds: {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
          },
          centroid: { x: weightedX / alphaWeight, y: weightedY / alphaWeight },
        };
      };

      const scaleCanvas = (source, width, height) => {
        const target = document.createElement("canvas");
        target.width = width;
        target.height = height;
        const context = target.getContext("2d");
        if (!context) throw new Error("Canvas 2D context is unavailable.");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(source, 0, 0, width, height);
        return target;
      };

      const logoMatte = await removeWhiteBackground(logoSource);
      const logoPadding = Math.round(logoMatte.bounds.height * 0.04);
      const logoPadded = document.createElement("canvas");
      logoPadded.width = logoMatte.bounds.width + logoPadding * 2;
      logoPadded.height = logoMatte.bounds.height + logoPadding * 2;
      logoPadded
        .getContext("2d")
        ?.drawImage(
          logoMatte.canvas,
          logoMatte.bounds.minX,
          logoMatte.bounds.minY,
          logoMatte.bounds.width,
          logoMatte.bounds.height,
          logoPadding,
          logoPadding,
          logoMatte.bounds.width,
          logoMatte.bounds.height,
        );
      const logoMasterHeight = Math.round(
        (3000 * logoPadded.height) / logoPadded.width,
      );
      const logoMaster = scaleCanvas(logoPadded, 3000, logoMasterHeight);
      const logo1500 = scaleCanvas(
        logoMaster,
        1500,
        Math.round((logoMaster.height * 1500) / logoMaster.width),
      );
      const logo750 = scaleCanvas(
        logoMaster,
        750,
        Math.round((logoMaster.height * 750) / logoMaster.width),
      );

      const symbolMatte = await removeWhiteBackground(symbolSource);
      const symbolMaster = document.createElement("canvas");
      symbolMaster.width = 2048;
      symbolMaster.height = 2048;
      const symbolContext = symbolMaster.getContext("2d");
      if (!symbolContext) throw new Error("Canvas 2D context is unavailable.");
      symbolContext.imageSmoothingEnabled = true;
      symbolContext.imageSmoothingQuality = "high";
      const minimumPadding = Math.round(symbolMaster.width * 0.08);
      const available = symbolMaster.width - minimumPadding * 2;
      const symbolScale = Math.min(
        available / symbolMatte.bounds.width,
        available / symbolMatte.bounds.height,
      );
      const renderedWidth = symbolMatte.bounds.width * symbolScale;
      const renderedHeight = symbolMatte.bounds.height * symbolScale;
      const centroidOffsetX =
        (symbolMatte.centroid.x - symbolMatte.bounds.minX) * symbolScale;
      const centroidOffsetY =
        (symbolMatte.centroid.y - symbolMatte.bounds.minY) * symbolScale;
      const clamp = (value, minimum, maximum) =>
        Math.max(minimum, Math.min(maximum, value));
      const destinationX = clamp(
        symbolMaster.width / 2 - centroidOffsetX,
        minimumPadding,
        symbolMaster.width - minimumPadding - renderedWidth,
      );
      const destinationY = clamp(
        symbolMaster.height / 2 - centroidOffsetY,
        minimumPadding,
        symbolMaster.height - minimumPadding - renderedHeight,
      );
      symbolContext.drawImage(
        symbolMatte.canvas,
        symbolMatte.bounds.minX,
        symbolMatte.bounds.minY,
        symbolMatte.bounds.width,
        symbolMatte.bounds.height,
        destinationX,
        destinationY,
        renderedWidth,
        renderedHeight,
      );
      const symbol1024 = scaleCanvas(symbolMaster, 1024, 1024);
      const symbol512 = scaleCanvas(symbolMaster, 512, 512);

      return {
        files: {
          "youtoola-logo.png": logoMaster.toDataURL("image/png"),
          "youtoola-logo-1500.png": logo1500.toDataURL("image/png"),
          "youtoola-logo-750.png": logo750.toDataURL("image/png"),
          "youtoola-symbol.png": symbolMaster.toDataURL("image/png"),
          "youtoola-symbol-1024.png": symbol1024.toDataURL("image/png"),
          "youtoola-symbol-512.png": symbol512.toDataURL("image/png"),
        },
        metadata: {
          logoBounds: logoMatte.bounds,
          logoPadding,
          logoMaster: { width: logoMaster.width, height: logoMaster.height },
          symbolBounds: symbolMatte.bounds,
          symbolMinimumPadding: minimumPadding,
          symbolPlacement: {
            x: destinationX,
            y: destinationY,
            width: renderedWidth,
            height: renderedHeight,
          },
        },
      };
    },
    {
      logoSource: asDataUrl(logoReference),
      symbolSource: asDataUrl(symbolReference),
    },
  );

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all(
    Object.entries(result.files).map(async ([name, dataUrl]) => {
      const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
      await writeFile(
        path.join(outputDirectory, name),
        declareSrgb(Buffer.from(base64, "base64")),
      );
    }),
  );
  console.log(JSON.stringify(result.metadata, null, 2));
} finally {
  await browser.close();
}
