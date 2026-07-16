import { describe, expect, it } from "vitest";

import { resolveCanonicalAnalyticsContext } from "@/lib/analytics/canonical-context";

describe("canonical analytics context", () => {
  it("resolves identity and released targets from the public discovery source", () => {
    const releasedTools = [
      { categoryId: "travel", slug: "first-tool", utilityId: "first-tool" },
      { categoryId: "travel", slug: "second-tool", utilityId: "second-tool" },
    ];
    expect(resolveCanonicalAnalyticsContext("first-tool", releasedTools, "abcdef0")).toEqual({
      categoryId: "travel",
      releasedTargetUtilityIds: ["second-tool"],
      releaseReference: "abcdef0",
      utilityId: "first-tool",
      utilitySlug: "first-tool",
    });
  });

  it("resolves the released Fuel Trip Calculator without exposing another target", () => {
    expect(resolveCanonicalAnalyticsContext("fuel-trip-calculator")).toEqual({
      categoryId: "travel-mobility",
      releasedTargetUtilityIds: [],
      utilityId: "fuel-trip-calculator",
      utilitySlug: "fuel-trip-calculator",
    });
  });
});
