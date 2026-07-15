import { describe, expect, it } from "vitest";

import activation from "@/data/growth/activation.json";
import foundation from "@/data/growth/foundation.json";
import type { GrowthActivationRecord } from "@/lib/growth/contracts";
import { validateGrowthActivationRecord } from "@/lib/growth/validation";

describe("Growth Activation record", () => {
  it("records accepted legal and partial GA4 evidence while external activation remains pending", () => {
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
      settingsVerification: "pending",
      configuration: {
        accountDisplayName: null,
        propertyDisplayName: null,
        propertyId: null,
        streamDisplayName: "Youtoola",
        streamId: "15263953983",
        streamUrl: "https://www.youtoola.com",
        measurementIdFingerprint: "sha256:96718192b2e08dc78eec82cd444dbdf359b3d6bbcf550c1ae0a96f81b10fe67b",
      },
    });
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

  it("rejects unsupported indexing claims and contradictory sitemap evidence", () => {
    const claimedIndexed = structuredClone(activation);
    claimedIndexed.searchConsole.urlInspections[0].indexStatus = "indexed" as never;
    expect(validateGrowthActivationRecord(claimedIndexed)).toContain("search-console-index-status");

    const wrongSitemapCount = structuredClone(activation);
    wrongSitemapCount.sitemapSubmission.google.discoveredUrls = 6 as never;
    expect(validateGrowthActivationRecord(wrongSitemapCount)).toContain("activation-sitemap-google-urls");
  });

  it("rejects unsupported GA4 identity and completed-settings claims", () => {
    const unsupportedProperty = structuredClone(activation);
    unsupportedProperty.analytics.configuration.propertyId = "123456789" as never;
    expect(validateGrowthActivationRecord(unsupportedProperty)).toContain("unverified-analytics-property-id");

    const prematureSettings = structuredClone(activation);
    prematureSettings.analytics.settingsVerification = "verified" as never;
    expect(validateGrowthActivationRecord(prematureSettings)).toContain("analytics-partial-configuration");
  });
});
