import { describe, expect, it } from "vitest";

import activation from "@/data/growth/activation.json";
import foundation from "@/data/growth/foundation.json";
import type { GrowthActivationRecord } from "@/lib/growth/contracts";
import { validateGrowthActivationRecord } from "@/lib/growth/validation";

describe("Growth Activation record", () => {
  it("records accepted legal evidence, pending external evidence and the frozen Unit 2 baseline", () => {
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
    expect(JSON.stringify(activation)).not.toMatch(/G-[A-Z0-9]{4,20}|token|credential|oauth|api.?key/i);
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
});
