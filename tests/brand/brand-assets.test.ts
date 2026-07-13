import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const pngCandidates = [
  ["public/brand/youtoola-logo.png", 3000, 819],
  ["public/brand/youtoola-logo-1500.png", 1500, 410],
  ["public/brand/youtoola-logo-750.png", 750, 205],
  ["public/brand/youtoola-symbol.png", 2048, 2048],
  ["public/brand/youtoola-symbol-1024.png", 1024, 1024],
  ["public/brand/youtoola-symbol-512.png", 512, 512],
] as const;

describe("Asset 01 and Asset 03 raster brand factory", () => {
  it("creates the six required 8-bit RGBA PNG canvases", () => {
    for (const [filePath, width, height] of pngCandidates) {
      const png = readFileSync(filePath);
      expect(png.subarray(0, 8)).toEqual(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      );
      expect(png.readUInt32BE(16)).toBe(width);
      expect(png.readUInt32BE(20)).toBe(height);
      expect(png[24]).toBe(8);
      expect(png[25]).toBe(6);
      expect(png.includes(Buffer.from("sRGB"))).toBe(true);
    }
  });
});
