import { describe, expect, it } from "vitest";

import { getPublicRelatedToolsForUtility } from "@/lib/discovery";
import { containsProhibitedAnalyticsField, createUtilityAnalyticsContext, isUtilityEventEligible, PROHIBITED_ANALYTICS_FIELDS } from "@/lib/utilities/analytics-contract";
import type { UtilityResult } from "@/lib/utilities/contracts";

describe("utility framework boundaries", () => {
  it("keeps related tools empty when the source utility is unreleased", () => {
    expect(getPublicRelatedToolsForUtility("fuel-trip-calculator")).toEqual([]);
  });

  it("uses explicit analytics eligibility and prohibits sensitive fields", () => {
    const eligibility = {
      category: "example",
      eligibleEvents: ["tool_complete"] as const,
      utilitySlug: "example",
    };
    expect(isUtilityEventEligible(eligibility, "tool_complete")).toBe(true);
    expect(isUtilityEventEligible(eligibility, "lead_submit")).toBe(false);
    expect(PROHIBITED_ANALYTICS_FIELDS).toEqual(
      expect.arrayContaining(["rawInput", "exactResult", "email", "personalData"]),
    );
    expect(containsProhibitedAnalyticsField({ rawInput: "private", utilitySlug: "example" })).toBe(true);
    expect(createUtilityAnalyticsContext({ category: "example", utilitySlug: "example" })).toEqual({ category: "example", utilitySlug: "example" });
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
