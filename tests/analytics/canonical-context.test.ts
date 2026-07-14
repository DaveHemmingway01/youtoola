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

  it("fails closed when the utility is not publicly released", () => {
    expect(resolveCanonicalAnalyticsContext("fuel-trip-calculator")).toBeUndefined();
  });
});
