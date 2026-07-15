import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  APPROVED_LOGO_HASH,
  OG_DEFAULT_SPEC,
} from "../../scripts/brand/generate-og-default.mjs";
import {
  parsePng,
  validateStaticOgAsset,
} from "../../scripts/brand/validate-og-default.mjs";

const root = process.cwd();

describe("default Open Graph candidate", () => {
  it("preserves the approved production specification", () => {
    expect(OG_DEFAULT_SPEC).toMatchObject({
      background: "#000A3F",
      height: 630,
      safeMargin: { horizontal: 80, vertical: 60 },
      tagline: "Useful tools. No account. No nonsense.",
      width: 1200,
    });
  });

  it("does not change the frozen primary logo", async () => {
    const logo = await readFile(path.join(root, "public/brand/youtoola-logo.png"));
    expect(createHash("sha256").update(logo).digest("hex")).toBe(APPROVED_LOGO_HASH);
  });

  it("has a valid deterministic production PNG structure", async () => {
    const candidate = await readFile(path.join(root, "public/brand/og-default.png"));
    const failed = validateStaticOgAsset(candidate).filter(({ passed }) => !passed);
    expect(failed).toEqual([]);
    expect(parsePng(candidate)).toMatchObject({
      bitDepth: 8,
      colourType: 6,
      height: 630,
      width: 1200,
    });
  });

  it("fails closed for malformed PNG data", async () => {
    const candidate = Buffer.from(await readFile(path.join(root, "public/brand/og-default.png")));
    candidate[0] = 0;
    expect(() => parsePng(candidate)).toThrow("Invalid PNG signature");
  });

  it("fails closed for corrupted PNG chunks", async () => {
    const candidate = Buffer.from(await readFile(path.join(root, "public/brand/og-default.png")));
    candidate[32] ^= 1;
    expect(() => parsePng(candidate)).toThrow("Invalid PNG CRC");
  });
});
