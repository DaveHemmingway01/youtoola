import { describe, expect, it } from "vitest";

import {
  createSanitizedPageView,
  PageViewDeduplicator,
  sendDeduplicatedPageView,
} from "@/lib/analytics/page-view";

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
    expect(createSanitizedPageView("/fuel-trip-calculator?distance=private#result")).toEqual({
      page_location: "https://www.youtoola.com/fuel-trip-calculator",
      page_title: "Fuel Trip Calculator",
    });
    expect(createSanitizedPageView("http://[invalid")).toBeNull();
  });

  it("records only successfully sent recognized transitions and clears without replay", () => {
    const pageView = createSanitizedPageView("/")!;
    const deduplicator = new PageViewDeduplicator();
    expect(deduplicator.has(pageView)).toBe(false);
    expect(deduplicator.has(pageView)).toBe(false);
    deduplicator.record(pageView);
    expect(deduplicator.has(pageView)).toBe(true);
    deduplicator.clear();
    expect(deduplicator.has(pageView)).toBe(false);
  });

  it("does not deduplicate a page view until the provider reports a successful send", () => {
    const pageView = createSanitizedPageView("/tools")!;
    const deduplicator = new PageViewDeduplicator();
    expect(sendDeduplicatedPageView(deduplicator, pageView, () => false)).toBe(false);
    expect(deduplicator.has(pageView)).toBe(false);
    expect(sendDeduplicatedPageView(deduplicator, pageView, () => true)).toBe(true);
    expect(sendDeduplicatedPageView(deduplicator, pageView, () => true)).toBe(false);
  });
});
