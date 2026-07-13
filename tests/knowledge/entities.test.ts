import { describe, expect, it } from "vitest";

import { knowledgeLayer } from "@/lib/knowledge";
import { getEntityType, isEntityId } from "@/lib/knowledge/entity-ids";
import { KNOWLEDGE_SCHEMA_VERSION } from "@/lib/knowledge/schema-version";
import { validateKnowledgeLayer } from "@/lib/knowledge/validation";
import type { IntentClusterEntity } from "@/lib/knowledge/types";

describe("Repository Knowledge Layer entities", () => {
  it("uses schema version 1 and validates the complete fixture", () => {
    expect(KNOWLEDGE_SCHEMA_VERSION).toBe(1);
    expect(knowledgeLayer.knowledgeSchemaVersion).toBe(1);
    expect(validateKnowledgeLayer(knowledgeLayer)).toEqual([]);
  });

  it.each([
    ["platform:youtoola", "platform"],
    ["utility:fuel-trip-calculator", "utility"],
    ["category:travel-mobility", "category"],
    ["journey:road-trip-planning", "journey"],
    ["intent:trip-cost", "intent"],
    ["concept:fuel-consumption", "concept"],
    ["formula-family:trip-cost", "formula-family"],
    ["unit:litre-per-100-km", "unit"],
    ["source:google-sheet-youtoola-map", "source"],
    ["jurisdiction:portugal", "jurisdiction"],
  ] as const)("recognizes %s as %s", (entityId, type) => {
    expect(isEntityId(entityId)).toBe(true);
    expect(getEntityType(entityId)).toBe(type);
  });

  it.each(["Utility:bad", "concept:bad value", "formula:trip-cost", "unit:", "a:b:c"])(
    "rejects invalid entity ID %s",
    (entityId) => expect(isEntityId(entityId)).toBe(false),
  );

  it("contains no jurisdiction data and classifies the Sheet as provenance only", () => {
    expect(knowledgeLayer.sources).toContainEqual(
      expect.objectContaining({
        entityId: "source:google-sheet-youtoola-map",
        authorityClass: "provenance",
      }),
    );
    expect(knowledgeLayer.sources.some((source) => source.authorityClass === "commercial")).toBe(false);
    expect(knowledgeLayer.platforms.some((entity) => entity.entityId.startsWith("jurisdiction:"))).toBe(false);
  });

  it("rejects global ID and alias collisions", () => {
    const collidingIntent: IntentClusterEntity = {
      ...knowledgeLayer.intentClusters[0],
      entityId: "intent:journey-cost",
      name: "Journey Cost",
      aliases: ["trip cost"],
    };
    const duplicate = {
      ...knowledgeLayer,
      intentClusters: [...knowledgeLayer.intentClusters, collidingIntent],
    };
    const errors = validateKnowledgeLayer(duplicate);
    expect(errors.some((error) => error.includes("Alias collision"))).toBe(true);

    const duplicateId = {
      ...knowledgeLayer,
      platforms: [...knowledgeLayer.platforms, { ...knowledgeLayer.platforms[0] }],
    };
    expect(validateKnowledgeLayer(duplicateId)).toContain(
      "Duplicate global entity ID: platform:youtoola.",
    );
  });
});
