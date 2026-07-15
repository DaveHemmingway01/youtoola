import { describe, expect, it } from "vitest";

import activation from "@/data/growth/activation.json";
import foundation from "@/data/growth/foundation.json";
import type { GrowthActivationRecord } from "@/lib/growth/contracts";
import { validateGrowthActivationRecord } from "@/lib/growth/validation";

describe("Growth Activation record", () => {
  it("records only factual pending activation evidence and preserves the Unit 2 baseline", () => {
    expect(validateGrowthActivationRecord(activation as unknown as GrowthActivationRecord)).toEqual([]);
    expect(JSON.stringify(activation)).not.toMatch(/G-[A-Z0-9]{4,20}|token|credential|oauth|api.?key/i);
    expect(foundation.analytics.activation).toBe("disabled");
    expect(foundation.analytics.legalPrivacyApproval).toBe("pending");
  });

  it("fails closed for unknown fields and premature active state claims", () => {
    expect(validateGrowthActivationRecord({ ...activation, unexpected: true })).toContain("activation-record-fields");
    expect(validateGrowthActivationRecord({ ...activation, activationState: "active" })).toEqual(
      expect.arrayContaining([
        "activation-transition:legal",
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
});
