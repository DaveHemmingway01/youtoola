import { describe, expect, it, vi } from "vitest";

import { analyticsSchemaVersion, type UtilityAnalyticsEligibility } from "@/lib/analytics/contracts";
import { isAnalyticsConsentGranted, isAnalyticsEnvironmentEligible } from "@/lib/analytics/policy";
import { ANALYTICS_DEDUPLICATION_SCOPES, createAnalyticsDispatcher, EphemeralAnalyticsDeduplicator } from "@/lib/analytics/runtime";

const eligibility: UtilityAnalyticsEligibility = {
  allowResultClassification: false,
  allowedCommercialCapabilityIds: [],
  allowedErrorCodes: [],
  allowedEvents: ["tool_view"],
  allowedFieldIds: [],
  allowedInteractionSources: [],
  allowedResultTypes: [],
  ownerApprovalReference: "phase-8-tests",
  reviewedDate: "2026-07-14",
};
const payload = { analyticsSchemaVersion, consentState: "analytics-granted", environment: "production", eventName: "tool_view", locale: "en", pageType: "utility" };
const canonicalContext = { categoryId: "test", releasedTargetUtilityIds: [], utilityId: "test", utilitySlug: "test" } as const;
const request = { canonicalContext, deduplicationToken: { action: 0, cycle: 0, eventName: "tool_view" as const, scope: "route" as const }, eligibility, lifecycleEligible: true, payload };

describe("analytics runtime gates", () => {
  it("uses the approved lifecycle scope for every event", () => {
    expect(ANALYTICS_DEDUPLICATION_SCOPES).toEqual({
      affiliate_click: "action",
      lead_start: "interaction",
      lead_submit: "action",
      premium_click: "action",
      related_tool_click: "action",
      result_copy: "action",
      result_export: "action",
      result_share: "action",
      tool_complete: "attempt",
      tool_start: "interaction",
      tool_validation_error: "attempt",
      tool_view: "route",
    });
  });

  it("blocks Local, Preview, unknown, denied and marketing-only states", async () => {
    expect(isAnalyticsEnvironmentEligible("local")).toBe(false);
    expect(isAnalyticsEnvironmentEligible("preview")).toBe(false);
    expect(isAnalyticsConsentGranted("unknown")).toBe(false);
    expect(isAnalyticsConsentGranted("denied")).toBe(false);
    expect(isAnalyticsConsentGranted("marketing-granted")).toBe(false);
    expect(createAnalyticsDispatcher({ consentState: "analytics-granted", environment: "preview" }).track(request)).toEqual({ reason: "environment-blocked", status: "dropped" });
    expect(createAnalyticsDispatcher({ environment: "production" }).track(request)).toEqual({ reason: "consent-blocked", status: "dropped" });
  });

  it("is a no-op in Phase 8 because no provider exists", async () => {
    expect(createAnalyticsDispatcher({ consentState: "analytics-granted", environment: "production" }).track(request)).toEqual({ reason: "provider-missing", status: "dropped" });
  });

  it("deduplicates callback repeats and resets ephemeral state", async () => {
    const track = vi.fn(() => "accepted" as const);
    const dispatcher = createAnalyticsDispatcher({ consentState: "analytics-granted", environment: "production", provider: { configured: true, track } });
    expect(dispatcher.track(request)).toEqual({ status: "accepted" });
    expect(dispatcher.track(request)).toEqual({ reason: "duplicate", status: "dropped" });
    dispatcher.clear();
    expect(dispatcher.track(request)).toEqual({ status: "accepted" });
    expect(track).toHaveBeenCalledTimes(2);
  });

  it("isolates provider failure and invalid lifecycle", async () => {
    const dispatcher = createAnalyticsDispatcher({ consentState: "analytics-granted", environment: "production", provider: { configured: true, track: () => { throw new Error("provider failed"); } } });
    expect(dispatcher.track(request)).toEqual({ reason: "provider-failure", status: "dropped" });
    expect(dispatcher.track({ ...request, deduplicationToken: { ...request.deduplicationToken, action: 1 }, lifecycleEligible: false })).toEqual({ reason: "ineligible-lifecycle", status: "dropped" });
  });

  it.each(["offline", "provider-failure", "timeout"] as const)("drops a %s delivery without awaiting or retrying", (delivery) => {
    const track = vi.fn(() => delivery);
    const dispatcher = createAnalyticsDispatcher({ consentState: "analytics-granted", environment: "production", provider: { configured: true, track } });
    expect(dispatcher.track(request)).toEqual({ reason: delivery, status: "dropped" });
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("rejects mismatched event scopes and duplicate Strict Mode callbacks", () => {
    const track = vi.fn(() => "accepted" as const);
    const dispatcher = createAnalyticsDispatcher({ consentState: "analytics-granted", environment: "production", provider: { configured: true, track } });
    expect(dispatcher.track({ ...request, deduplicationToken: { ...request.deduplicationToken, scope: "action" } })).toEqual({ reason: "invalid-field", status: "dropped" });
    expect(dispatcher.track({ ...request, deduplicationToken: { ...request.deduplicationToken, action: 1 } })).toEqual({ reason: "invalid-field", status: "dropped" });
    expect(dispatcher.track(request)).toEqual({ status: "accepted" });
    expect(dispatcher.track(request)).toEqual({ reason: "duplicate", status: "dropped" });
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("uses only numeric lifecycle counters in deduplication keys", () => {
    const deduplicator = new EphemeralAnalyticsDeduplicator();
    expect(deduplicator.accept(request.deduplicationToken)).toBe(true);
    expect(deduplicator.accept(request.deduplicationToken)).toBe(false);
    expect(() => deduplicator.accept({ ...request.deduplicationToken, action: Number.NaN })).toThrow();
  });
});
