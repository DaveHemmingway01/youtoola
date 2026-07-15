import { describe, expect, it } from "vitest";

import {
  CANONICAL_ORIGIN,
  getCanonicalOrigin,
  isIndexingAllowed,
  resolveRuntimeEnvironment,
} from "./environment";

describe("resolveRuntimeEnvironment", () => {
  it("defaults to local when no deployment environment is present", () => {
    expect(resolveRuntimeEnvironment({})).toBe("local");
  });

  it("maps Vercel environments without treating local builds as production", () => {
    expect(resolveRuntimeEnvironment({ VERCEL_ENV: "preview" })).toBe("preview");
    expect(resolveRuntimeEnvironment({ VERCEL_ENV: "production" })).toBe(
      "production",
    );
    expect(resolveRuntimeEnvironment({ VERCEL_ENV: "development" })).toBe(
      "local",
    );
  });

  it("allows an explicit valid override", () => {
    expect(resolveRuntimeEnvironment({ YOUTOOLA_ENV: "preview" })).toBe(
      "preview",
    );
  });

  it("makes Vercel authoritative and rejects conflicting overrides", () => {
    expect(() =>
      resolveRuntimeEnvironment({
        VERCEL_ENV: "production",
        YOUTOOLA_ENV: "preview",
      }),
    ).toThrow("VERCEL_ENV=production is authoritative");
    expect(() =>
      resolveRuntimeEnvironment({
        VERCEL_ENV: "preview",
        YOUTOOLA_ENV: "production",
      }),
    ).toThrow("VERCEL_ENV=preview is authoritative");
  });

  it("accepts an explicit value only when it agrees with Vercel", () => {
    expect(
      resolveRuntimeEnvironment({
        VERCEL_ENV: "preview",
        YOUTOOLA_ENV: "preview",
      }),
    ).toBe("preview");
    expect(
      resolveRuntimeEnvironment({
        VERCEL_ENV: "development",
        YOUTOOLA_ENV: "local",
      }),
    ).toBe("local");
  });

  it("rejects invalid explicit overrides", () => {
    expect(() => resolveRuntimeEnvironment({ YOUTOOLA_ENV: "staging" })).toThrow(
      "Invalid YOUTOOLA_ENV",
    );
  });

  it("rejects unknown Vercel environments", () => {
    expect(() => resolveRuntimeEnvironment({ VERCEL_ENV: "staging" })).toThrow(
      "Invalid VERCEL_ENV",
    );
  });
});

describe("environment policies", () => {
  it("always uses the approved canonical www origin", () => {
    expect(getCanonicalOrigin().origin).toBe(CANONICAL_ORIGIN);
  });

  it("allows indexing only in production", () => {
    expect(isIndexingAllowed({ YOUTOOLA_ENV: "local" })).toBe(false);
    expect(isIndexingAllowed({ YOUTOOLA_ENV: "preview" })).toBe(false);
    expect(isIndexingAllowed({ YOUTOOLA_ENV: "production" })).toBe(true);
  });
});
