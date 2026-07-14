import { describe, expect, it } from "vitest";

import {
  getConceptsForUtility,
  getEntitiesByType,
  getEntityById,
  getFormulaFamiliesForUtility,
  getIntentClustersForUtility,
  getJourneysForUtility,
  getPublicJourneysForUtility,
  getPublicEligibleJourneys,
  getPublicEligibleUtilities,
  getPublicRelationshipsForUtility,
  getPublicUtilitiesForJourney,
  getUnitsForConcept,
  getUtilitiesForJourney,
} from "@/lib/knowledge";

describe("Repository Knowledge Layer selectors", () => {
  it("returns stable internal entity and fixture views", () => {
    expect(getEntityById("utility:fuel-trip-calculator")).toMatchObject({
      utilityId: "fuel-trip-calculator",
      status: "idea",
    });
    expect(getEntitiesByType("concept")).toHaveLength(7);
    expect(getJourneysForUtility("fuel-trip-calculator")).toHaveLength(1);
    expect(getUtilitiesForJourney("road-trip-planning")).toHaveLength(1);
    expect(getIntentClustersForUtility("fuel-trip-calculator")).toHaveLength(1);
    expect(getConceptsForUtility("fuel-trip-calculator")).toHaveLength(7);
    expect(getFormulaFamiliesForUtility("fuel-trip-calculator")).toHaveLength(1);
    expect(getUnitsForConcept("concept:distance").map((unit) => unit.entityId)).toEqual([
      "unit:kilometre",
      "unit:mile",
    ]);
  });

  it("returns deterministic entity ordering", () => {
    const conceptIds = getEntitiesByType("concept").map((entity) => entity.entityId);
    expect(conceptIds).toEqual([...conceptIds].sort());
  });

  it("exposes no idea, provisional journey or future slot through public selectors", () => {
    expect(getPublicEligibleUtilities()).toEqual([]);
    expect(getPublicEligibleJourneys()).toEqual([]);
    expect(getPublicRelationshipsForUtility("fuel-trip-calculator")).toEqual([]);
    expect(getPublicJourneysForUtility("fuel-trip-calculator")).toEqual([]);
    expect(getPublicUtilitiesForJourney("road-trip-planning")).toEqual([]);
  });
});
