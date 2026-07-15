import { describe, expect, it } from "vitest";

import { ANALYTICS_EVENT_NAMES, EVENT_FIELD_ALLOWLISTS, analyticsSchemaVersion, type AnalyticsEventEnvelope } from "@/lib/analytics/contracts";
import { GA4_MAPPED_EVENTS, mapAnalyticsEventToGa4 } from "@/lib/analytics/ga4-mapping";

function event(eventName: AnalyticsEventEnvelope["eventName"]): AnalyticsEventEnvelope {
  return {
    analyticsSchemaVersion,
    categoryId: "travel",
    consentState: "analytics-granted",
    environment: "production",
    eventName,
    locale: "en",
    pageType: "utility",
    utilityId: "utility-1",
    utilitySlug: "utility-one",
  };
}

describe("GA4 mapping", () => {
  it("maps exactly the 12 canonical events", () => {
    expect(GA4_MAPPED_EVENTS).toEqual(ANALYTICS_EVENT_NAMES);
    expect(GA4_MAPPED_EVENTS).toHaveLength(12);
  });

  it("constructs a fresh allowlisted payload and recommends only tool_complete", () => {
    for (const name of ANALYTICS_EVENT_NAMES) {
      const input = Object.assign(event(name), { rawInput: "private", exactResult: "42" });
      const mapped = mapAnalyticsEventToGa4(input);
      expect(mapped.parameters).not.toHaveProperty("rawInput");
      expect(mapped.parameters).not.toHaveProperty("exactResult");
      expect(mapped.keyEventRecommended).toBe(name === "tool_complete");
      expect(mapped.parameters).not.toBe(input);
    }
  });

  it("uses the exact common and event-specific allowlists", () => {
    const commonKeys = ["category_id", "locale", "page_type", "utility_id", "utility_slug"];
    const camelToSnake = (value: string) => value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    for (const name of ANALYTICS_EVENT_NAMES) {
      const input = event(name) as AnalyticsEventEnvelope & Record<string, unknown>;
      for (const field of EVENT_FIELD_ALLOWLISTS[name]) input[field] = `allowed-${field.toLowerCase()}`;
      const mapped = mapAnalyticsEventToGa4(input);
      expect(Object.keys(mapped.parameters).sort()).toEqual(
        [...commonKeys, ...EVENT_FIELD_ALLOWLISTS[name].map(camelToSnake)].sort(),
      );
    }
  });
});
