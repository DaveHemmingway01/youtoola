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

  it("rejects invalid explicit overrides", () => {
    expect(() => resolveRuntimeEnvironment({ YOUTOOLA_ENV: "staging" })).toThrow(
      "Invalid YOUTOOLA_ENV",
    );
  });
});

describe("environment policies", () => {
  it("uses the approved canonical www origin by default", () => {
    expect(getCanonicalOrigin({}).origin).toBe(CANONICAL_ORIGIN);
  });

  it("rejects non-HTTPS canonical origins", () => {
    expect(() =>
      getCanonicalOrigin({ YOUTOOLA_CANONICAL_URL: "http://example.com" }),
    ).toThrow("must use HTTPS");
  });

  it("allows indexing only in production", () => {
    expect(isIndexingAllowed({ YOUTOOLA_ENV: "local" })).toBe(false);
    expect(isIndexingAllowed({ YOUTOOLA_ENV: "preview" })).toBe(false);
    expect(isIndexingAllowed({ YOUTOOLA_ENV: "production" })).toBe(true);
  });
});
