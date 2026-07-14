import { describe, expect, it } from "vitest";

import { RELEASE_GATES, type ReleaseRecord } from "@/lib/release/contracts";
import {
  requiredEvidenceForRiskTags,
  validateGoldenVectorDocument,
  validateReleaseRecord,
} from "@/lib/release/validation";

const today = new Date("2026-07-14T12:00:00Z");

function candidate(tags: ReleaseRecord["riskTags"] = ["platform-architecture"]): ReleaseRecord {
  const evidence = requiredEvidenceForRiskTags(tags).required.map((id) => ({
    id,
    reference: `evidence:${id}`,
    reviewedDate: "2026-07-14",
    status: id.includes("approval") || id.includes("review") ? "approved" as const : "passed" as const,
  }));
  return {
    recordVersion: 1,
    recordId: "2026-07-14-phase-9",
    status: "candidate",
    phaseOrUtility: "Phase 9",
    summary: "Testing and release evidence architecture.",
    riskTags: tags,
    planApproval: { approvedDate: "2026-07-14", approver: "Youtoola owner", reference: "owner-approved-phase-9-plan" },
    pullRequest: "pending",
    candidateCommit: "pending-review",
    evidence,
    exceptions: [],
    rollbackPlan: { method: "Restore the previous Ready deployment and revert main.", owner: "Youtoola owner", target: "current-production" },
    gateEvidence: Object.fromEntries(RELEASE_GATES.map((gate) => [gate, {
      approver: gate === "plan" ? "Youtoola owner" : null,
      evidence: gate === "plan" ? ["owner-approved-phase-9-plan"] : [],
      status: gate === "plan" ? "approved" : "pending",
    }])) as unknown as ReleaseRecord["gateEvidence"],
    versions: { analyticsSchema: 1, releaseSchema: 1 },
    production: null,
    followUpDates: { immediate: null, "24-hours": null, "7-days": null, "28-days": null, monthly: null, quarterly: null },
  };
}

function goldenVectors() {
  return {
    utilitySlug: "example-utility",
    calculationVersion: 1,
    vectors: [
      {
        vectorId: "reviewed-exact-case",
        purpose: "Prove the reviewed exact result.",
        inputs: { value: 10 },
        normalizedInputs: { value: 10 },
        expectedOutputs: { result: 20 },
        comparisonMode: "exact",
        roundingExpectation: "No rounding.",
        sourceOrDerivation: { kind: "independent-calculation", reference: "reviewed working", independentFromImplementation: true },
        reviewer: "Independent reviewer",
        reviewedDate: "2026-07-14",
        calculationVersion: 1,
      },
      {
        vectorId: "reviewed-decimal-case",
        purpose: "Prove a documented decimal tolerance.",
        inputs: { value: 1 },
        normalizedInputs: { value: 1 },
        expectedOutputs: { result: 0.3333 },
        comparisonMode: "decimal-tolerance",
        tolerance: { maximumPermittedError: 0.0001, reason: "Binary floating-point conversion.", displayedDecimalPlaces: 3, distanceToRoundingBoundary: 0.0002 },
        roundingExpectation: "Display to three decimals.",
        sourceOrDerivation: { kind: "authoritative-source", reference: "source table", independentFromImplementation: true },
        reviewer: "Independent reviewer",
        reviewedDate: "2026-07-14",
        calculationVersion: 1,
      },
    ],
  };
}

