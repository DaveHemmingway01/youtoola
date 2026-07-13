import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const sizes = [16, 32, 48, 64] as const;
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

const validatePng = (png: Buffer, expectedSize: number) => {
  if (!png.subarray(0, 8).equals(signature)) throw new Error("PNG signature");
  const chunks: Array<{ type: string; data: Buffer }> = [];
  let offset = 8;
  while (offset < png.length) {
    if (offset + 12 > png.length) throw new Error("PNG chunk header");
    const length = png.readUInt32BE(offset);
    const end = offset + 12 + length;
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
    ihdr.data.readUInt32BE(0) !== expectedSize ||
    ihdr.data.readUInt32BE(4) !== expectedSize
  ) {
    throw new Error("PNG dimensions");
  }
  if (ihdr.data[8] !== 8 || ihdr.data[9] !== 6) {
    throw new Error("PNG colour type");
  }
  const srgb = chunks.filter(({ type }) => type === "sRGB");
  if (srgb.length !== 1 || srgb[0].data.length !== 1 || srgb[0].data[0] !== 0) {
    throw new Error("PNG sRGB");
  }
  if (chunks.some(({ type }) => !allowedChunks.has(type))) {
    throw new Error("PNG metadata");
  }
};

const validateIco = (ico: Buffer, pngs: readonly Buffer[]) => {
  if (ico.length < 6) throw new Error("ICO header");
  if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) {
    throw new Error("ICO type");
  }
  if (ico.readUInt16LE(4) !== sizes.length) throw new Error("ICO count");
  let expectedOffset = 6 + sizes.length * 16;
  for (const [index, size] of sizes.entries()) {
    const directoryOffset = 6 + index * 16;
    const length = ico.readUInt32LE(directoryOffset + 8);
    const offset = ico.readUInt32LE(directoryOffset + 12);
    if (
      ico[directoryOffset] !== size ||
      ico[directoryOffset + 1] !== size ||
      ico.readUInt16LE(directoryOffset + 4) !== 1 ||
      ico.readUInt16LE(directoryOffset + 6) !== 32
    ) {
      throw new Error("ICO directory entry");
    }
    if (offset !== expectedOffset || offset + length > ico.length) {
      throw new Error("ICO offset");
    }
    if (length !== pngs[index].length) throw new Error("ICO length");
    if (!ico.subarray(offset, offset + length).equals(pngs[index])) {
      throw new Error("ICO embedded PNG");
    }
    expectedOffset += length;
  }
  if (expectedOffset !== ico.length) throw new Error("ICO trailing bytes");
};

const pngs = sizes.map((size) =>
  readFileSync(`public/brand/favicon-${size}x${size}.png`),
);
const ico = readFileSync("public/brand/favicon.ico");

describe("Asset Group 05 approved favicon assets", () => {
  it("contains four deterministic 8-bit RGBA sRGB PNGs", () => {
    pngs.forEach((png, index) => validatePng(png, sizes[index]));
  });

  it("contains four byte-identical PNG entries in the ICO", () => {
    validateIco(ico, pngs);
  });

  it("rejects malformed PNG signatures, dimensions, and metadata", () => {
    const badSignature = Buffer.from(pngs[0]);
    badSignature[0] = 0;
    expect(() => validatePng(badSignature, 16)).toThrow("PNG signature");

    expect(() => validatePng(pngs[0], 17)).toThrow("PNG dimensions");

    const badMetadata = Buffer.from(pngs[0]);
    const srgbOffset = badMetadata.indexOf(Buffer.from("sRGB"));
    badMetadata.write("tEXt", srgbOffset, "ascii");
    expect(() => validatePng(badMetadata, 16)).toThrow();
  });

  it("rejects invalid ICO counts, offsets, and embedded bytes", () => {
    const badCount = Buffer.from(ico);
    badCount.writeUInt16LE(3, 4);
    expect(() => validateIco(badCount, pngs)).toThrow("ICO count");

    const badOffset = Buffer.from(ico);
    badOffset.writeUInt32LE(ico.length + 1, 6 + 12);
    expect(() => validateIco(badOffset, pngs)).toThrow("ICO offset");

    const badEmbeddedPng = Buffer.from(ico);
    const firstDataOffset = badEmbeddedPng.readUInt32LE(6 + 12);
    badEmbeddedPng[firstDataOffset] ^= 0xff;
    expect(() => validateIco(badEmbeddedPng, pngs)).toThrow(
      "ICO embedded PNG",
    );
  });
});
