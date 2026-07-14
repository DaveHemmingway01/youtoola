import { describe, expect, it } from "vitest";

import { getPublicRelatedToolsForUtility } from "@/lib/discovery";
import { containsProhibitedAnalyticsField, createUtilityAnalyticsContext, isUtilityEventEligible, PROHIBITED_ANALYTICS_FIELDS } from "@/lib/utilities/analytics-contract";

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
});