describe("release record validation", () => {
  it("accepts a complete candidate record with pending deployment fields absent", () => {
    expect(validateReleaseRecord(candidate(), today)).toEqual([]);
  });

  it("rejects missing evidence, approvals, rollback and stale dates", () => {
    const record = candidate();
    record.evidence = record.evidence.slice(1);
    record.planApproval = { ...record.planApproval, approver: "Someone else" as "Youtoola owner", approvedDate: "2020-01-01" };
    record.rollbackPlan = { method: "", owner: "Youtoola owner", target: "" };
    expect(validateReleaseRecord(record, today)).toEqual(expect.arrayContaining([
      expect.stringMatching(/^evidence:missing:/),
      "record:plan-approver",
      "record:plan-date",
      "record:rollback-plan",
    ]));
  });

  it("rejects invalid and unsupported exceptions", () => {
    const record = candidate();
    record.exceptions = [{
      id: "exception-1",
      requirementId: "qualified-independent-review",
      reason: "Skip it.",
      approver: "Youtoola owner",
      approvedDate: "2026-07-14",
      expiresOn: "2026-07-13",
      remediation: "Later.",
      severity: "high" as "medium",
    }];
    expect(validateReleaseRecord(record, today)).toEqual(expect.arrayContaining([
      "exception:unsupported:qualified-independent-review",
      "exception:dates",
      "exception:severity",
    ]));
  });

  it("requires versions, vectors and qualified evidence for high-consequence calculation changes", () => {
    const record = candidate(["calculation-change", "high-consequence"]);
    expect(validateReleaseRecord(record, today)).toEqual(expect.arrayContaining([
      "calculation:version",
      "methodology:version",
      "record:independent-review",
    ]));
    record.versions = { releaseSchema: 1, calculation: 2, methodology: 3 };
    record.independentReview = { reviewer: "Qualified reviewer", scope: "Formula and sources", reviewedDate: "2026-07-14", evidence: "review:123", qualified: true };
    expect(validateReleaseRecord(record, today)).toEqual([]);
  });

  it("requires exact completed deployment, rollback and immediate follow-up evidence", () => {
    const record = candidate();
    record.status = "completed";
    expect(validateReleaseRecord(record, today)).toContain("record:production-evidence");
    record.production = {
      mergeCommit: "a".repeat(40),
      deploymentId: "dpl_example",
      deploymentCommit: "b".repeat(40),
      liveUrls: ["https://www.youtoola.com"],
      smokeResults: ["Homepage returned HTTP 200."],
      rollbackDeployment: "dpl_previous",
      releaseDate: "2026-07-14",
    };
    expect(validateReleaseRecord(record, today)).toEqual(expect.arrayContaining([
      "production:commit-mismatch",
      "record:immediate-follow-up",
    ]));
    record.production.deploymentCommit = record.production.mergeCommit;
    record.followUpDates = { ...record.followUpDates, immediate: "2026-07-14" };
    record.gateEvidence = {
      ...record.gateEvidence,
      plan: { approver: "Youtoola owner", evidence: ["approved"], status: "approved" },
      build: { approver: null, evidence: ["complete"], status: "complete" },
      review: { approver: "Youtoola owner", evidence: ["approved"], status: "approved" },
      ship: { approver: "Youtoola owner", evidence: ["approved"], status: "approved" },
      "post-deployment": { approver: null, evidence: ["smoke"], status: "complete" },
    };
    expect(validateReleaseRecord(record, today)).toEqual([]);
  });

  it("rejects invalid follow-up dates and invalid deployment URLs", () => {
    const record = candidate();
    record.followUpDates = { ...record.followUpDates, "7-days": "not-a-date" };
    record.pullRequest = "http://github.example/pr";
    expect(validateReleaseRecord(record, today)).toEqual(expect.arrayContaining([
      "record:follow-up-date:7-days",
      "record:pull-request",
    ]));
  });
});

describe("golden vector validation", () => {
  it("accepts data-only independently derived exact and tolerance vectors", () => {
    expect(validateGoldenVectorDocument(goldenVectors(), today)).toEqual([]);
  });

  it("supports all six approved comparison modes", () => {
    const document = goldenVectors();
    const exact = document.vectors[0];
    document.vectors = [
      { ...exact, vectorId: "exact", comparisonMode: "exact" },
      { ...exact, vectorId: "integer", comparisonMode: "integer" },
      { ...exact, vectorId: "categorical", comparisonMode: "categorical", expectedOutputs: { result: "low" } as unknown as { result: number } },
      { ...exact, vectorId: "formatted", comparisonMode: "formatted-output", expectedOutputs: { result: "£20.00" } as unknown as { result: number } },
      { ...document.vectors[1], vectorId: "decimal", comparisonMode: "decimal-tolerance" },
      { ...document.vectors[1], vectorId: "relative", comparisonMode: "relative-tolerance" },
    ];
    expect(validateGoldenVectorDocument(document, today)).toEqual([]);
  });

  it("rejects broad tolerances and tolerances crossing a visible rounding boundary", () => {
    const document = goldenVectors();
    document.vectors[1].tolerance = { ...document.vectors[1].tolerance!, maximumPermittedError: 0.001, distanceToRoundingBoundary: 0.0005 };
    expect(validateGoldenVectorDocument(document, today)).toEqual(expect.arrayContaining([
      "vector:tolerance-exceeds-displayed-precision:reviewed-decimal-case",
      "vector:tolerance-crosses-rounding-boundary:reviewed-decimal-case",
    ]));
  });

  it("rejects tolerance on exact comparisons and implementation-derived expectations", () => {
    const document = goldenVectors();
    document.vectors[0] = {
      ...document.vectors[0],
      tolerance: { maximumPermittedError: 0.1, reason: "Broad.", displayedDecimalPlaces: 0, distanceToRoundingBoundary: 0.2 },
      sourceOrDerivation: { ...document.vectors[0].sourceOrDerivation, independentFromImplementation: false as true },
    };
    expect(validateGoldenVectorDocument(document, today)).toEqual(expect.arrayContaining([
      "vector:unexpected-tolerance:reviewed-exact-case",
      "vector:derivation:reviewed-exact-case",
    ]));
  });

  it("rejects stale vectors, nested data, duplicate IDs and calculation-version mismatch", () => {
    const document = goldenVectors();
    document.vectors[0].reviewedDate = "2020-01-01";
    (document.vectors[0] as unknown as { inputs: Record<string, unknown> }).inputs = { nested: { secret: true } };
    document.vectors[1].vectorId = document.vectors[0].vectorId;
    document.vectors[1].calculationVersion = 2;
    expect(validateGoldenVectorDocument(document, today)).toEqual(expect.arrayContaining([
      "vector:review-date:reviewed-exact-case",
      "vector:data:reviewed-exact-case",
      "vector:duplicate:reviewed-exact-case",
      "vector:calculation-version:reviewed-exact-case",
    ]));
  });
});
