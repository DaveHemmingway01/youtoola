import { describe, expect, it } from "vitest";

import { knowledgeLayer } from "@/lib/knowledge";
import { validateKnowledgeLayer } from "@/lib/knowledge/validation";
import type { FutureJourneySlot, JourneyEntity } from "@/lib/knowledge/types";

describe("Repository Knowledge Layer journeys", () => {
  it("keeps Road Trip Planning provisional, inactive and internal", () => {
    expect(knowledgeLayer.journeys).toContainEqual(
      expect.objectContaining({
        entityId: "journey:road-trip-planning",
        status: "provisional",
        active: false,
        visibility: "internal",
      }),
    );
  });

  it("scopes future slots to the journey without utility identities or URLs", () => {
    const slots = knowledgeLayer.journeys[0].stages.flatMap((stage) => stage.futureSlots);
    expect(slots.map((slot) => slot.workingLabel)).toEqual([
      "Route distance",
      "Toll cost",
      "EV charging cost",
      "Vehicle running cost",
      "Trip carbon estimation",
    ]);
    for (const slot of slots) {
      expect(slot).not.toHaveProperty("utilityId");
      expect(slot).not.toHaveProperty("entityId");
      expect(slot).not.toHaveProperty("slug");
      expect(slot).not.toHaveProperty("canonicalUrl");
      expect(slot).not.toHaveProperty("publicUrl");
    }
  });

  it("rejects prohibited future-slot fields and invalid stage order", () => {
    const invalidSlot = {
      ...knowledgeLayer.journeys[0].stages[0].futureSlots[0],
      utilityId: "route-distance-calculator",
      slug: "route-distance-calculator",
      canonicalUrl: "https://www.youtoola.com/route-distance-calculator",
    } as FutureJourneySlot;
    const invalidJourney: JourneyEntity = {
      ...knowledgeLayer.journeys[0],
      stages: knowledgeLayer.journeys[0].stages.map((stage, index) => ({
        ...stage,
        position: index === 1 ? 4 : stage.position,
        futureSlots: index === 0 ? [invalidSlot] : stage.futureSlots,
      })),
    };
    const data = { ...knowledgeLayer, journeys: [invalidJourney] };
    const errors = validateKnowledgeLayer(data);
    expect(errors.some((error) => error.includes("prohibited fields"))).toBe(true);
    expect(errors.some((error) => error.includes("contiguous deterministic order"))).toBe(true);
  });

  it("rejects incomplete public journeys", () => {
    const publicJourney: JourneyEntity = {
      ...knowledgeLayer.journeys[0],
      status: "active",
      active: true,
      visibility: "public",
    };
    const data = { ...knowledgeLayer, journeys: [publicJourney] };
    expect(validateKnowledgeLayer(data)).toContain(
      "Public journey journey:road-trip-planning does not meet minimum completeness.",
    );
  });
});
