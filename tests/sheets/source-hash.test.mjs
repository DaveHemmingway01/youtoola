import { describe, expect, it } from "vitest";

import fixture from "../fixtures/sheets/travel-mobility-row-5.json" with { type: "json" };
import { APPROVED_SOURCE_RECORDS } from "../../lib/sheets/constants.mjs";
import { createSourceHash } from "../../lib/sheets/source-hash.mjs";

describe("Sheet source content hashing", () => {
  it("matches the approved fixture hash", () => {
    expect(createSourceHash(fixture)).toBe(fixture.sourceContentHash);
    expect(APPROVED_SOURCE_RECORDS["Travel & Mobility:5"].sourceContentHash).toBe(
      fixture.sourceContentHash,
    );
  });

  it("is deterministic across object key ordering and excludes retrieval metadata", () => {
    const reordered = {
      ...fixture,
      retrieval: { retrievedAt: "2099-01-01T00:00:00.000Z", transport: "csv-export" },
      rawFields: Object.fromEntries(Object.entries(fixture.rawFields).reverse()),
    };
    expect(createSourceHash(reordered)).toBe(fixture.sourceContentHash);
  });

  it("changes when source content changes", () => {
    expect(
      createSourceHash({
        ...fixture,
        normalized: { ...fixture.normalized, priority: "Tier 2" },
      }),
    ).not.toBe(fixture.sourceContentHash);
  });
});
