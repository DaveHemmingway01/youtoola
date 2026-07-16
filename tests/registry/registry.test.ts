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
import { RESERVED_ROOT_SLUGS } from "@/lib/registry/reserved-routes";

function validate(testTools: readonly UtilityRegistryEntry[]) {
  return validateRegistry({ tools: testTools, categories, journeys });
}

describe("Canonical utility registry", () => {
  it("validates the approved released registry", () => {
    expect(validate(tools)).toEqual([]);
  });

  it("contains the released Fuel Trip Calculator only", () => {
    expect(tools).toHaveLength(1);
    expect(tools[0]).toMatchObject({
      utilityId: "fuel-trip-calculator",
      name: "Fuel Trip Calculator",
      slug: "fuel-trip-calculator",
      status: "released",
      calculationVersion: 1,
      methodologyVersion: 1,
      riskProfile: "standard",
      categoryId: "travel-mobility",
      source: {
        sourceUtilityId: "21",
        tabName: "Travel & Mobility",
        visibleRow: 5,
        categoryMapping: "approved-tab-context",
      },
    });
    expect(tools[0].releaseDate).toBe("2026-07-16");
    expect(tools[0].specificationPath).toBe("docs/utilities/fuel-trip-calculator.md");
    expect(tools[0].complexity).toBeUndefined();
    expect(tools[0].premiumOpportunity).toBeUndefined();
    expect(tools[0].formulaFamilyIds).toEqual(["formula-family:trip-cost"]);
    expect(tools[0].source.contentHash).toBe(sourceFixture.sourceContentHash);
    expect(tools[0].source.sourceUtilityId).toBe(sourceFixture.normalized.sourceUtilityId);
  });

  it("provides internal selectors and the exact released selection", () => {
    expect(getAllTools()).toHaveLength(1);
    expect(getToolById("fuel-trip-calculator")?.name).toBe("Fuel Trip Calculator");
    expect(getToolBySlug("fuel-trip-calculator")?.status).toBe("released");
    expect(getToolsByCategory("travel-mobility")).toHaveLength(1);
    expect(getRelatedTools("fuel-trip-calculator")).toEqual([]);
    expect(getReleasedTools()).toEqual([tools[0]]);
  });

  it("rejects duplicate IDs and slugs", () => {
    const duplicate: UtilityRegistryEntry = { ...tools[0], entityId: "utility:duplicate" };
    const errors = validate([tools[0], duplicate]);
    expect(errors).toContain("Duplicate utility ID: fuel-trip-calculator.");
    expect(errors).toContain("Duplicate slug: fuel-trip-calculator.");
  });

  it("rejects reserved routes", () => {
    const invalid: UtilityRegistryEntry = {
      ...tools[0],
      utilityId: "robots",
      entityId: "utility:robots",
      slug: "robots.txt",
      canonicalUrl: "https://www.youtoola.com/robots.txt" as const,
    };
    expect(validate([invalid])).toContain("Reserved route collision: robots.txt.");
    expect([...RESERVED_ROOT_SLUGS]).toEqual(
      expect.arrayContaining([
        "tools",
        "about",
        "methodology",
        "privacy",
        "accessibility",
        "editorial-policy",
        "contact",
        "categories",
        "journeys",
        "search",
      ]),
    );
  });

  it("rejects unknown category and journey references", () => {
    const invalid: UtilityRegistryEntry = {
      ...tools[0],
      categoryId: "missing-category",
    };
    const errors = validate([invalid]);
    expect(errors).toContain("Unknown category missing-category for fuel-trip-calculator.");
  });

  it("requires release evidence only for released entries", () => {
    const released: UtilityRegistryEntry = {
      ...tools[0],
      calculationVersion: undefined,
      methodologyVersion: undefined,
      releaseDate: undefined,
      riskProfile: "unclassified",
      specificationPath: undefined,
    };
    const errors = validate([released]);
    expect(errors).toContain(
      "Released tool fuel-trip-calculator requires a valid release date.",
    );
    expect(errors).toContain(
      "Released tool fuel-trip-calculator requires a specification path.",
    );
    expect(errors).toContain("Released tool fuel-trip-calculator requires a calculation version.");
    expect(errors).toContain("Released tool fuel-trip-calculator requires a methodology version.");
    expect(errors).toContain("Released tool fuel-trip-calculator requires a classified risk profile.");
  });
});
