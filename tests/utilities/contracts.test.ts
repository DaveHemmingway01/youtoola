import { describe, expect, it } from "vitest";

import { getPublicRelatedToolsForUtility } from "@/lib/discovery";
import { PROHIBITED_ANALYTICS_FIELDS } from "@/lib/analytics/contracts";
import { validateAnalyticsEvent } from "@/lib/analytics/validation";
import { fuelTripFrameworkFixture } from "@/tests/fixtures/utilities/fuel-trip-framework";
import type { UtilityResult } from "@/lib/utilities/contracts";

describe("utility framework boundaries", () => {
  it("keeps related tools empty when the source utility is unreleased", () => {
    expect(getPublicRelatedToolsForUtility("fuel-trip-calculator")).toEqual([]);
  });

  it("uses explicit analytics eligibility and prohibits sensitive fields", () => {
    expect(PROHIBITED_ANALYTICS_FIELDS).toEqual(
      expect.arrayContaining(["rawInput", "exactResult", "email", "personalData"]),
    );
    expect(validateAnalyticsEvent(
      { eventName: "tool_complete", rawInput: "private" },
      fuelTripFrameworkFixture.analyticsEligibility,
      {
        categoryId: "travel-mobility",
        releasedTargetUtilityIds: [],
        utilityId: "fuel-trip-calculator",
        utilitySlug: "fuel-trip-calculator",
      },
    )).toEqual({ ok: false, reason: "prohibited-field" });
  });

  it("retains result classification and normalized values outside presentation", () => {
    const result = {
      assumptions: [],
      calculationVersion: 1,
      classification: "estimate",
      futureCapabilities: { export: false, nativeShare: false },
      limitations: [],
      methodologyReference: { calculationVersion: 1, methodologyVersion: 1 },
      primary: { formatted: "12 units", id: "total", label: "Total", rawValue: 12 },
      supporting: [],
      warnings: [],
    } satisfies UtilityResult;
    expect(result.classification).toBe("estimate");
    expect(result.primary.rawValue).toBe(12);
  });
});
