import { describe, expect, it } from "vitest";

import { knowledgeLayer } from "@/lib/knowledge";
import { deriveInverseRelationship } from "@/lib/knowledge/selectors";
import type { StoredUtilityRelationship } from "@/lib/knowledge/types";
import { validateKnowledgeLayer } from "@/lib/knowledge/validation";
import type { UtilityRegistryEntry } from "@/lib/registry/types";

const baseRelationship: StoredUtilityRelationship = {
  knowledgeSchemaVersion: 1,
  sourceEntityId: "utility:fuel-trip-calculator",
  targetEntityId: "utility:route-distance-calculator",
  type: "next-step",
  rationale: "The route distance is established before the traveller estimates the trip cost.",
  rationaleAuthorship: "human",
  status: "approved",
  visibility: "public-candidate",
  reviewedDate: "2026-07-13",
  contextJourneyEntityId: "journey:road-trip-planning",
};

function withSecondTool() {
  const secondTool: UtilityRegistryEntry = {
    ...knowledgeLayer.tools[0],
    utilityId: "route-distance-calculator",
    entityId: "utility:route-distance-calculator",
    name: "Route Distance Calculator",
    slug: "route-distance-calculator",
    canonicalUrl: "https://www.youtoola.com/route-distance-calculator",
    source: { ...knowledgeLayer.tools[0].source, sourceUtilityId: "22" },
  };
  return { ...knowledgeLayer, tools: [...knowledgeLayer.tools, secondTool] };
}

describe("Repository Knowledge Layer relationships", () => {
  it("keeps the Production relationship store correctly empty", () => {
    expect(knowledgeLayer.relationships).toEqual([]);
  });

  it("derives previous-step and output-consumer without storing inverse edges", () => {
    expect(deriveInverseRelationship(baseRelationship)).toMatchObject({
      sourceEntityId: "utility:route-distance-calculator",
      targetEntityId: "utility:fuel-trip-calculator",
      type: "previous-step",
      derived: true,
      rationaleAuthorship: "human",
    });
    expect(
      deriveInverseRelationship({ ...baseRelationship, type: "input-provider", visibility: "internal" }),
    ).toMatchObject({ type: "output-consumer", derived: true });
    expect(
      deriveInverseRelationship({
        ...baseRelationship,
        type: "related",
        visibility: "internal",
      }),
    ).toMatchObject({
      sourceEntityId: "utility:route-distance-calculator",
      targetEntityId: "utility:fuel-trip-calculator",
      type: "related",
      derived: true,
    });
  });

  it("rejects self-links, generic rationales and derived stored types", () => {
    const data = withSecondTool();
    const invalidRelationship: StoredUtilityRelationship = {
      ...baseRelationship,
      targetEntityId: "utility:fuel-trip-calculator",
      type: "related",
      rationale: "similar tool",
    };
    const errors = validateKnowledgeLayer({ ...data, relationships: [invalidRelationship] });
    expect(errors.some((error) => error.includes("self-link"))).toBe(true);
    expect(errors.some((error) => error.includes("specific human-written rationale"))).toBe(true);
  });

  it("rejects reciprocal symmetric duplicates and directed cycles", () => {
    const data = withSecondTool();
    const relationships: StoredUtilityRelationship[] = [
      { ...baseRelationship, type: "prerequisite", contextJourneyEntityId: undefined },
      {
        ...baseRelationship,
        sourceEntityId: "utility:route-distance-calculator",
        targetEntityId: "utility:fuel-trip-calculator",
        type: "prerequisite",
        contextJourneyEntityId: undefined,
      },
    ];
    expect(validateKnowledgeLayer({ ...data, relationships })).toContain(
      "Prohibited prerequisite relationship cycle detected.",
    );
  });

  it("rejects reverse storage for symmetric edges", () => {
    const data = withSecondTool();
    const forward: StoredUtilityRelationship = {
      ...baseRelationship,
      type: "related",
      visibility: "internal",
      status: "proposed",
      contextJourneyEntityId: undefined,
    };
    const reverse: StoredUtilityRelationship = {
      ...forward,
      sourceEntityId: forward.targetEntityId,
      targetEntityId: forward.sourceEntityId,
    };
    const errors = validateKnowledgeLayer({ ...data, relationships: [forward, reverse] });
    expect(errors.some((error) => error.includes("canonical endpoint ordering"))).toBe(true);
    expect(errors.some((error) => error.includes("Duplicate semantic relationship"))).toBe(true);
  });

  it("requires approved human rationale for public candidates", () => {
    const data = withSecondTool();
    const relationship: StoredUtilityRelationship = { ...baseRelationship, status: "proposed" };
    expect(
      validateKnowledgeLayer({ ...data, relationships: [relationship] }).some((error) =>
        error.includes("not eligible as a public candidate"),
      ),
    ).toBe(true);
  });

  it("rejects missing journey contexts and inactive public references", () => {
    const data = withSecondTool();
    const missingContext: StoredUtilityRelationship = {
      ...baseRelationship,
      type: "related",
      visibility: "internal",
      status: "proposed",
      contextJourneyEntityId: "journey:missing",
    };
    expect(validateKnowledgeLayer({ ...data, relationships: [missingContext] })).toContain(
      "Unknown relationship journey context journey:missing.",
    );

    const publicCandidate: StoredUtilityRelationship = {
      ...baseRelationship,
      type: "related",
      contextJourneyEntityId: undefined,
    };
    const releasedTools = data.tools.map((tool) => ({ ...tool, status: "released" as const }));
    expect(
      validateKnowledgeLayer({ ...data, tools: releasedTools, relationships: [publicCandidate] }),
    ).toContain(
      "Relationship utility:fuel-trip-calculator -> utility:route-distance-calculator is not eligible as a public candidate.",
    );
  });

  it("rejects manual storage of inverse relationship types", () => {
    const data = withSecondTool();
    const manuallyStoredInverse = {
      ...baseRelationship,
      type: "previous-step",
      visibility: "internal",
      status: "proposed",
    } as unknown as StoredUtilityRelationship;
    expect(
      validateKnowledgeLayer({ ...data, relationships: [manuallyStoredInverse] }).some((error) =>
        error.includes("must be derived, not stored"),
      ),
    ).toBe(true);
  });
});
