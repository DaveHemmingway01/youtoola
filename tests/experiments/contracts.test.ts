import { describe, expect, it } from "vitest";

import { REQUIRED_EXPERIMENT_STOP_CONDITIONS, validateExperimentDefinition, type ExperimentDefinition } from "@/lib/experiments/contracts";

const experiment: ExperimentDefinition = {
  accessibilityReview: "approved",
  decisionRule: "Ship only when the primary metric improves and guardrails hold.",
  endCriteria: ["Minimum sample reached and review period ended."],
  guardrailMetrics: ["completion_rate", "core_web_vitals"],
  hypothesis: "Clearer discovery copy increases directory movement without reducing completion.",
  id: "experiment:discovery-copy",
  minimumDetectableEffectPercent: 5,
  minimumSampleRequirement: 1000,
  owner: "Youtoola owner",
  ownerApprovalReference: "phase-8-tests",
  primaryMetric: "directory_to_tool_movement",
  privacyReview: "approved",
  reviewedDate: "2026-07-14",
  rollback: "Restore the control copy and stop assignment.",
  seoReview: "approved",
  startCriteria: ["Owner approval and all baseline checks passed."],
  status: "approved-disabled",
  stopConditions: REQUIRED_EXPERIMENT_STOP_CONDITIONS,
  subject: "copy",
  variants: [{ allocationPercent: 50, id: "control" }, { allocationPercent: 50, id: "clearer-copy" }],
};

describe("experiment governance validation", () => {
  it("accepts a complete owner-approved definition", () => {
    expect(validateExperimentDefinition(experiment)).toEqual([]);
  });

  it("rejects forbidden subjects and calculation or SEO mutation fields", () => {
    expect(validateExperimentDefinition({ ...experiment, subject: "formula", formulaVersion: 2 })).toEqual(expect.arrayContaining(["invalid-subject", "unknown-field"]));
    expect(validateExperimentDefinition({ ...experiment, canonicalUrl: "https://example.com" })).toContain("unknown-field");
  });

  it.each([
    "copy",
    "layout",
    "related-tool-ordering",
    "discovery-wording",
    "commercial-placement-wording",
    "non-critical-default-presentation",
  ] as const)("accepts the approved %s subject", (subject) => {
    expect(validateExperimentDefinition({ ...experiment, subject })).toEqual([]);
  });

  it("requires guardrails, approval, rollback, allocation, metrics and stop conditions", () => {
    const invalid = { ...experiment, guardrailMetrics: "none", ownerApprovalReference: "", rollback: "", primaryMetric: "invalid metric", variants: [{ id: "control", allocationPercent: 80 }, { id: "test", allocationPercent: 10 }], stopConditions: [] };
    expect(validateExperimentDefinition(invalid)).toEqual(expect.arrayContaining(["invalid-metric", "invalid-owner-approval-reference", "invalid-rule", "invalid-allocation", "invalid-stop-condition"]));
  });
});
