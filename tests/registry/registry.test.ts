import { describe, expect, it } from "vitest";

import sourceFixture from "@/tests/fixtures/sheets/travel-mobility-row-5.json";
import { categories } from "@/data/registry/categories";
import { journeys } from "@/data/registry/journeys";
import { tools } from "@/data/registry/tools";
import {
  getAllTools,
  getReleasedTools,
  getRelatedTools,
  getToolById,
  getToolBySlug,
  getToolsByCategory,
} from "@/lib/registry";
import type { UtilityRegistryEntry } from "@/lib/registry/types";
import { validateRegistry } from "@/lib/registry/validation";

function validate(testTools: readonly UtilityRegistryEntry[]) {
  return validateRegistry({ tools: testTools, categories, journeys });
}

describe("Canonical utility registry", () => {
  it("validates the approved idea registry", () => {
    expect(validate(tools)).toEqual([]);
  });

  it("contains the approved Fuel Trip Calculator idea only", () => {
    expect(tools).toHaveLength(1);
    expect(tools[0]).toMatchObject({
      utilityId: "fuel-trip-calculator",
      name: "Fuel Trip Calculator",
      slug: "fuel-trip-calculator",
      status: "idea",
      categoryId: "travel-mobility",
      source: {
        sourceUtilityId: "21",
        tabName: "Travel & Mobility",
        visibleRow: 5,
        categoryMapping: "approved-tab-context",
      },
    });
    expect(tools[0].releaseDate).toBeUndefined();
    expect(tools[0].complexity).toBeUndefined();
    expect(tools[0].premiumOpportunity).toBeUndefined();
    expect(tools[0].formulaFamily).toBeUndefined();
    expect(tools[0].source.contentHash).toBe(sourceFixture.sourceContentHash);
    expect(tools[0].source.sourceUtilityId).toBe(sourceFixture.normalized.sourceUtilityId);
  });

  it("provides internal selectors while public released selection remains empty", () => {
    expect(getAllTools()).toHaveLength(1);
    expect(getToolById("fuel-trip-calculator")?.name).toBe("Fuel Trip Calculator");
    expect(getToolBySlug("fuel-trip-calculator")?.status).toBe("idea");
    expect(getToolsByCategory("travel-mobility")).toHaveLength(1);
    expect(getRelatedTools("fuel-trip-calculator")).toEqual([]);
    expect(getReleasedTools()).toEqual([]);
  });

  it("rejects duplicate IDs and slugs", () => {
    const duplicate = { ...tools[0], entityId: "utility:duplicate" };
    const errors = validate([tools[0], duplicate]);
    expect(errors).toContain("Duplicate utility ID: fuel-trip-calculator.");
    expect(errors).toContain("Duplicate slug: fuel-trip-calculator.");
  });

  it("rejects reserved routes", () => {
    const invalid = {
      ...tools[0],
      utilityId: "robots",
      entityId: "utility:robots",
      slug: "robots.txt",
      canonicalUrl: "https://www.youtoola.com/robots.txt" as const,
    };
    expect(validate([invalid])).toContain("Reserved route collision: robots.txt.");
  });

  it("rejects relationship self-links, duplicates and missing targets", () => {
    const invalid = {
      ...tools[0],
      relationships: [
        { type: "related" as const, targetUtilityId: "fuel-trip-calculator", reason: "Self" },
        { type: "related" as const, targetUtilityId: "missing", reason: "Missing" },
        { type: "related" as const, targetUtilityId: "missing", reason: "Duplicate" },
      ],
    };
    const errors = validate([invalid]);
    expect(errors.some((error) => error.includes("Prohibited self-link"))).toBe(true);
    expect(errors.some((error) => error.includes("Unknown relationship target missing"))).toBe(true);
    expect(errors.some((error) => error.includes("Duplicate relationship related:missing"))).toBe(true);
  });

  it("rejects inappropriate directional relationship cycles", () => {
    const first: UtilityRegistryEntry = {
      ...tools[0],
      utilityId: "a-tool",
      entityId: "utility:a-tool",
      slug: "a-tool",
      canonicalUrl: "https://www.youtoola.com/a-tool",
      relationships: [
        { type: "prerequisite", targetUtilityId: "b-tool", reason: "Requires B" },
      ],
    };
    const second: UtilityRegistryEntry = {
      ...tools[0],
      utilityId: "b-tool",
      entityId: "utility:b-tool",
      slug: "b-tool",
      canonicalUrl: "https://www.youtoola.com/b-tool",
      relationships: [
        { type: "prerequisite", targetUtilityId: "a-tool", reason: "Requires A" },
      ],
    };
    expect(validate([first, second])).toContain(
      "Inappropriate prerequisite relationship cycle detected.",
    );
  });

  it("rejects unknown category and journey references", () => {
    const invalid: UtilityRegistryEntry = {
      ...tools[0],
      categoryId: "missing-category",
      journeyIds: ["missing-journey"],
    };
    const errors = validate([invalid]);
    expect(errors).toContain("Unknown category missing-category for fuel-trip-calculator.");
    expect(errors).toContain("Unknown journey missing-journey for fuel-trip-calculator.");
  });

  it("requires release evidence only for released entries", () => {
    const released: UtilityRegistryEntry = {
      ...tools[0],
      status: "released",
    };
    const errors = validate([released]);
    expect(errors).toContain(
      "Released tool fuel-trip-calculator requires a valid release date.",
    );
    expect(errors).toContain(
      "Released tool fuel-trip-calculator requires a specification path.",
    );
  });
});
