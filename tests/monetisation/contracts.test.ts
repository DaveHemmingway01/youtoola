import { describe, expect, it } from "vitest";

import { shouldRenderCommercialCapability, validateCommercialCapability, type CommercialCapabilityDefinition } from "@/lib/monetisation/contracts";

const capability: CommercialCapabilityDefinition = {
  approvedPageLocation: "after-result",
  audienceRestrictions: [],
  disclosure: "Youtoola may earn a commission if you use this link, at no extra cost to you.",
  id: "commercial:test-affiliate",
  jurisdictionRestrictions: [],
  label: "Relevant recommendation",
  ownerApprovalReference: "phase-8-tests",
  permittedEvents: ["affiliate_click"],
  placementId: "after-result",
  placementType: "after-result",
  privacyClassification: "operational",
  providerStatus: "configured",
  reviewedDate: "2026-07-14",
  status: "active",
  type: "affiliate",
};

describe("commercial capability boundaries", () => {
  it("validates an approved contract without destinations or user state", () => {
    expect(validateCommercialCapability(capability)).toEqual([]);
    expect(capability).not.toHaveProperty("destinationUrl");
    expect(capability).not.toHaveProperty("userState");
  });

  it("fails closed for missing disclosure, invalid placement, unsafe activation and unknown URL fields", () => {
    expect(validateCommercialCapability({ ...capability, disclosure: "", destinationUrl: "https://example.com/?result=private", placementType: "before-result", providerStatus: "absent" })).toEqual(expect.arrayContaining(["invalid-disclosure", "invalid-placement", "unsafe-activation", "unknown-field"]));
  });

  it("renders only after the complete result and every approval gate", () => {
    const base = { capability, consentState: "marketing-granted" as const, environment: "production" as const, jurisdictionApproved: true, ownerApproved: true, placementApproved: true, resultAvailable: true, utilityEligibleCapabilityIds: [capability.id] };
    expect(shouldRenderCommercialCapability(base)).toBe(true);
    expect(shouldRenderCommercialCapability({ ...base, resultAvailable: false })).toBe(false);
    expect(shouldRenderCommercialCapability({ ...base, capability: { ...capability, status: "inactive" } })).toBe(false);
    expect(shouldRenderCommercialCapability({ ...base, capability: { ...capability, providerStatus: "absent" } })).toBe(false);
    expect(shouldRenderCommercialCapability({ ...base, environment: "preview" })).toBe(false);
    expect(shouldRenderCommercialCapability({ ...base, jurisdictionApproved: false })).toBe(false);
  });
});
