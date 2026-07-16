import { describe, expect, it } from "vitest";

import { resolveCanonicalAnalyticsContext } from "@/lib/analytics/canonical-context";
import { analyticsSchemaVersion } from "@/lib/analytics/contracts";
import { validateAnalyticsEvent } from "@/lib/analytics/validation";
import { fuelTripDefinition } from "@/utilities/fuel-trip-calculator/definition";

const context = resolveCanonicalAnalyticsContext("fuel-trip-calculator")!;
const common = {
  analyticsSchemaVersion,
  consentState: "analytics-granted",
  environment: "production",
  locale: "en",
  pageType: "utility",
} as const;

describe("Fuel Trip Calculator analytics eligibility", () => {
  it.each([
    { eventName: "tool_view" },
    { eventName: "tool_start", interactionSource: "input-change" },
    {
      errorCode: "required",
      errorCountBucket: "four-or-more",
      eventName: "tool_validation_error",
      fieldId: "fuel-trip-distance",
    },
    {
      eventName: "tool_complete",
      nonSensitiveResultType: "trip-cost-estimate",
      resultClassification: "estimate",
      timeToResultBucket: "under-10-seconds",
    },
  ] as const)("accepts the approved $eventName shape", (event) => {
    expect(
      validateAnalyticsEvent(
        { ...common, ...event },
        fuelTripDefinition.analyticsEligibility,
        context,
      ),
    ).toMatchObject({ ok: true, event: { eventName: event.eventName } });
  });

  it.each([
    ["rawInput", "200"],
    ["exactResult", "48.00"],
    ["freeText", "private"],
  ] as const)("rejects prohibited %s", (field, value) => {
    expect(
      validateAnalyticsEvent(
        { ...common, eventName: "tool_complete", [field]: value },
        fuelTripDefinition.analyticsEligibility,
        context,
      ),
    ).toEqual({ ok: false, reason: "prohibited-field" });
  });

  it("rejects unapproved fields, result types, and interaction sources", () => {
    expect(
      validateAnalyticsEvent(
        { ...common, eventName: "tool_validation_error", errorCode: "required", fieldId: "fuel-price" },
        fuelTripDefinition.analyticsEligibility,
        context,
      ),
    ).toEqual({ ok: false, reason: "ineligible-category" });
    expect(
      validateAnalyticsEvent(
        { ...common, eventName: "tool_complete", nonSensitiveResultType: "exact-cost" },
        fuelTripDefinition.analyticsEligibility,
        context,
      ),
    ).toEqual({ ok: false, reason: "ineligible-category" });
    expect(
      validateAnalyticsEvent(
        { ...common, eventName: "tool_start", interactionSource: "unknown" },
        fuelTripDefinition.analyticsEligibility,
        context,
      ),
    ).toEqual({ ok: false, reason: "ineligible-category" });
  });
});
