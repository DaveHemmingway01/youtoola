import { describe, expect, it } from "vitest";

import { createSanitizedPageView, PageViewDeduplicator } from "@/lib/analytics/page-view";

describe("sanitized provider page views", () => {
  it("accepts known routes and strips query, fragment and referrer", () => {
    expect(createSanitizedPageView("/tools?raw=secret#result")).toEqual({
      page_location: "https://www.youtoola.com/tools",
      page_title: "Practical Online Tools",
    });
    expect(createSanitizedPageView("/tools?referrer=https://example.com")).not.toHaveProperty("page_referrer");
    expect(createSanitizedPageView("/#fragment")?.page_location).toBe("https://www.youtoola.com");
  });

  it("fails closed for unknown and malformed routes", () => {
    expect(createSanitizedPageView("/fuel-trip-calculator")).toBeNull();
    expect(createSanitizedPageView("http://[invalid")).toBeNull();
  });

  it("deduplicates only the current recognized transition and clears without replay", () => {
    const pageView = createSanitizedPageView("/")!;
    const deduplicator = new PageViewDeduplicator();
    expect(deduplicator.accept(pageView)).toBe(true);
    expect(deduplicator.accept(pageView)).toBe(false);
    deduplicator.clear();
    expect(deduplicator.accept(pageView)).toBe(true);
  });
});
