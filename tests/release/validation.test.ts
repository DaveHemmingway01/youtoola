import { describe, expect, it } from "vitest";

import { RELEASE_GATES, type ReleaseCorrectionRecord, type ReleaseRecord } from "@/lib/release/contracts";
import {
  getOverdueFollowUpReviews,
  requiredEvidenceForRiskTags,
  validateCorrectionReferences,
  validateGoldenVectorDocument,
  validateReleaseProvenanceHistory,
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
    recordVersion: 3,
    recordKind: "release",
    recordId: "2026-07-14-phase-9",
    status: "candidate",
    phaseOrUtility: "Phase 9",
    summary: "Testing and release evidence architecture.",
    riskTags: tags,
    planApproval: { approvedDate: "2026-07-14", approver: "Youtoola owner", reference: "owner-approved-phase-9-plan" },
    pullRequest: "pending",
    provenance: {
      pullRequest: "pending",
      sourceBranch: "origin/main",
      sourceCommit: "c".repeat(40),
      reviewedHeadCommit: "pending-review",
      reviewedHeadRef: "platform/release-gates",
      reviewedDate: null,
      mergeMethod: null,
      mergeCommit: null,
      durableReleaseCommit: null,
      mergedAt: null,
    },
    delivery: {
      branch: "platform/release-gates",
      releaseKind: "normal",
      preview: null,
      productionUnchangedBeforeMerge: true,
      requiredChecks: ["Quality", "End-to-end", "Vercel"].map((name) => ({
        name: name as "Quality" | "End-to-end" | "Vercel",
        reference: null,
        status: "pending" as const,
      })),
    },
    evidence,
    exceptions: [],
    rollbackPlan: { method: "Restore the previous Ready deployment and revert main.", owner: "Youtoola owner", target: "current-production" },
    gateEvidence: Object.fromEntries(RELEASE_GATES.map((gate) => [gate, {
      approver: gate === "plan" ? "Youtoola owner" : null,
      evidence: gate === "plan" ? ["owner-approved-phase-9-plan"] : [],
      status: gate === "plan" ? "approved" : "pending",
    }])) as unknown as ReleaseRecord["gateEvidence"],
    versions: { analyticsSchema: 1, releaseSchema: 3 },
    production: null,
    followUpReviews: Object.fromEntries(
      ["immediate", "24-hour", "7-day", "28-day", "monthly", "quarterly"].map((period) => [period, {
        completedDate: null,
        dueDate: null,
        evidence: [],
        notApplicableReason: null,
        owner: "Youtoola owner",
        status: "pending",
      }]),
    ) as unknown as ReleaseRecord["followUpReviews"],
  };
}

