import { describe, expect, it, vi } from "vitest";

import { analyticsSchemaVersion, type UtilityAnalyticsEligibility } from "@/lib/analytics/contracts";
import { createAnalyticsDispatcher, EphemeralAnalyticsDeduplicator, isAnalyticsConsentGranted, isAnalyticsEnvironmentEligible } from "@/lib/analytics/runtime";

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
const payload = { analyticsSchemaVersion, categoryId: "test", consentState: "analytics-granted", environment: "production", eventName: "tool_view", locale: "en", pageType: "utility", utilityId: "test", utilitySlug: "test" };
const request = { deduplicationToken: { action: 0, cycle: 0, eventName: "tool_view" as const, scope: "route" as const }, eligibility, lifecycleEligible: true, payload };

describe("analytics runtime gates", () => {
  it("blocks Local, Preview, unknown, denied and marketing-only states", async () => {
    expect(isAnalyticsEnvironmentEligible("local")).toBe(false);
    expect(isAnalyticsEnvironmentEligible("preview")).toBe(false);
    expect(isAnalyticsConsentGranted("unknown")).toBe(false);
    expect(isAnalyticsConsentGranted("denied")).toBe(false);
    expect(isAnalyticsConsentGranted("marketing-granted")).toBe(false);
    await expect(createAnalyticsDispatcher({ consentState: "analytics-granted", environment: "preview" }).track(request)).resolves.toEqual({ reason: "environment-blocked", status: "dropped" });
    await expect(createAnalyticsDispatcher({ consentState: "unknown", environment: "production" }).track(request)).resolves.toEqual({ reason: "consent-blocked", status: "dropped" });
  });

  it("is a no-op in Phase 8 because no provider exists", async () => {
    await expect(createAnalyticsDispatcher({ consentState: "analytics-granted", environment: "production" }).track(request)).resolves.toEqual({ reason: "provider-missing", status: "dropped" });
  });

  it("deduplicates callback repeats and resets ephemeral state", async () => {
    const track = vi.fn();
    const dispatcher = createAnalyticsDispatcher({ consentState: "analytics-granted", environment: "production", provider: { configured: true, track } });
    await expect(dispatcher.track(request)).resolves.toEqual({ status: "accepted" });
    await expect(dispatcher.track(request)).resolves.toEqual({ reason: "duplicate", status: "dropped" });
    dispatcher.clear();
    await expect(dispatcher.track(request)).resolves.toEqual({ status: "accepted" });
    expect(track).toHaveBeenCalledTimes(2);
  });

  it("isolates provider failure and invalid lifecycle", async () => {
    const dispatcher = createAnalyticsDispatcher({ consentState: "analytics-granted", environment: "production", provider: { configured: true, track: () => { throw new Error("provider failed"); } } });
    await expect(dispatcher.track(request)).resolves.toEqual({ reason: "provider-failure", status: "dropped" });
    await expect(dispatcher.track({ ...request, deduplicationToken: { ...request.deduplicationToken, action: 1 }, lifecycleEligible: false })).resolves.toEqual({ reason: "ineligible-lifecycle", status: "dropped" });
  });

  it("uses only numeric lifecycle counters in deduplication keys", () => {
    const deduplicator = new EphemeralAnalyticsDeduplicator();
    expect(deduplicator.accept(request.deduplicationToken)).toBe(true);
    expect(deduplicator.accept(request.deduplicationToken)).toBe(false);
    expect(() => deduplicator.accept({ ...request.deduplicationToken, action: Number.NaN })).toThrow();
  });
});
