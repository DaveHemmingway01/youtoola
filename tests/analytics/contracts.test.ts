import { describe, expect, it } from "vitest";

import {
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_FIELD_CLASSIFICATIONS,
  analyticsSchemaVersion,
  type CanonicalAnalyticsContext,
  type AnalyticsEventName,
  type UtilityAnalyticsEligibility,
} from "@/lib/analytics/contracts";
import { validateAnalyticsEvent, validateUtilityAnalyticsEligibility } from "@/lib/analytics/validation";

const eligibility: UtilityAnalyticsEligibility = {
  allowResultClassification: true,
  allowedCommercialCapabilityIds: ["commercial:test"],
  allowedErrorCodes: ["required"],
  allowedEvents: ANALYTICS_EVENT_NAMES,
  allowedFieldIds: ["distance"],
  allowedInteractionSources: ["primary-action"],
  allowedResultTypes: ["estimate-band"],
  ownerApprovalReference: "phase-8-tests",
  reviewedDate: "2026-07-14",
};

const base = {
  analyticsSchemaVersion,
  consentState: "analytics-granted",
  environment: "production",
  locale: "en",
  pageType: "utility",
} as const;

const canonicalContext: CanonicalAnalyticsContext = {
  categoryId: "travel-mobility",
  releasedTargetUtilityIds: ["other-utility"],
  releaseReference: "abcdef0",
  utilityId: "test-utility",
  utilitySlug: "test-utility",
};

const extras: Record<AnalyticsEventName, object> = {
  tool_view: {},
  tool_start: { interactionSource: "primary-action" },
  tool_validation_error: { errorCode: "required", errorCountBucket: "one", fieldId: "distance" },
  tool_complete: { nonSensitiveResultType: "estimate-band", resultClassification: "estimate", timeToResultBucket: "under-10-seconds" },
  result_copy: { interactionSource: "primary-action" },
  result_share: { interactionSource: "primary-action" },
  result_export: { interactionSource: "primary-action" },
  related_tool_click: { interactionSource: "primary-action", relationshipType: "related", targetUtilityId: "other-utility" },
  affiliate_click: { capabilityId: "commercial:test", destinationCategory: "travel", interactionSource: "primary-action", placementId: "after-result", placementType: "after-result" },
  premium_click: { capabilityId: "commercial:test", interactionSource: "primary-action", placementId: "after-result", placementType: "after-result" },
  lead_start: { capabilityId: "commercial:test", interactionSource: "primary-action", placementId: "after-result", placementType: "after-result" },
  lead_submit: { capabilityId: "commercial:test", placementId: "after-result", placementType: "after-result" },
};

function event(eventName: AnalyticsEventName, extra: object = extras[eventName]) {
  return { ...base, eventName, ...extra };
}

function validate(payload: unknown, candidateEligibility = eligibility) {
  return validateAnalyticsEvent(payload, candidateEligibility, canonicalContext);
}

describe("analytics contract validation", () => {
  it.each(ANALYTICS_EVENT_NAMES)("accepts the approved %s contract", (eventName) => {
    const input = event(eventName);
    const result = validate(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event).not.toBe(input);
      expect(result.event.eventName).toBe(eventName);
      expect(result.event.utilitySlug).toBe(canonicalContext.utilitySlug);
    }
  });

  it("fails closed for unknown events, fields, schema versions, and prohibited data", () => {
    expect(validate({ ...event("tool_view"), eventName: "custom" })).toEqual({ ok: false, reason: "unknown-event" });
    expect(validate({ ...event("tool_view"), extension: "x" })).toEqual({ ok: false, reason: "unknown-field" });
    expect(validate({ ...event("tool_view"), analyticsSchemaVersion: 2 })).toEqual({ ok: false, reason: "invalid-schema-version" });
    expect(validate({ ...event("tool_view"), rawInput: "private" })).toEqual({ ok: false, reason: "prohibited-field" });
    expect(validate({ ...event("tool_view"), exactResult: "42" })).toEqual({ ok: false, reason: "prohibited-field" });
    expect(validate({ ...event("tool_view"), freeText: "hello" })).toEqual({ ok: false, reason: "prohibited-field" });
    expect(validate({ ...event("tool_view"), utilitySlug: "caller-value" })).toEqual({ ok: false, reason: "unknown-field" });
  });

  it("rejects nested, circular, oversized, non-finite, and unexpected prototype values", () => {
    expect(validate({ ...event("tool_view"), extension: { rawInput: "private" } }).ok).toBe(false);
    const circular: Record<string, unknown> = { ...event("tool_view") };
    circular.extension = circular;
    expect(validate(circular)).toEqual({ ok: false, reason: "circular-value" });
    expect(validate({ ...event("tool_view"), locale: "x".repeat(2100) })).toEqual({ ok: false, reason: "oversized-payload" });
    expect(validate({ ...event("tool_view"), extension: Number.NaN })).toEqual({ ok: false, reason: "invalid-value" });
    expect(validate(Object.assign(Object.create(null), event("tool_view")))).toEqual({ ok: false, reason: "invalid-prototype" });
  });

  it("rejects prototype-pollution keys without mutating the caller", () => {
    const input = JSON.parse(JSON.stringify({ ...event("tool_view"), __proto__: "unsafe" })) as Record<string, unknown>;
    Object.defineProperty(input, "constructor", { enumerable: true, value: "unsafe" });
    expect(validate(input)).toEqual({ ok: false, reason: "prohibited-field" });
    expect(input.constructor).toBe("unsafe");
  });

  it("enforces utility-specific result, error, field and event eligibility", () => {
    const restricted = { ...eligibility, allowedEvents: ["tool_complete"] as const, allowedResultTypes: [] };
    expect(validate(event("tool_complete"), restricted)).toEqual({ ok: false, reason: "ineligible-category" });
    expect(validate(event("tool_validation_error"), restricted)).toEqual({ ok: false, reason: "ineligible-category" });
    expect(validateUtilityAnalyticsEligibility({ ...eligibility, allowedEvents: ["tool_view", "tool_view"] })).toContain("duplicate-event");
    expect(validateUtilityAnalyticsEligibility({ ...eligibility, utilitySlug: "duplicate-truth" })).toEqual(["invalid-eligibility"]);
    expect(validate(event("related_tool_click", { relationshipType: "related", targetUtilityId: "unreleased" }))).toEqual({ ok: false, reason: "ineligible-category" });
  });

  it("classifies every provider-bound field as public or operational", () => {
    expect(Object.values(ANALYTICS_FIELD_CLASSIFICATIONS).every((classification) =>
      classification === "public" || classification === "operational")).toBe(true);
  });

  it("validates the largest approved event shape within the Phase 8 budget", () => {
    const candidate = event("affiliate_click");
    const started = performance.now();
    for (let index = 0; index < 1_000; index += 1) {
      expect(validate(candidate).ok).toBe(true);
    }
    expect((performance.now() - started) / 1_000).toBeLessThan(2);
  });
});
