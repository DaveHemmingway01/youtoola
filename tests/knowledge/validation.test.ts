import { describe, expect, it } from "vitest";

import { knowledgeLayer } from "@/lib/knowledge";
import { validateKnowledgeLayer } from "@/lib/knowledge/validation";
import type { FormulaFamilyEntity, PlatformEntity, SourceEntity } from "@/lib/knowledge/types";

describe("Repository Knowledge Layer negative validation", () => {
  it("rejects schema drift and invalid reviewed dates", () => {
    const data = {
      ...knowledgeLayer,
      knowledgeSchemaVersion: 2,
      concepts: [{ ...knowledgeLayer.concepts[0], reviewedDate: "13-07-2026" }, ...knowledgeLayer.concepts.slice(1)],
    };
    const errors = validateKnowledgeLayer(data);
    expect(errors).toContain("Knowledge schema version must be 1.");
    expect(errors).toContain("Invalid reviewed date on concept:distance.");
  });

  it("rejects missing concept, unit, formula-family and source references", () => {
    const data = {
      ...knowledgeLayer,
      tools: [{
        ...knowledgeLayer.tools[0],
        conceptIds: ["concept:missing" as const],
        unitIds: ["unit:missing" as const],
        formulaFamilyIds: ["formula-family:missing" as const],
        sourceEntityIds: ["source:missing" as const],
      }],
    };
    const errors = validateKnowledgeLayer(data);
    expect(errors.some((error) => error.includes("Unknown concept"))).toBe(true);
    expect(errors.some((error) => error.includes("Unknown unit"))).toBe(true);
    expect(errors.some((error) => error.includes("Unknown formula family"))).toBe(true);
    expect(errors.some((error) => error.includes("Unknown source reference"))).toBe(true);
  });

  it("rejects prohibited formula-family fields and non-provenance Sheet authority", () => {
    const invalidFormula = {
      ...knowledgeLayer.formulaFamilies[0],
      equation: "distance * consumption",
    } as FormulaFamilyEntity;
    const invalidSource: SourceEntity = {
      ...knowledgeLayer.sources[0],
      authorityClass: "authoritative",
    };
    const data = {
      ...knowledgeLayer,
      formulaFamilies: [invalidFormula],
      sources: [invalidSource],
    };
    const errors = validateKnowledgeLayer(data);
    expect(errors.some((error) => error.includes("contains prohibited fields"))).toBe(true);
    expect(errors).toContain("The Youtoola Utility Opportunity Map must be provenance only.");
  });

  it("rejects category hierarchy and jurisdiction data", () => {
    const invalidCategory = {
      ...knowledgeLayer.categories[0],
      parentId: "category:travel",
    };
    const jurisdictionInWrongCollection = {
      ...knowledgeLayer.platforms[0],
      entityId: "jurisdiction:portugal",
    } as unknown as PlatformEntity;
    const data = {
      ...knowledgeLayer,
      categories: [invalidCategory],
      platforms: [...knowledgeLayer.platforms, jurisdictionInWrongCollection],
    };
    const errors = validateKnowledgeLayer(data);
    expect(errors.some((error) => error.includes("Category hierarchy is prohibited"))).toBe(true);
    expect(errors).toContain("Phase 4 must not contain jurisdiction data.");
  });
});