function completed(): ReleaseRecord {
  const record = candidate();
  const durableCommit = "a".repeat(40);
  record.rollbackPlan = {
    ...record.rollbackPlan,
    target: "dpl_previous",
  };
  record.status = "completed";
  record.pullRequest = "https://github.com/DaveHemmingway01/youtoola/pull/11";
  record.provenance = {
    pullRequest: record.pullRequest,
    sourceBranch: "origin/main",
    sourceCommit: "c".repeat(40),
    reviewedHeadCommit: "b".repeat(40),
    reviewedHeadRef: "platform/release-gates",
    reviewedDate: "2026-07-14",
    mergeMethod: "squash",
    mergeCommit: durableCommit,
    durableReleaseCommit: durableCommit,
    mergedAt: "2026-07-14T10:00:00.000Z",
  };
  record.delivery = {
    ...record.delivery,
    preview: {
      branchAlias: "https://youtoola-git-platform-release-gates-davincistudio.vercel.app/",
      deploymentCommit: "b".repeat(40),
      deploymentId: "dpl_preview",
      noindex: true,
      protected: true,
      ready: true,
      uniqueUrl: "https://youtoola-example-davincistudio.vercel.app/",
    },
    requiredChecks: ["Quality", "End-to-end", "Vercel"].map((name) => ({
      name: name as "Quality" | "End-to-end" | "Vercel",
      reference: "https://github.com/DaveHemmingway01/youtoola/actions/runs/1",
      status: "passed" as const,
    })),
  };
  record.production = {
    mergeCommit: durableCommit,
    deploymentId: "dpl_example",
    deploymentCommit: durableCommit,
    deployedAt: "2026-07-14T10:05:00.000Z",
    liveUrls: ["https://www.youtoola.com"],
    smokeResults: ["Homepage returned HTTP 200."],
    rollbackDeployment: "dpl_previous",
    releaseDate: "2026-07-14",
  };
  record.followUpReviews = Object.fromEntries(
    Object.entries(record.followUpReviews).map(([period, review]) => [
      period,
      period === "immediate"
        ? {
            ...review,
            completedDate: "2026-07-14",
            dueDate: "2026-07-14",
            evidence: ["Production smoke passed."],
            status: "complete",
          }
        : { ...review, dueDate: "2026-07-15" },
    ]),
  ) as unknown as ReleaseRecord["followUpReviews"];
  record.gateEvidence = {
    ...record.gateEvidence,
    plan: { approver: "Youtoola owner", evidence: ["approved"], status: "approved" },
    build: { approver: null, evidence: ["complete"], status: "complete" },
    review: { approver: "Youtoola owner", evidence: ["approved"], status: "approved" },
    ship: { approver: "Youtoola owner", evidence: ["approved"], status: "approved" },
    "post-deployment": { approver: null, evidence: ["smoke"], status: "complete" },
  };
  return record;
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

  it("does not permit a candidate to claim a review date before its reviewed head exists", () => {
    const record = candidate();
    record.provenance.reviewedDate = "2026-07-14";
    expect(validateReleaseRecord(record, today)).toContain(
      "provenance:reviewed-date-contradiction",
    );
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
    record.versions = { releaseSchema: 3, calculation: 2, methodology: 3 };
    record.independentReview = { reviewer: "Qualified reviewer", scope: "Formula and sources", reviewedDate: "2026-07-14", evidence: "review:123", qualified: true };
    expect(validateReleaseRecord(record, today)).toEqual([]);
  });

  it("requires exact completed deployment, rollback and immediate follow-up evidence", () => {
    const record = candidate();
    record.status = "completed";
    expect(validateReleaseRecord(record, today)).toContain("record:production-evidence");
    expect(validateReleaseRecord(completed(), today)).toEqual([]);
  });

  it("keeps the reviewed head separate from a squash merge and durable release commit", () => {
    const record = completed();
    expect(record.provenance.reviewedHeadCommit).not.toBe(record.provenance.mergeCommit);
    expect(record.provenance.mergeCommit).toBe(record.provenance.durableReleaseCommit);
    expect(record.production?.deploymentCommit).toBe(record.provenance.durableReleaseCommit);
    expect(validateReleaseRecord(record, today)).toEqual([]);
  });

  it("fails closed for missing or unrelated provenance commits", () => {
    const missingReviewedHead = completed();
    missingReviewedHead.provenance.reviewedHeadCommit = "";
    expect(validateReleaseRecord(missingReviewedHead, today)).toContain("provenance:reviewed-head");

    const missingMerge = completed();
    missingMerge.provenance.mergeCommit = null;
    expect(validateReleaseRecord(missingMerge, today)).toContain("provenance:merge-commit");

    const unrelatedDurable = completed();
    unrelatedDurable.provenance.durableReleaseCommit = "c".repeat(40);
    expect(validateReleaseRecord(unrelatedDurable, today)).toEqual(expect.arrayContaining([
      "provenance:durable-commit-mismatch",
      "production:provenance-mismatch",
    ]));
  });

  it("fails closed for a mismatched pull request and impossible chronology", () => {
    const mismatchedPullRequest = completed();
    mismatchedPullRequest.provenance.pullRequest = "https://github.com/DaveHemmingway01/youtoola/pull/12";
    expect(validateReleaseRecord(mismatchedPullRequest, today)).toContain("provenance:pull-request-mismatch");

    const impossibleChronology = completed();
    impossibleChronology.provenance.mergedAt = "2026-07-14T11:00:00.000Z";
    impossibleChronology.production!.deployedAt = "2026-07-14T10:00:00.000Z";
    expect(validateReleaseRecord(impossibleChronology, today)).toContain("provenance:chronology");
  });

  it("fails closed for fabricated deployment evidence and incomplete completed records", () => {
    const fabricated = completed();
    fabricated.production!.deploymentId = "invented";
    fabricated.production!.deploymentCommit = "d".repeat(40);
    expect(validateReleaseRecord(fabricated, today)).toEqual(expect.arrayContaining([
      "production:deployment-evidence",
      "production:commit-mismatch",
      "production:provenance-mismatch",
    ]));

    const fabricatedRollback = completed();
    fabricatedRollback.production!.rollbackDeployment = "dpl_fabricated";
    expect(validateReleaseRecord(fabricatedRollback, today)).toContain(
      "production:rollback-mismatch",
    );

    const incomplete = completed();
    incomplete.production = null;
    expect(validateReleaseRecord(incomplete, today)).toContain("record:production-evidence");
  });

  it("validates reviewed and durable commits against separate Git histories", () => {
    const record = completed();
    const validProbe = {
      commitExists: () => true,
      isAncestor: (commit: string, ref: string) =>
        (commit === record.provenance.sourceCommit && ref === "HEAD") ||
        (commit === record.provenance.sourceCommit && ref === record.provenance.reviewedHeadCommit) ||
        (commit === record.provenance.reviewedHeadCommit && ref === `refs/remotes/origin/${record.provenance.reviewedHeadRef}`) ||
        (commit === record.provenance.durableReleaseCommit && ref === "HEAD"),
      refExists: () => true,
    };
    expect(validateReleaseProvenanceHistory(record, validProbe)).toEqual([]);
    expect(validProbe.isAncestor(record.provenance.reviewedHeadCommit, "HEAD")).toBe(false);

    expect(validateReleaseProvenanceHistory(record, { ...validProbe, commitExists: () => false })).toEqual(expect.arrayContaining([
      "provenance:source-commit-not-found",
      "provenance:reviewed-head-not-found",
      "provenance:durable-release-commit-not-in-main-history",
    ]));
    expect(validateReleaseProvenanceHistory(record, { ...validProbe, refExists: () => false })).toContain("provenance:reviewed-head-ref-not-found");
    expect(validateReleaseProvenanceHistory(record, { ...validProbe, isAncestor: () => false })).toEqual(expect.arrayContaining([
      "provenance:reviewed-head-ref-mismatch",
      "provenance:durable-release-commit-not-in-main-history",
    ]));
  });

  it("validates structured completion and not-applicable review evidence", () => {
    const record = completed();
    record.followUpReviews = {
      ...record.followUpReviews,
      "7-day": {
        ...record.followUpReviews["7-day"],
        completedDate: "2026-07-14",
        evidence: ["Owner approved no indexing evidence before Phase 11."],
        notApplicableReason: "Search Console is intentionally deferred to Phase 11.",
        status: "not-applicable",
      },
    };
    expect(validateReleaseRecord(record, today)).toEqual([]);

    record.followUpReviews = {
      ...record.followUpReviews,
      "7-day": {
        ...record.followUpReviews["7-day"],
        evidence: [],
        notApplicableReason: null,
      },
    };
    expect(validateReleaseRecord(record, today)).toContain(
      "follow-up:not-applicable-approval:7-day",
    );
  });

  it("rejects invented completion evidence dated after validation", () => {
    const record = completed();
    record.followUpReviews = {
      ...record.followUpReviews,
      "24-hour": {
        ...record.followUpReviews["24-hour"],
        completedDate: "2026-07-15",
        evidence: ["Invented future result."],
        status: "complete",
      },
    };
    expect(validateReleaseRecord(record, today)).toContain(
      "follow-up:future-completion:24-hour",
    );
  });

  it("reports overdue reviews without invalidating normal record validation", () => {
    const record = completed();
    record.followUpReviews = {
      ...record.followUpReviews,
      "24-hour": {
        ...record.followUpReviews["24-hour"],
        dueDate: "2026-07-15",
      },
    };
    expect(validateReleaseRecord(record, new Date("2026-07-16T12:00:00Z"))).toEqual([]);
    expect(getOverdueFollowUpReviews(record, new Date("2026-07-16T12:00:00Z"))).toContain("24-hour");
  });

  it("requires hotfix and documentation-only records to use their reserved branch families", () => {
    const hotfix = candidate();
    hotfix.delivery = {
      ...hotfix.delivery,
      branch: "hotfix/canonical-loop",
      releaseKind: "hotfix",
    };
    hotfix.provenance = {
      ...hotfix.provenance,
      reviewedHeadRef: "hotfix/canonical-loop",
    };
    expect(validateReleaseRecord(hotfix, today)).toEqual([]);

    const invalidHotfix = candidate();
    invalidHotfix.delivery = { ...invalidHotfix.delivery, releaseKind: "hotfix" };
    expect(validateReleaseRecord(invalidHotfix, today)).toContain(
      "delivery:hotfix-branch",
    );

    const documentation = candidate(["documentation-only"]);
    documentation.delivery = {
      ...documentation.delivery,
      branch: "docs/phase-9-release-record",
      releaseKind: "documentation-only",
    };
    documentation.provenance = {
      ...documentation.provenance,
      reviewedHeadRef: "docs/phase-9-release-record",
    };
    expect(validateReleaseRecord(documentation, today)).toEqual([]);

    documentation.delivery = {
      ...documentation.delivery,
      branch: "platform/phase-9-release-record",
    };
    expect(validateReleaseRecord(documentation, today)).toContain(
      "delivery:documentation-branch",
    );
  });

  it("requires correction records to reference an existing release", () => {
    const source = completed();
    const correction: ReleaseCorrectionRecord = {
      approvedDate: "2026-07-14",
      approver: "Youtoola owner",
      correctsRecordId: source.recordId,
      evidence: ["Owner-approved factual correction."],
      planApproval: {
        approvedDate: "2026-07-14",
        approver: "Youtoola owner",
        reference: "APPROVE PLAN: correction",
      },
      provenance: {
        ...source.provenance,
        durableReleaseCommit: null,
        mergeCommit: null,
        mergeMethod: null,
        mergedAt: null,
        pullRequest: "pending",
        reviewedHeadCommit: "pending-review",
        reviewedHeadRef: "docs/phase-9-correction",
        reviewedDate: null,
      },
      pullRequest: "pending",
      reason: "Correct a factual evidence field without rewriting the original record.",
      recordId: "2026-07-14-phase-9-correction-1",
      recordKind: "correction",
      recordVersion: 3,
      status: "candidate",
      summary: "Factual Phase 9 evidence correction.",
    };
    expect(validateReleaseRecord(correction, today)).toEqual([]);
    expect(validateCorrectionReferences([source, correction])).toEqual([]);
    expect(validateCorrectionReferences([correction])).toContain(
      `correction:missing-target:${source.recordId}`,
    );
    expect(validateReleaseRecord({ ...correction, production: source.production }, today)).toContain(
      "correction:unknown-field:production",
    );
  });

  it("rejects invalid follow-up reviews and invalid deployment URLs", () => {
    const record = candidate();
    record.followUpReviews = {
      ...record.followUpReviews,
      "7-day": { ...record.followUpReviews["7-day"], dueDate: "not-a-date" },
    };
    record.pullRequest = "http://github.example/pr";
    expect(validateReleaseRecord(record, today)).toEqual(expect.arrayContaining([
      "follow-up:due-date:7-day",
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
