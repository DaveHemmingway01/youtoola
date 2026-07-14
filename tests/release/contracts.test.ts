import { describe, expect, it } from "vitest";

import {
  canAdvanceGate,
  compareGoldenValue,
  GATE_DEFINITIONS,
  PERFORMANCE_BUDGETS,
  RELEASE_GATES,
  RISK_EVIDENCE,
  SEVERITY_POLICY,
} from "@/lib/release/contracts";
import { assessPerformanceMeasurement, requiredEvidenceForRiskTags } from "@/lib/release/validation";

describe("release architecture contracts", () => {
  it("defines every release gate with evidence, checks, authority, failure and reporting rules", () => {
    expect(GATE_DEFINITIONS.map(({ gate }) => gate)).toEqual(RELEASE_GATES);
    for (const definition of GATE_DEFINITIONS) {
      expect(definition.approver).toBe("Youtoola owner");
      expect(definition.evidence.length).toBeGreaterThan(0);
      expect(definition.automatedChecks.length).toBeGreaterThan(0);
      expect(definition.manualChecks.length).toBeGreaterThan(0);
      expect(definition.failureBehavior).toBeTruthy();
      expect(definition.permittedFixes).toBeTruthy();
      expect(definition.scopeChangeHandling).toMatch(/PLAN|REVIEW|scope/i);
      expect(definition.reportRequirements.length).toBeGreaterThan(0);
    }
  });

  it("unions additive risk evidence deterministically", () => {
    const selection = requiredEvidenceForRiskTags(["metadata-indexing", "analytics-consent"]);
    expect(selection.issues).toEqual([]);
    expect(selection.required).toContain("seo-validation");
    expect(selection.required).toContain("sensitive-data-tests");
    expect(selection.required).toContain("rollback-plan");
    expect(selection.required).toEqual([...selection.required].sort());
  });

  it("fails closed for unknown, duplicate, and contradictory risk tags", () => {
    expect(requiredEvidenceForRiskTags(["unknown"]).issues).toEqual(["risk-tags:unknown:unknown"]);
    expect(requiredEvidenceForRiskTags(["public-content", "public-content"]).issues).toContain("risk-tags:duplicate:public-content");
    expect(requiredEvidenceForRiskTags(["documentation-only", "public-content"]).issues).toContain("risk-tags:documentation-only-contradiction");
    expect(requiredEvidenceForRiskTags(["high-consequence"]).issues).toContain("risk-tags:high-consequence-requires-calculation-change");
  });

  it("keeps documentation-only evidence proportionate", () => {
    const selection = requiredEvidenceForRiskTags(["documentation-only"]);
    expect(selection.issues).toEqual([]);
    expect(selection.required).toContain("documentation-validation");
    expect(selection.required).not.toContain("browser-tests");
    expect(selection.required).not.toContain("production-smoke-plan");
  });

  it("maps metadata, analytics, commercial and calculation tags to their specialist evidence", () => {
    expect(RISK_EVIDENCE["metadata-indexing"]).toContain("crawler-validation");
    expect(RISK_EVIDENCE["analytics-consent"]).toContain("privacy-review");
    expect(RISK_EVIDENCE["commercial-activation"]).toContain("legal-review");
    expect(RISK_EVIDENCE["commercial-activation"]).toContain("approved-placement");
    expect(RISK_EVIDENCE["calculation-change"]).toContain("golden-vectors");
  });

  it("encodes the exact approved performance budgets and hard-failure behavior", () => {
    expect(PERFORMANCE_BUDGETS).toContainEqual({ id: "review-route-js", warning: 6, hard: 6, unit: "gzip-kb" });
    expect(PERFORMANCE_BUDGETS).toContainEqual({ id: "event-validation", warning: 1, hard: 2, unit: "average-ms" });
    expect(PERFORMANCE_BUDGETS).toContainEqual({ id: "cls", warning: 0.05, hard: 0.1, unit: "score" });
    expect(assessPerformanceMeasurement("utility-island-js", 10).outcome).toBe("pass");
    expect(assessPerformanceMeasurement("utility-island-js", 14).outcome).toBe("warning");
    expect(assessPerformanceMeasurement("utility-island-js", 17).outcome).toBe("hard-failure");
    expect(assessPerformanceMeasurement("unknown", 1).outcome).toBe("invalid");
  });

  it("makes Critical and High findings non-exceptionable release blockers", () => {
    expect(SEVERITY_POLICY.critical).toMatchObject({ merge: "blocked", ship: "blocked", exceptionEligible: false, notification: "immediate" });
    expect(SEVERITY_POLICY.high).toMatchObject({ merge: "blocked", ship: "blocked", exceptionEligible: false, notification: "same day" });
    expect(SEVERITY_POLICY.medium.exceptionEligible).toBe(true);
  });

  it("never lets automation advance a gate and reserves approval for the owner", () => {
    const gates = Object.fromEntries(RELEASE_GATES.map((gate) => [gate, {
      approver: gate === "plan" ? "Youtoola owner" : null,
      evidence: [],
      status: gate === "plan" ? "approved" : "pending",
    }])) as unknown as Parameters<typeof canAdvanceGate>[0];
    expect(canAdvanceGate(gates, "build", "complete", "automation")).toBe(false);
    expect(canAdvanceGate(gates, "build", "complete", "operator")).toBe(true);
    expect(canAdvanceGate(gates, "build", "approved", "operator")).toBe(false);
    expect(canAdvanceGate(gates, "build", "approved", "owner")).toBe(true);
    expect(canAdvanceGate(gates, "review", "approved", "owner")).toBe(false);
  });

  it("applies all six approved comparison modes", () => {
    const tolerance = { maximumPermittedError: 0.01, reason: "Reviewed conversion.", displayedDecimalPlaces: 1, distanceToRoundingBoundary: 0.02 };
    expect(compareGoldenValue(2, 2, "exact")).toBe(true);
    expect(compareGoldenValue(2, 2, "integer")).toBe(true);
    expect(compareGoldenValue(2.005, 2, "decimal-tolerance", tolerance)).toBe(true);
    expect(compareGoldenValue(100.005, 100, "relative-tolerance", tolerance)).toBe(true);
    expect(compareGoldenValue("low", "low", "categorical")).toBe(true);
    expect(compareGoldenValue("£2.00", "£2.00", "formatted-output")).toBe(true);
    expect(compareGoldenValue(2.02, 2, "decimal-tolerance", tolerance)).toBe(false);
  });
});
