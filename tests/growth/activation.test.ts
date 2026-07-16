import { describe, expect, it } from "vitest";

import activation from "@/data/growth/activation.json";
import foundation from "@/data/growth/foundation.json";
import type { GrowthActivationRecord } from "@/lib/growth/contracts";
import { validateGrowthActivationRecord } from "@/lib/growth/validation";

describe("Growth Activation record", () => {
  it("records accepted legal and verified GA4 configuration while activation remains dormant", () => {
    expect(validateGrowthActivationRecord(activation as unknown as GrowthActivationRecord)).toEqual([]);
    expect(activation.activationState).toBe("legally-approved");
    expect(activation.legalPrivacy).toEqual({
      approvalReference: "YT-PRIV-2026-07-15-01 / PT99T0-1300-BG",
      jurisdictions: ["PT", "EU/EEA"],
      status: "approved",
    });
    expect(activation.searchConsole).toMatchObject({
      property: "youtoola.com",
      propertyType: "domain",
      status: "verified",
      verificationMethod: "dns-txt",
    });
    expect(activation.bing).toMatchObject({
      site: "youtoola.com",
      status: "verified",
      verificationMethod: "imported-from-google-search-console",
    });
    expect(activation.searchConsole.urlInspections).toHaveLength(5);
    expect(activation.bing.urlInspections).toHaveLength(5);
    expect([
      ...activation.searchConsole.urlInspections,
      ...activation.bing.urlInspections,
    ].every(({ indexStatus }) => indexStatus === "pending")).toBe(true);
    expect(activation.sitemapSubmission).toMatchObject({
      status: "accepted",
      google: { discoveredUrls: 5, processingStatus: "successfully-processed", status: "submitted" },
      bing: { discoveredUrls: 5, processingStatus: "successfully-processed", status: "submitted" },
    });
    expect(activation.analytics).toMatchObject({
      status: "partially-configured",
      measurementIdStatus: "configured",
      productionVariables: "not-configured",
      settingsVerification: "verified",
      customDimensionConfiguration: "not-configured",
      keyEventConfiguration: "not-configured",
      debugView: "pending",
      configuration: {
        accountDisplayName: "Youtoola",
        propertyDisplayName: "Youtoola Production",
        propertyId: "545783566",
        reportingCurrency: "EUR",
        reportingTimeZone: "Europe/Lisbon",
        streamDisplayName: "Youtoola",
        streamId: "15263953983",
        streamUrl: "https://www.youtoola.com",
        measurementIdFingerprint: "sha256:96718192b2e08dc78eec82cd444dbdf359b3d6bbcf550c1ae0a96f81b10fe67b",
      },
    });
    expect(activation.analytics.retention).toEqual({
      eventDataMonths: 2,
      userDataMonths: 2,
      resetOnNewUserActivity: false,
    });
    expect(activation.analytics.customDimensions).toEqual([
      "utility_id",
      "error_code",
      "time_to_result_bucket",
    ]);
    expect(activation.analytics.settings).toMatchObject({
      automaticPageViews: false,
      browserHistoryPageViews: false,
      enhancedMeasurementStatus: "page-view-category-google-locked-on-optional-events-off",
    });
    expect(Object.values(activation.analytics.settings.optionalEnhancedMeasurementEvents).every((value) => value === false)).toBe(true);
    expect(activation.evidence.externalConfiguration).toBe("pending");
    expect(JSON.stringify(activation)).not.toMatch(/token|credential|oauth|api.?key/i);
    expect(foundation.analytics.activation).toBe("disabled");
    expect(foundation.analytics.legalPrivacyApproval).toBe("pending");
  });

  it("fails closed for unknown fields and premature active state claims", () => {
    expect(validateGrowthActivationRecord({ ...activation, unexpected: true })).toContain("activation-record-fields");
    expect(validateGrowthActivationRecord({ ...activation, activationState: "active" })).toEqual(
      expect.arrayContaining([
        "activation-transition:external",
        "activation-transition:ready",
        "activation-transition:active",
      ]),
    );
  });

  it("requires external evidence before an activation-ready transition", () => {
    const premature = {
      ...activation,
      activationState: "activation-ready",
      legalPrivacy: {
        approvalReference: "qualified-review-reference",
        jurisdictions: ["EU/EEA", "UK"],
        status: "approved",
      },
      privacyContact: { address: "privacy@youtoola.com", status: "operational" },
    };
    expect(validateGrowthActivationRecord(premature)).toEqual(
      expect.arrayContaining(["activation-transition:external", "activation-transition:ready"]),
    );
  });

  it("rejects every unsupported activation-state success claim", () => {
    const activeWithoutLegal = structuredClone(activation);
    activeWithoutLegal.activationState = "active";
    activeWithoutLegal.legalPrivacy = {
      approvalReference: null as never,
      jurisdictions: [],
      status: "pending",
    };
    expect(validateGrowthActivationRecord(activeWithoutLegal)).toContain("activation-transition:legal");

    const activeWithoutVariables = structuredClone(activation);
    activeWithoutVariables.activationState = "active";
    expect(validateGrowthActivationRecord(activeWithoutVariables)).toContain("activation-transition:ready");

    const readyWithoutMeasurementEvidence = structuredClone(activation);
    readyWithoutMeasurementEvidence.activationState = "activation-ready";
    readyWithoutMeasurementEvidence.analytics.status = "configured";
    readyWithoutMeasurementEvidence.analytics.measurementIdStatus = "not-configured";
    readyWithoutMeasurementEvidence.analytics.productionVariables = "configured";
    readyWithoutMeasurementEvidence.evidence.externalConfiguration = "complete";
    expect(validateGrowthActivationRecord(readyWithoutMeasurementEvidence)).toContain("activation-transition:external");

    const productionWithPendingConsentPolicy = structuredClone(activation);
    productionWithPendingConsentPolicy.activationState = "active";
    productionWithPendingConsentPolicy.legalPrivacy = {
      approvalReference: null as never,
      jurisdictions: [],
      status: "pending",
    };
    productionWithPendingConsentPolicy.evidence.productionActivation = "complete";
    expect(validateGrowthActivationRecord(productionWithPendingConsentPolicy)).toContain("activation-transition:legal");

    const dormantDebugView = structuredClone(activation);
    dormantDebugView.analytics.debugView = "verified";
    expect(validateGrowthActivationRecord(dormantDebugView)).toContain("debug-view-without-production-evidence");

    const unsupportedCustomDimensions = structuredClone(activation);
    unsupportedCustomDimensions.analytics.customDimensionConfiguration = "verified";
    expect(validateGrowthActivationRecord(unsupportedCustomDimensions)).toContain("custom-dimensions-without-evidence");

    const unsupportedKeyEvent = structuredClone(activation);
    unsupportedKeyEvent.analytics.keyEventConfiguration = "verified";
    expect(validateGrowthActivationRecord(unsupportedKeyEvent)).toContain("key-event-without-evidence");
  });

  it("rejects unsupported indexing claims and contradictory sitemap evidence", () => {
    const claimedIndexed = structuredClone(activation);
    claimedIndexed.searchConsole.urlInspections[0].indexStatus = "indexed" as never;
    expect(validateGrowthActivationRecord(claimedIndexed)).toContain("search-console-index-status");

    const wrongSitemapCount = structuredClone(activation);
    wrongSitemapCount.sitemapSubmission.google.discoveredUrls = 6 as never;
    expect(validateGrowthActivationRecord(wrongSitemapCount)).toContain("activation-sitemap-google-urls");

    const acceptedWithoutProviderEvidence = structuredClone(activation) as Record<string, unknown>;
    delete (acceptedWithoutProviderEvidence.sitemapSubmission as Record<string, unknown>).google;
    expect(validateGrowthActivationRecord(acceptedWithoutProviderEvidence)).toContain("activation-sitemap-fields");
  });

  it("rejects unsupported GA4 identity and contradictory settings evidence", () => {
    const unsupportedProperty = structuredClone(activation);
    unsupportedProperty.analytics.configuration.propertyId = "123456789" as never;
    expect(validateGrowthActivationRecord(unsupportedProperty)).toContain("analytics-property-id");

    const automaticHistory = structuredClone(activation);
    automaticHistory.analytics.settings.browserHistoryPageViews = true as never;
    expect(validateGrowthActivationRecord(automaticHistory)).toContain("prohibited-analytics-setting");

    const optionalScrolls = structuredClone(activation);
    optionalScrolls.analytics.settings.optionalEnhancedMeasurementEvents.scrolls = true as never;
    expect(validateGrowthActivationRecord(optionalScrolls)).toContain("prohibited-enhanced-measurement-event");
  });
});
