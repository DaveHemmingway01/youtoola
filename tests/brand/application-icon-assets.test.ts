import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const specs = [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
] as const;
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const allowedChunks = new Set(["IHDR", "sRGB", "IDAT", "IEND"]);

const crc32 = (buffer: Buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const validatePng = (png: Buffer, size: number) => {
  if (!png.subarray(0, 8).equals(signature)) throw new Error("PNG signature");
  const chunks: Array<{ type: string; data: Buffer }> = [];
  let offset = 8;
  while (offset < png.length) {
    if (offset + 12 > png.length) throw new Error("PNG chunk header");
    const length = png.readUInt32BE(offset);
    const end = offset + length + 12;
    if (end > png.length) throw new Error("PNG chunk bounds");
    const type = png.toString("ascii", offset + 4, offset + 8);
    if (
      crc32(png.subarray(offset + 4, offset + 8 + length)) !==
      png.readUInt32BE(offset + 8 + length)
    ) {
      throw new Error("PNG CRC");
    }
    chunks.push({ type, data: png.subarray(offset + 8, offset + 8 + length) });
    offset = end;
  }
  const ihdr = chunks.find(({ type }) => type === "IHDR");
  if (!ihdr || ihdr.data.length !== 13) throw new Error("PNG IHDR");
  if (
    ihdr.data.readUInt32BE(0) !== size ||
    ihdr.data.readUInt32BE(4) !== size
  ) {
    throw new Error("PNG dimensions");
  }
  if (ihdr.data[8] !== 8 || ihdr.data[9] !== 6) {
    throw new Error("PNG colour type");
  }
  const srgb = chunks.filter(({ type }) => type === "sRGB");
  if (srgb.length !== 1 || srgb[0].data[0] !== 0) throw new Error("PNG sRGB");
  if (chunks.some(({ type }) => !allowedChunks.has(type))) {
    throw new Error("PNG metadata");
  }
};

const validateVisualMetrics = (metrics: {
  size: number;
  corners: number[][];
  opaquePixels: number;
  bounds: number[];
  expectedBounds: number[];
  maximumRadius: number;
  edgeMismatches: number;
}) => {
  const background = [0, 10, 63, 255];
  if (!metrics.corners.every((corner) => corner.every((value, index) => value === background[index]))) {
    throw new Error("corner treatment");
  }
  if (metrics.opaquePixels !== metrics.size ** 2) throw new Error("opacity");
  if (!metrics.bounds.every((value, index) => value === metrics.expectedBounds[index])) {
    throw new Error("symbol bounds");
  }
  if (metrics.maximumRadius > metrics.size * 0.4) throw new Error("safe area");
  if (metrics.edgeMismatches !== 0) throw new Error("clipping or seam");
};

describe("Asset Group 06 application icon candidates", () => {
  const candidates = specs.map(([name, size]) => ({
    name,
    size,
    png: readFileSync(`public/brand/${name}`),
  }));

  it("contains deterministic 8-bit RGBA sRGB PNGs at exact dimensions", () => {
    candidates.forEach(({ png, size }) => validatePng(png, size));
  });

  it("rejects bad signatures, dimensions, CRCs, and metadata", () => {
    const png = candidates[0].png;
    const badSignature = Buffer.from(png);
    badSignature[0] = 0;
    expect(() => validatePng(badSignature, 180)).toThrow("PNG signature");
    expect(() => validatePng(png, 181)).toThrow("PNG dimensions");

    const badCrc = Buffer.from(png);
    badCrc[29] ^= 0xff;
    expect(() => validatePng(badCrc, 180)).toThrow("PNG CRC");

    const badMetadata = Buffer.from(png);
    badMetadata.write("tEXt", badMetadata.indexOf(Buffer.from("sRGB")), "ascii");
    expect(() => validatePng(badMetadata, 180)).toThrow();
  });

  it("rejects wrong corners, transparency, clipping, and unsafe placement", () => {
    const valid = {
      size: 100,
      corners: Array.from({ length: 4 }, () => [0, 10, 63, 255]),
      opaquePixels: 10_000,
      bounds: [20, 20, 79, 79],
      expectedBounds: [20, 20, 79, 79],
      maximumRadius: 39,
      edgeMismatches: 0,
    };
    expect(() => validateVisualMetrics(valid)).not.toThrow();
    expect(() => validateVisualMetrics({ ...valid, corners: [[255, 255, 255, 255], ...valid.corners.slice(1)] })).toThrow("corner treatment");
    expect(() => validateVisualMetrics({ ...valid, opaquePixels: 9_999 })).toThrow("opacity");
    expect(() => validateVisualMetrics({ ...valid, bounds: [0, 20, 79, 79] })).toThrow("symbol bounds");
    expect(() => validateVisualMetrics({ ...valid, maximumRadius: 41 })).toThrow("safe area");
    expect(() => validateVisualMetrics({ ...valid, edgeMismatches: 1 })).toThrow("clipping or seam");
  });
});
