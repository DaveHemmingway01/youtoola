import {
  FOLLOW_UP_PERIODS,
  RELEASE_KINDS,
  REQUIRED_CHECKS,
  type FollowUpPeriod,
  type ReleaseKind,
  // @ts-expect-error Node's strip-types execution requires the runtime extension.
} from "../delivery/contracts.ts";

export const RELEASE_SCHEMA_VERSION = 3 as const;

export const RELEASE_GATES = [
  "plan",
  "build",
  "review",
  "ship",
  "post-deployment",
  "post-launch-review",
] as const;

export const RISK_TAGS = [
  "documentation-only",
  "public-content",
  "visual-interface",
  "platform-architecture",
  "utility-logic",
  "calculation-change",
  "metadata-indexing",
  "analytics-consent",
  "commercial-activation",
  "security-privacy",
  "high-consequence",
] as const;

export const COMPARISON_MODES = [
  "exact",
  "integer",
  "decimal-tolerance",
  "relative-tolerance",
  "categorical",
  "formatted-output",
] as const;

export const SEVERITIES = ["critical", "high", "medium", "low", "informational"] as const;
export const RELEASE_STATUSES = ["candidate", "completed"] as const;
export const EVIDENCE_STATUSES = ["pending", "passed", "approved"] as const;
export const FOLLOW_UP_STATUSES = [
  "pending",
  "complete",
  "not-applicable",
] as const;

export type ReleaseGate = (typeof RELEASE_GATES)[number];
export type RiskTag = (typeof RISK_TAGS)[number];
export type ComparisonMode = (typeof COMPARISON_MODES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];

export interface GateDefinition {
  approver: "Youtoola owner";
  automatedChecks: readonly string[];
  evidence: readonly string[];
  failureBehavior: string;
  gate: ReleaseGate;
  manualChecks: readonly string[];
  permittedFixes: string;
  reportRequirements: readonly string[];
  scopeChangeHandling: string;
}

export const GATE_DEFINITIONS: readonly GateDefinition[] = [
  {
    gate: "plan",
    evidence: ["approved scope", "risk tags", "test obligations", "rollback strategy"],
    automatedChecks: ["plan contract validation"],
    manualChecks: ["value", "methodology", "risk", "privacy", "commercial impact"],
    approver: "Youtoola owner",
    failureBehavior: "Stop until the plan is corrected and approved.",
    permittedFixes: "Planning corrections only.",
    scopeChangeHandling: "Material additions require a revised PLAN.",
    reportRequirements: ["scope", "risks", "evidence plan", "owner decisions"],
  },
  {
    gate: "build",
    evidence: ["approved specification", "implementation", "tests", "candidate release record"],
    automatedChecks: ["static", "contract", "unit", "build", "security"],
    manualChecks: ["scope compliance", "implementation quality"],
    approver: "Youtoola owner",
    failureBehavior: "Keep the change on its branch and fix release blockers.",
    permittedFixes: "Approved in-scope implementation and test corrections.",
    scopeChangeHandling: "Material expansion returns to PLAN.",
    reportRequirements: ["files", "decisions", "validation", "Preview", "blockers"],
  },
  {
    gate: "review",
    evidence: ["complete diff", "Preview", "risk-selected review evidence"],
    automatedChecks: ["full selected suite", "Preview boundary checks"],
    manualChecks: ["visual", "accessibility", "methodology", "privacy", "release confidence"],
    approver: "Youtoola owner",
    failureBehavior: "Do not merge while a release blocker remains.",
    permittedFixes: "Genuine in-scope release blockers only.",
    scopeChangeHandling: "A broader product or architecture change returns to PLAN.",
    reportRequirements: ["findings by severity", "fixes", "final evidence", "readiness"],
  },
  {
    gate: "ship",
    evidence: ["approved head", "required checks", "rollback target", "owner approval"],
    automatedChecks: ["commit", "checks", "record", "secret", "deployment readiness"],
    manualChecks: ["final release confidence"],
    approver: "Youtoola owner",
    failureBehavior: "Stop before merge on any mismatch.",
    permittedFixes: "Release-record correction or separately reviewed blocker fix.",
    scopeChangeHandling: "Any product change returns to REVIEW or PLAN.",
    reportRequirements: ["PR", "commit", "checks", "rollback", "approval"],
  },
  {
    gate: "post-deployment",
    evidence: ["deployment", "live smoke", "network and storage boundary", "rollback availability"],
    automatedChecks: ["HTTP", "metadata", "headers", "asset hashes"],
    manualChecks: ["live task and visual smoke"],
    approver: "Youtoola owner",
    failureBehavior: "Contain or roll back Critical and material High failures immediately.",
    permittedFixes: "Containment, revert, provider disablement, or approved hotfix.",
    scopeChangeHandling: "Improvements beyond recovery require a new PLAN.",
    reportRequirements: ["deployment ID", "commit", "smoke results", "rollback action"],
  },
  {
    gate: "post-launch-review",
    evidence: ["scheduled technical and product evidence", "owner-reviewed actions"],
    automatedChecks: ["evidence completeness", "freshness"],
    manualChecks: ["retain, fix, investigate, or roll back decision"],
    approver: "Youtoola owner",
    failureBehavior: "Assign a severity, owner, deadline, and containment when required.",
    permittedFixes: "Approved maintenance or a new scoped change.",
    scopeChangeHandling: "New capability or material behavior returns to PLAN.",
    reportRequirements: ["period", "evidence", "limitations", "actions", "owners"],
  },
] as const;

const BASE_EVIDENCE = [
  "owner-plan-approval",
  "clean-diff",
  "normal-ci",
  "preview-verification",
  "rollback-plan",
  "release-report",
] as const;

export const RISK_EVIDENCE: Readonly<Record<RiskTag, readonly string[]>> = {
  "documentation-only": ["documentation-review", "documentation-validation"],
  "public-content": ["content-review", "accessibility-review", "seo-validation", "preview-verification"],
  "visual-interface": ["component-tests", "browser-tests", "axe-scan", "responsive-review", "manual-keyboard-review", "visual-review", "preview-verification"],
  "platform-architecture": ["contract-tests", "negative-tests", "public-boundary-regression", "dependency-review"],
  "utility-logic": ["registry-status", "risk-profile", "methodology-review", "source-review", "calculation-version", "pure-logic-tests", "boundary-tests", "invalid-input-tests", "rounding-tests", "unit-tests", "accessibility-review", "responsive-review", "privacy-review", "analytics-payload-tests", "seo-validation", "sitemap-eligibility", "released-relationship-tests", "fixture-isolation", "production-smoke-plan"],
  "calculation-change": ["formula-specification", "golden-vectors", "independent-expected-results", "calculation-version", "methodology-version", "methodology-review", "source-review", "owner-calculation-approval"],
  "metadata-indexing": ["seo-validation", "crawler-validation", "structured-data-validation", "preview-verification", "production-smoke-plan"],
  "analytics-consent": ["analytics-contract-tests", "sensitive-data-tests", "environment-transmission-tests", "consent-fail-closed-tests", "storage-and-replay-tests", "privacy-review", "provider-boundary-review"],
  "commercial-activation": ["complete-free-result", "approved-capability", "approved-provider", "approved-placement", "disclosure-review", "legal-review", "jurisdiction-review", "consent-review", "layout-shift-review", "sensitive-targeting-review", "claims-review", "privacy-policy-review", "commercial-event-tests", "provider-failure-isolation", "deactivation-plan", "owner-commercial-approval"],
  "security-privacy": ["dependency-audit", "secret-scan", "security-review", "payload-limit-tests", "safe-serialization-tests", "prototype-pollution-tests", "environment-validation", "security-header-tests", "debug-route-tests", "secret-leakage-tests", "redirect-allowlist-tests"],
  "high-consequence": ["qualified-independent-review", "reviewer-scope", "reviewer-evidence", "current-authoritative-sources"],
};

export interface PerformanceBudget {
  hard: number;
  id: string;
  unit: string;
  warning: number;
}

export const PERFORMANCE_BUDGETS: readonly PerformanceBudget[] = [
  { id: "public-route-owned-js", warning: 0, hard: 6, unit: "gzip-kb" },
  { id: "utility-island-js", warning: 12, hard: 16, unit: "gzip-kb" },
  { id: "review-route-js", warning: 6, hard: 6, unit: "gzip-kb" },
  { id: "global-css", warning: 10, hard: 20, unit: "gzip-kb" },
  { id: "route-css", warning: 10, hard: 30, unit: "gzip-kb" },
  { id: "html", warning: 75, hard: 125, unit: "uncompressed-kb" },
  { id: "json-ld", warning: 8, hard: 16, unit: "uncompressed-kb" },
  { id: "initial-images", warning: 250, hard: 500, unit: "transferred-kb" },
  { id: "event-validation", warning: 1, hard: 2, unit: "average-ms" },
  { id: "synchronous-calculation", warning: 16, hard: 50, unit: "ms" },
  { id: "cls", warning: 0.05, hard: 0.1, unit: "score" },
  { id: "lcp", warning: 2, hard: 2.5, unit: "seconds" },
  { id: "inp", warning: 150, hard: 200, unit: "ms" },
] as const;

export const SEVERITY_POLICY: Readonly<Record<Severity, {
  exceptionEligible: boolean;
  merge: string;
  notification: string;
  remediation: string;
  rollback: string;
  ship: string;
}>> = {
  critical: { merge: "blocked", ship: "blocked", rollback: "immediate", notification: "immediate", remediation: "immediate containment", exceptionEligible: false },
  high: { merge: "blocked", ship: "blocked", rollback: "immediate when live and material", notification: "same day", remediation: "before release", exceptionEligible: false },
  medium: { merge: "owner decision", ship: "fix when user-facing or record an approved exception", rollback: "case-by-case", notification: "in release report", remediation: "within 7 days", exceptionEligible: true },
  low: { merge: "allowed with record", ship: "allowed with record", rollback: "not normally", notification: "normal review", remediation: "next maintenance cycle", exceptionEligible: true },
  informational: { merge: "allowed", ship: "allowed", rollback: "none", notification: "report only", remediation: "none required", exceptionEligible: true },
};

export interface EvidenceItem {
  id: string;
  reference: string;
  reviewedDate: string;
  status: EvidenceStatus;
}

export interface ReleaseException {
  approvedDate: string;
  approver: "Youtoola owner";
  expiresOn: string;
  id: string;
  reason: string;
  remediation: string;
  requirementId: string;
  severity: "medium" | "low" | "informational";
}

export interface IndependentReview {
  evidence: string;
  qualified: true;
  reviewedDate: string;
  reviewer: string;
  scope: string;
}

export interface GateEvidence {
  approver: "Youtoola owner" | null;
  evidence: readonly string[];
  status: "pending" | "complete" | "approved";
}

export interface ProductionEvidence {
  deployedAt: string;
  deploymentCommit: string;
  deploymentId: string;
  liveUrls: readonly string[];
  mergeCommit: string;
  releaseDate: string;
  rollbackDeployment: string;
  smokeResults: readonly string[];
}

export interface RequiredCheckEvidence {
  name: (typeof REQUIRED_CHECKS)[number];
  reference: string | null;
  status: "passed" | "pending";
}

export interface PreviewEvidence {
  branchAlias: string;
  deploymentCommit: string;
  deploymentId: string;
  noindex: true;
  protected: true;
  ready: true;
  uniqueUrl: string;
}

export interface DeliveryEvidence {
  branch: string;
  preview: PreviewEvidence | null;
  productionUnchangedBeforeMerge: true;
  releaseKind: ReleaseKind;
  requiredChecks: readonly RequiredCheckEvidence[];
}

export interface FollowUpReview {
  completedDate: string | null;
  dueDate: string | null;
  evidence: readonly string[];
  notApplicableReason: string | null;
  owner: "Youtoola owner";
  status: FollowUpStatus;
}

export interface ReleaseProvenance {
  durableReleaseCommit: string | null;
  mergeCommit: string | null;
  mergedAt: string | null;
  mergeMethod: "merge" | "rebase" | "squash" | null;
  pullRequest: string;
  reviewedDate: string | null;
  reviewedHeadCommit: string;
  reviewedHeadRef: string;
  sourceBranch: "origin/main";
  sourceCommit: string;
}

export interface ProvenanceHistoryProbe {
  commitExists(commit: string): boolean;
  isAncestor(commit: string, ref: string): boolean;
  refExists(ref: string): boolean;
}

export interface ReleaseRecord {
  delivery: DeliveryEvidence;
  evidence: readonly EvidenceItem[];
  exceptions: readonly ReleaseException[];
  followUpReviews: Readonly<Record<FollowUpPeriod, FollowUpReview>>;
  gateEvidence: Readonly<Record<ReleaseGate, GateEvidence>>;
  independentReview?: IndependentReview;
  phaseOrUtility: string;
  planApproval: { approvedDate: string; approver: "Youtoola owner"; reference: string };
  production: ProductionEvidence | null;
  provenance: ReleaseProvenance;
  pullRequest: string;
  recordKind: "release";
  recordId: string;
  recordVersion: typeof RELEASE_SCHEMA_VERSION;
  riskTags: readonly RiskTag[];
  rollbackPlan: { method: string; owner: "Youtoola owner"; target: string };
  status: ReleaseStatus;
  summary: string;
  versions: { analyticsSchema?: number; calculation?: number; methodology?: number; releaseSchema: number };
}

export interface ReleaseCorrectionRecord {
  approvedDate: string;
  approver: "Youtoola owner";
  correctsRecordId: string;
  evidence: readonly string[];
  planApproval: {
    approvedDate: string;
    approver: "Youtoola owner";
    reference: string;
  };
  provenance: ReleaseProvenance;
  pullRequest: string;
  reason: string;
  recordId: string;
  recordKind: "correction";
  recordVersion: typeof RELEASE_SCHEMA_VERSION;
  status: ReleaseStatus;
  summary: string;
}

export interface GoldenTolerance {
  displayedDecimalPlaces: number;
  distanceToRoundingBoundary: number;
  maximumPermittedError: number;
  reason: string;
}

export interface GoldenVector {
  calculationVersion: number;
  comparisonMode: ComparisonMode;
  expectedOutputs: Readonly<Record<string, unknown>>;
  inputs: Readonly<Record<string, unknown>>;
  jurisdiction?: string;
  normalizedInputs: Readonly<Record<string, unknown>>;
  purpose: string;
  reviewedDate: string;
  reviewer: string;
  roundingExpectation: string;
  sourceOrDerivation: { independentFromImplementation: true; kind: "authoritative-source" | "independent-calculation" | "reviewed-reference"; reference: string };
  tolerance?: GoldenTolerance;
  vectorId: string;
}

export interface GoldenVectorDocument {
  calculationVersion: number;
  utilitySlug: string;
  vectors: readonly GoldenVector[];
}

const APPROVED_EXCEPTION_REQUIREMENTS = new Set([
  "browser-coverage",
  "performance-hard-budget",
  "temporary-medium-evidence",
  "temporary-low-evidence",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value: Record<string, unknown>, allowed: readonly string[], issues: string[], prefix: string) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) issues.push(`${prefix}:unknown-field:${key}`);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 500;
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

function reviewIsFresh(value: string, riskTags: readonly RiskTag[], now: Date) {
  const age = now.getTime() - Date.parse(`${value}T00:00:00Z`);
  const maximumDays = riskTags.some((tag) => tag === "high-consequence" || tag === "security-privacy" || tag === "analytics-consent" || tag === "commercial-activation") ? 90 : 365;
  return age >= 0 && age <= maximumDays * 86_400_000;
}

function sha(value: unknown) {
  return typeof value === "string" && /^(pending-review|[a-f0-9]{40})$/.test(value);
}

function httpsUrl(value: unknown) {
  if (typeof value !== "string") return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

function pullRequestUrl(value: unknown) {
  return value === "pending" || (typeof value === "string" && /^https:\/\/github\.com\/DaveHemmingway01\/youtoola\/pull\/\d+$/.test(value));
}

function productionUrl(value: unknown) {
  if (!httpsUrl(value)) return false;
  const url = new URL(value as string);
  return url.origin === "https://www.youtoola.com" && !url.search && !url.hash;
}

function exactSha(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{40}$/.test(value);
}

function deploymentId(value: unknown): value is string {
  return typeof value === "string" && /^dpl_[A-Za-z0-9]+$/.test(value);
}

function youtoolaPreviewUrl(value: unknown): value is string {
  if (!httpsUrl(value)) return false;
  const url = new URL(value as string);
  return (
    url.hostname.endsWith("-davincistudio.vercel.app") &&
    url.pathname === "/" &&
    !url.search &&
    !url.hash
  );
}

const branchPattern = /^(platform|utility|docs|hotfix)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateProvenanceShape(
  provenance: Record<string, unknown>,
  pullRequest: unknown,
  status: unknown,
  issues: string[],
) {
  exactKeys(
    provenance,
    [
      "pullRequest",
      "sourceBranch",
      "sourceCommit",
      "reviewedHeadCommit",
      "reviewedHeadRef",
      "reviewedDate",
      "mergeMethod",
      "mergeCommit",
      "durableReleaseCommit",
      "mergedAt",
    ],
    issues,
    "provenance",
  );
  if (
    !pullRequestUrl(provenance.pullRequest) ||
    provenance.pullRequest !== pullRequest
  ) {
    issues.push("provenance:pull-request-mismatch");
  }
  if (provenance.sourceBranch !== "origin/main") {
    issues.push("provenance:source-branch");
  }
  if (!exactSha(provenance.sourceCommit)) {
    issues.push("provenance:source-commit");
  }
  if (!sha(provenance.reviewedHeadCommit)) {
    issues.push("provenance:reviewed-head");
  }
  if (
    !nonEmptyString(provenance.reviewedHeadRef) ||
    !branchPattern.test(provenance.reviewedHeadRef) ||
    /(?:\.\.|\/\/|@\{)/.test(provenance.reviewedHeadRef)
  ) {
    issues.push("provenance:reviewed-head-ref");
  }
  if (
    provenance.reviewedHeadCommit === "pending-review" &&
    provenance.reviewedDate !== null
  ) {
    issues.push("provenance:reviewed-date-contradiction");
  } else if (
    provenance.reviewedHeadCommit !== "pending-review" &&
    !validDate(provenance.reviewedDate)
  ) {
    issues.push("provenance:reviewed-date");
  }
  if (status === "completed" && !validDate(provenance.reviewedDate)) {
    issues.push("provenance:reviewed-date");
  }
}

function validateDeliveryEvidence(
  input: unknown,
  provenance: Record<string, unknown> | null,
  gateEvidence: unknown,
  status: unknown,
  issues: string[],
) {
  if (!isRecord(input)) {
    issues.push("record:delivery");
    return;
  }
  exactKeys(
    input,
    [
      "branch",
      "releaseKind",
      "preview",
      "requiredChecks",
      "productionUnchangedBeforeMerge",
    ],
    issues,
    "delivery",
  );
  if (!nonEmptyString(input.branch) || !branchPattern.test(input.branch)) {
    issues.push("delivery:branch");
  }
  if (provenance && input.branch !== provenance.reviewedHeadRef) {
    issues.push("delivery:branch-ref-mismatch");
  }
  if (!(RELEASE_KINDS as readonly unknown[]).includes(input.releaseKind)) {
    issues.push("delivery:release-kind");
  }
  if (
    input.releaseKind === "documentation-only" &&
    typeof input.branch === "string" &&
    !input.branch.startsWith("docs/")
  ) {
    issues.push("delivery:documentation-branch");
  }
  if (
    input.releaseKind === "hotfix" &&
    typeof input.branch === "string" &&
    !input.branch.startsWith("hotfix/")
  ) {
    issues.push("delivery:hotfix-branch");
  }
  if (
    typeof input.branch === "string" &&
    input.branch.startsWith("hotfix/") &&
    input.releaseKind !== "hotfix"
  ) {
    issues.push("delivery:hotfix-kind");
  }
  if (input.productionUnchangedBeforeMerge !== true) {
    issues.push("delivery:production-unchanged");
  }

  const requiredChecks = new Map<string, Record<string, unknown>>();
  if (!Array.isArray(input.requiredChecks)) {
    issues.push("delivery:required-checks");
  } else {
    for (const raw of input.requiredChecks) {
      if (!isRecord(raw)) {
        issues.push("delivery:required-check");
        continue;
      }
      exactKeys(raw, ["name", "status", "reference"], issues, "delivery-check");
      if (!(REQUIRED_CHECKS as readonly unknown[]).includes(raw.name)) {
        issues.push(`delivery:required-check-name:${String(raw.name)}`);
        continue;
      }
      if (requiredChecks.has(String(raw.name))) {
        issues.push(`delivery:required-check-duplicate:${String(raw.name)}`);
      }
      if (!(raw.status === "pending" || raw.status === "passed")) {
        issues.push(`delivery:required-check-status:${String(raw.name)}`);
      }
      if (!(raw.reference === null || httpsUrl(raw.reference))) {
        issues.push(`delivery:required-check-reference:${String(raw.name)}`);
      }
      if (raw.status === "passed" && !httpsUrl(raw.reference)) {
        issues.push(`delivery:required-check-reference:${String(raw.name)}`);
      }
      requiredChecks.set(String(raw.name), raw);
    }
    for (const name of REQUIRED_CHECKS) {
      if (!requiredChecks.has(name)) issues.push(`delivery:required-check-missing:${name}`);
    }
  }

  if (input.preview !== null) {
    if (!isRecord(input.preview)) {
      issues.push("delivery:preview");
    } else {
      exactKeys(
        input.preview,
        [
          "deploymentId",
          "deploymentCommit",
          "uniqueUrl",
          "branchAlias",
          "ready",
          "protected",
          "noindex",
        ],
        issues,
        "delivery-preview",
      );
      if (!deploymentId(input.preview.deploymentId)) issues.push("delivery:preview-id");
      if (!exactSha(input.preview.deploymentCommit)) issues.push("delivery:preview-commit");
      if (!youtoolaPreviewUrl(input.preview.uniqueUrl)) issues.push("delivery:preview-url");
      if (!youtoolaPreviewUrl(input.preview.branchAlias)) issues.push("delivery:preview-alias");
      if (
        input.preview.ready !== true ||
        input.preview.protected !== true ||
        input.preview.noindex !== true
      ) {
        issues.push("delivery:preview-protection");
      }
      if (
        provenance &&
        provenance.reviewedHeadCommit !== "pending-review" &&
        input.preview.deploymentCommit !== provenance.reviewedHeadCommit
      ) {
        issues.push("delivery:preview-commit-mismatch");
      }
    }
  }

  const gates = isRecord(gateEvidence) ? gateEvidence : null;
  const reviewApproved =
    gates && isRecord(gates.review) && gates.review.status === "approved";
  const shipApproved =
    gates && isRecord(gates.ship) && gates.ship.status === "approved";
  if (status === "completed" || reviewApproved || shipApproved) {
    if (!isRecord(input.preview)) issues.push("delivery:preview-required");
    for (const name of REQUIRED_CHECKS) {
      if (requiredChecks.get(name)?.status !== "passed") {
        issues.push(`delivery:required-check-not-passed:${name}`);
      }
    }
  }
}

function validateFollowUpReviews(
  input: unknown,
  status: unknown,
  issues: string[],
) {
  if (!isRecord(input)) {
    issues.push("record:follow-up-reviews");
    return;
  }
  exactKeys(input, FOLLOW_UP_PERIODS, issues, "follow-up-reviews");
  for (const period of FOLLOW_UP_PERIODS) {
    const raw = input[period];
    if (!isRecord(raw)) {
      issues.push(`follow-up:missing:${period}`);
      continue;
    }
    exactKeys(
      raw,
      [
        "dueDate",
        "status",
        "owner",
        "completedDate",
        "evidence",
        "notApplicableReason",
      ],
      issues,
      `follow-up:${period}`,
    );
    if (!(raw.dueDate === null || validDate(raw.dueDate))) {
      issues.push(`follow-up:due-date:${period}`);
    }
    if (status === "completed" && !validDate(raw.dueDate)) {
      issues.push(`follow-up:completed-due-date:${period}`);
    }
    if (!(FOLLOW_UP_STATUSES as readonly unknown[]).includes(raw.status)) {
      issues.push(`follow-up:status:${period}`);
    }
    if (raw.owner !== "Youtoola owner") issues.push(`follow-up:owner:${period}`);
    if (!Array.isArray(raw.evidence) || raw.evidence.some((value) => !nonEmptyString(value))) {
      issues.push(`follow-up:evidence:${period}`);
    }
    if (raw.status === "pending") {
      if (raw.completedDate !== null || raw.notApplicableReason !== null || (Array.isArray(raw.evidence) && raw.evidence.length > 0)) {
        issues.push(`follow-up:pending-contradiction:${period}`);
      }
    }
    if (raw.status === "complete") {
      if (!validDate(raw.completedDate) || !Array.isArray(raw.evidence) || raw.evidence.length === 0 || raw.notApplicableReason !== null) {
        issues.push(`follow-up:complete-evidence:${period}`);
      }
    }
    if (raw.status === "not-applicable") {
      if (!validDate(raw.completedDate) || !Array.isArray(raw.evidence) || raw.evidence.length === 0 || !nonEmptyString(raw.notApplicableReason)) {
        issues.push(`follow-up:not-applicable-approval:${period}`);
      }
    }
  }
}

export function requiredEvidenceForRiskTags(input: unknown): { issues: string[]; required: string[]; tags: RiskTag[] } {
  const issues: string[] = [];
  if (!Array.isArray(input) || input.length === 0) return { issues: ["risk-tags:missing"], required: [], tags: [] };
  const tags: RiskTag[] = [];
  for (const value of input) {
    if (typeof value !== "string" || !(RISK_TAGS as readonly string[]).includes(value)) issues.push(`risk-tags:unknown:${String(value)}`);
    else if (tags.includes(value as RiskTag)) issues.push(`risk-tags:duplicate:${value}`);
    else tags.push(value as RiskTag);
  }
  if (tags.includes("documentation-only") && tags.length > 1) issues.push("risk-tags:documentation-only-contradiction");
  if (tags.includes("high-consequence") && !tags.includes("calculation-change")) issues.push("risk-tags:high-consequence-requires-calculation-change");
  const required = [...new Set([...BASE_EVIDENCE, ...tags.flatMap((tag) => RISK_EVIDENCE[tag])])].sort();
  return { issues, required, tags };
}

export function validateReleaseRecord(input: unknown, now = new Date()): string[] {
  const issues: string[] = [];
  if (!isRecord(input)) return ["record:invalid"];
  if (input.recordKind === "correction") {
    return validateReleaseCorrectionRecord(input, now);
  }
  exactKeys(input, ["recordVersion", "recordKind", "recordId", "status", "phaseOrUtility", "summary", "riskTags", "planApproval", "pullRequest", "provenance", "delivery", "evidence", "exceptions", "rollbackPlan", "gateEvidence", "versions", "production", "followUpReviews", "independentReview"], issues, "record");
  if (input.recordVersion !== RELEASE_SCHEMA_VERSION) issues.push("record:version");
  if (input.recordKind !== "release") issues.push("record:kind");
  if (!nonEmptyString(input.recordId) || !/^[a-z0-9-]+$/.test(input.recordId)) issues.push("record:id");
  if (!nonEmptyString(input.phaseOrUtility)) issues.push("record:phase-or-utility");
  if (!nonEmptyString(input.summary)) issues.push("record:summary");
  if (!(RELEASE_STATUSES as readonly unknown[]).includes(input.status)) issues.push("record:status");
  if (!pullRequestUrl(input.pullRequest)) issues.push("record:pull-request");

  const provenance = isRecord(input.provenance) ? input.provenance : null;
  if (!provenance) issues.push("record:provenance");
  else validateProvenanceShape(provenance, input.pullRequest, input.status, issues);

  const selection = requiredEvidenceForRiskTags(input.riskTags);
  issues.push(...selection.issues);

  if (!isRecord(input.planApproval)) issues.push("record:plan-approval");
  else {
    exactKeys(input.planApproval, ["approvedDate", "approver", "reference"], issues, "plan-approval");
    if (input.planApproval.approver !== "Youtoola owner") issues.push("record:plan-approver");
    if (!validDate(input.planApproval.approvedDate) || !reviewIsFresh(input.planApproval.approvedDate, selection.tags, now)) issues.push("record:plan-date");
    if (!nonEmptyString(input.planApproval.reference)) issues.push("record:plan-reference");
  }

  const evidenceById = new Map<string, EvidenceItem>();
  if (!Array.isArray(input.evidence)) issues.push("record:evidence");
  else for (const raw of input.evidence) {
    if (!isRecord(raw)) { issues.push("evidence:invalid"); continue; }
    exactKeys(raw, ["id", "status", "reference", "reviewedDate"], issues, "evidence");
    if (!nonEmptyString(raw.id)) { issues.push("evidence:id"); continue; }
    if (evidenceById.has(raw.id)) { issues.push(`evidence:duplicate:${raw.id}`); continue; }
    if (!(EVIDENCE_STATUSES as readonly unknown[]).includes(raw.status)) issues.push(`evidence:status:${raw.id}`);
    if (!nonEmptyString(raw.reference)) issues.push(`evidence:reference:${raw.id}`);
    if (!validDate(raw.reviewedDate) || !reviewIsFresh(raw.reviewedDate, selection.tags, now)) issues.push(`evidence:stale:${raw.id}`);
    evidenceById.set(raw.id, raw as unknown as EvidenceItem);
  }
  for (const requirement of selection.required) if (!evidenceById.has(requirement)) issues.push(`evidence:missing:${requirement}`);

  if (!Array.isArray(input.exceptions)) issues.push("record:exceptions");
  else for (const raw of input.exceptions) {
    if (!isRecord(raw)) { issues.push("exception:invalid"); continue; }
    exactKeys(raw, ["id", "requirementId", "reason", "approver", "approvedDate", "expiresOn", "remediation", "severity"], issues, "exception");
    if (!nonEmptyString(raw.id) || !nonEmptyString(raw.reason) || !nonEmptyString(raw.remediation)) issues.push("exception:required-fields");
    if (!APPROVED_EXCEPTION_REQUIREMENTS.has(String(raw.requirementId))) issues.push(`exception:unsupported:${String(raw.requirementId)}`);
    if (raw.approver !== "Youtoola owner") issues.push("exception:approver");
    if (!validDate(raw.approvedDate) || !validDate(raw.expiresOn) || Date.parse(`${raw.expiresOn}T00:00:00Z`) <= Date.parse(`${raw.approvedDate}T00:00:00Z`)) issues.push("exception:dates");
    if (!(raw.severity === "medium" || raw.severity === "low" || raw.severity === "informational")) issues.push("exception:severity");
  }

  if (!isRecord(input.rollbackPlan)) issues.push("record:rollback-plan");
  else {
    exactKeys(input.rollbackPlan, ["method", "owner", "target"], issues, "rollback-plan");
    if (!nonEmptyString(input.rollbackPlan.method) || !nonEmptyString(input.rollbackPlan.target) || input.rollbackPlan.owner !== "Youtoola owner") issues.push("record:rollback-plan");
  }

  if (!isRecord(input.gateEvidence)) issues.push("record:gate-evidence");
  else {
    exactKeys(input.gateEvidence, RELEASE_GATES, issues, "gate-evidence");
    for (const gate of RELEASE_GATES) {
    const raw = input.gateEvidence[gate];
    if (!isRecord(raw)) { issues.push(`gate:missing:${gate}`); continue; }
    exactKeys(raw, ["status", "approver", "evidence"], issues, `gate:${gate}`);
    if (!(raw.status === "pending" || raw.status === "complete" || raw.status === "approved")) issues.push(`gate:status:${gate}`);
    if (raw.status === "approved" && raw.approver !== "Youtoola owner") issues.push(`gate:approver:${gate}`);
    if (!Array.isArray(raw.evidence) || raw.evidence.some((value) => !nonEmptyString(value))) issues.push(`gate:evidence:${gate}`);
    }
    const reviewGate = input.gateEvidence.review;
    const shipGate = input.gateEvidence.ship;
    if (
      ((isRecord(reviewGate) && reviewGate.status === "approved") ||
        (isRecord(shipGate) && shipGate.status === "approved")) &&
      [...evidenceById.values()].some(({ status }) => status === "pending")
    ) {
      issues.push("record:pending-evidence");
    }
  }

  validateDeliveryEvidence(
    input.delivery,
    provenance,
    input.gateEvidence,
    input.status,
    issues,
  );

  if (!isRecord(input.versions) || input.versions.releaseSchema !== RELEASE_SCHEMA_VERSION) issues.push("record:versions");
  validateFollowUpReviews(input.followUpReviews, input.status, issues);

  if (selection.tags.includes("calculation-change")) {
    const versions = isRecord(input.versions) ? input.versions : {};
    if (!Number.isInteger(versions.calculation) || Number(versions.calculation) < 1) issues.push("calculation:version");
    if (!Number.isInteger(versions.methodology) || Number(versions.methodology) < 1) issues.push("methodology:version");
  }
  if (selection.tags.includes("high-consequence")) {
    if (!isRecord(input.independentReview)) issues.push("record:independent-review");
    else {
      exactKeys(input.independentReview, ["reviewer", "scope", "reviewedDate", "evidence", "qualified"], issues, "independent-review");
      if (input.independentReview.qualified !== true || !nonEmptyString(input.independentReview.reviewer) || !nonEmptyString(input.independentReview.scope) || !nonEmptyString(input.independentReview.evidence) || !validDate(input.independentReview.reviewedDate) || !reviewIsFresh(input.independentReview.reviewedDate, selection.tags, now)) issues.push("record:independent-review");
    }
  }

  if (input.status === "candidate") {
    if (input.production !== null) issues.push("record:candidate-production-contradiction");
    if (provenance && (provenance.mergeMethod !== null || provenance.mergeCommit !== null || provenance.durableReleaseCommit !== null || provenance.mergedAt !== null)) issues.push("provenance:candidate-merge-contradiction");
  } else if (input.status === "completed") {
    if (evidenceById.size > 0 && [...evidenceById.values()].some(({ status }) => status === "pending")) issues.push("record:pending-evidence");
    if (provenance) {
      if (provenance.mergeMethod !== "squash") issues.push("provenance:merge-method");
      if (!sha(provenance.reviewedHeadCommit) || provenance.reviewedHeadCommit === "pending-review") issues.push("provenance:reviewed-head");
      if (!sha(provenance.mergeCommit) || provenance.mergeCommit === "pending-review") issues.push("provenance:merge-commit");
      if (!sha(provenance.durableReleaseCommit) || provenance.durableReleaseCommit === "pending-review") issues.push("provenance:durable-release-commit");
      if (provenance.mergeCommit !== provenance.durableReleaseCommit) issues.push("provenance:durable-commit-mismatch");
      if (!validTimestamp(provenance.mergedAt)) issues.push("provenance:merged-at");
      if (validDate(provenance.reviewedDate) && validTimestamp(provenance.mergedAt) && Date.parse(`${provenance.reviewedDate}T00:00:00Z`) > Date.parse(provenance.mergedAt)) issues.push("provenance:chronology");
    }
    if (!isRecord(input.production)) issues.push("record:production-evidence");
    else {
      exactKeys(input.production, ["mergeCommit", "deploymentId", "deploymentCommit", "deployedAt", "liveUrls", "smokeResults", "rollbackDeployment", "releaseDate"], issues, "production");
      if (!sha(input.production.mergeCommit) || input.production.mergeCommit === "pending-review") issues.push("production:merge-commit");
      if (!sha(input.production.deploymentCommit) || input.production.deploymentCommit === "pending-review") issues.push("production:deployment-commit");
      if (input.production.mergeCommit !== input.production.deploymentCommit) issues.push("production:commit-mismatch");
      if (provenance && (input.production.mergeCommit !== provenance.mergeCommit || input.production.deploymentCommit !== provenance.durableReleaseCommit)) issues.push("production:provenance-mismatch");
      if (!deploymentId(input.production.deploymentId) || !deploymentId(input.production.rollbackDeployment)) issues.push("production:deployment-evidence");
      if (!Array.isArray(input.production.liveUrls) || input.production.liveUrls.length === 0 || input.production.liveUrls.some((url) => !productionUrl(url))) issues.push("production:live-urls");
      if (!Array.isArray(input.production.smokeResults) || input.production.smokeResults.length === 0 || input.production.smokeResults.some((result) => !nonEmptyString(result))) issues.push("production:smoke-results");
      if (!validDate(input.production.releaseDate)) issues.push("production:release-date");
      if (!validTimestamp(input.production.deployedAt)) issues.push("production:deployed-at");
      if (provenance && validTimestamp(provenance.mergedAt) && validTimestamp(input.production.deployedAt) && Date.parse(provenance.mergedAt) > Date.parse(input.production.deployedAt)) issues.push("provenance:chronology");
      if (validDate(input.production.releaseDate) && validTimestamp(input.production.deployedAt) && input.production.releaseDate !== input.production.deployedAt.slice(0, 10)) issues.push("production:release-date-mismatch");
    }
    if (
      isRecord(input.followUpReviews) &&
      (!isRecord(input.followUpReviews.immediate) ||
        input.followUpReviews.immediate.status !== "complete")
    ) {
      issues.push("record:immediate-follow-up");
    }
    if (isRecord(input.gateEvidence)) {
      for (const gate of ["plan", "review", "ship"] as const) if (isRecord(input.gateEvidence[gate]) && input.gateEvidence[gate].status !== "approved") issues.push(`gate:not-approved:${gate}`);
      for (const gate of ["build", "post-deployment"] as const) if (isRecord(input.gateEvidence[gate]) && !(input.gateEvidence[gate].status === "complete" || input.gateEvidence[gate].status === "approved")) issues.push(`gate:not-complete:${gate}`);
    }
  }
  return [...new Set(issues)].sort();
}

function validateReleaseCorrectionRecord(
  input: Record<string, unknown>,
  now: Date,
): string[] {
  const issues: string[] = [];
  exactKeys(
    input,
    [
      "recordVersion",
      "recordKind",
      "recordId",
      "status",
      "correctsRecordId",
      "summary",
      "reason",
      "approvedDate",
      "approver",
      "planApproval",
      "pullRequest",
      "provenance",
      "evidence",
    ],
    issues,
    "correction",
  );
  if (input.recordVersion !== RELEASE_SCHEMA_VERSION) issues.push("record:version");
  if (input.recordKind !== "correction") issues.push("record:kind");
  if (!nonEmptyString(input.recordId) || !/^[a-z0-9-]+$/.test(input.recordId)) issues.push("record:id");
  if (!nonEmptyString(input.correctsRecordId) || input.correctsRecordId === input.recordId) issues.push("correction:target");
  if (!nonEmptyString(input.summary) || !nonEmptyString(input.reason)) issues.push("correction:content");
  if (input.approver !== "Youtoola owner" || !validDate(input.approvedDate)) issues.push("correction:approval");
  if (!(RELEASE_STATUSES as readonly unknown[]).includes(input.status)) issues.push("record:status");
  if (!pullRequestUrl(input.pullRequest)) issues.push("record:pull-request");
  if (!Array.isArray(input.evidence) || input.evidence.length === 0 || input.evidence.some((value) => !nonEmptyString(value))) issues.push("correction:evidence");
  if (!isRecord(input.planApproval)) issues.push("record:plan-approval");
  else if (input.planApproval.approver !== "Youtoola owner" || !validDate(input.planApproval.approvedDate) || !reviewIsFresh(String(input.planApproval.approvedDate), ["documentation-only"], now) || !nonEmptyString(input.planApproval.reference)) issues.push("record:plan-approval");
  const provenance = isRecord(input.provenance) ? input.provenance : null;
  if (!provenance) issues.push("record:provenance");
  else {
    validateProvenanceShape(provenance, input.pullRequest, input.status, issues);
    if (input.status === "candidate") {
      if (provenance.mergeMethod !== null || provenance.mergeCommit !== null || provenance.durableReleaseCommit !== null || provenance.mergedAt !== null) issues.push("provenance:candidate-merge-contradiction");
    } else if (input.status === "completed") {
      if (provenance.mergeMethod !== "squash") issues.push("provenance:merge-method");
      if (!exactSha(provenance.reviewedHeadCommit)) issues.push("provenance:reviewed-head");
      if (!exactSha(provenance.mergeCommit)) issues.push("provenance:merge-commit");
      if (!exactSha(provenance.durableReleaseCommit)) issues.push("provenance:durable-release-commit");
      if (provenance.mergeCommit !== provenance.durableReleaseCommit) issues.push("provenance:durable-commit-mismatch");
      if (!validTimestamp(provenance.mergedAt)) issues.push("provenance:merged-at");
    }
  }
  return [...new Set(issues)].sort();
}

export function getOverdueFollowUpReviews(
  input: unknown,
  now = new Date(),
): FollowUpPeriod[] {
  if (!isRecord(input) || input.recordKind !== "release" || input.status !== "completed" || !isRecord(input.followUpReviews)) return [];
  const followUpReviews = input.followUpReviews;
  const today = now.toISOString().slice(0, 10);
  return FOLLOW_UP_PERIODS.filter((period) => {
    const review = followUpReviews[period];
    return isRecord(review) && review.status === "pending" && validDate(review.dueDate) && review.dueDate < today;
  });
}

export function validateCorrectionReferences(records: readonly unknown[]): string[] {
  const issues: string[] = [];
  const recordsById = new Map<string, Record<string, unknown>>();
  for (const raw of records) {
    if (!isRecord(raw) || !nonEmptyString(raw.recordId)) continue;
    if (recordsById.has(raw.recordId)) issues.push(`record:duplicate-id:${raw.recordId}`);
    recordsById.set(raw.recordId, raw);
  }
  for (const record of recordsById.values()) {
    if (record.recordKind !== "correction") continue;
    const target = recordsById.get(String(record.correctsRecordId));
    if (!target) issues.push(`correction:missing-target:${String(record.correctsRecordId)}`);
    else if (target.recordKind !== "release") issues.push(`correction:target-not-release:${String(record.correctsRecordId)}`);
  }
  return [...new Set(issues)].sort();
}

export function validateReleaseProvenanceHistory(input: unknown, probe: ProvenanceHistoryProbe): string[] {
  if (!isRecord(input) || !isRecord(input.provenance)) return [];
  const issues: string[] = [];
  const provenance = input.provenance;
  const sourceCommit = provenance.sourceCommit;
  if (typeof sourceCommit === "string" && exactSha(sourceCommit)) {
    if (!probe.commitExists(sourceCommit)) issues.push("provenance:source-commit-not-found");
    if (!probe.isAncestor(sourceCommit, "HEAD")) issues.push("provenance:source-commit-not-in-main-history");
  }
  const reviewedHead = provenance.reviewedHeadCommit;
  if (typeof reviewedHead === "string" && reviewedHead !== "pending-review") {
    if (!probe.commitExists(reviewedHead)) issues.push("provenance:reviewed-head-not-found");
    if (input.status === "candidate" && !probe.isAncestor(reviewedHead, "HEAD")) issues.push("provenance:reviewed-head-not-in-candidate-history");
    if (input.status === "completed" && typeof provenance.reviewedHeadRef === "string") {
      const remoteRef = `refs/remotes/origin/${provenance.reviewedHeadRef}`;
      if (!probe.refExists(remoteRef)) issues.push("provenance:reviewed-head-ref-not-found");
      else if (!probe.isAncestor(reviewedHead, remoteRef)) issues.push("provenance:reviewed-head-ref-mismatch");
    }
    if (typeof sourceCommit === "string" && exactSha(sourceCommit) && !probe.isAncestor(sourceCommit, reviewedHead)) {
      issues.push("provenance:source-reviewed-chronology");
    }
  }
  if (input.status === "completed" && typeof provenance.durableReleaseCommit === "string") {
    const durable = provenance.durableReleaseCommit;
    if (!probe.commitExists(durable) || !probe.isAncestor(durable, "HEAD")) issues.push("provenance:durable-release-commit-not-in-main-history");
  }
  return issues;
}

function finiteRecord(value: unknown) {
  if (!isRecord(value)) return false;
  return Object.values(value).every((item) => item === null || typeof item === "string" || typeof item === "boolean" || (typeof item === "number" && Number.isFinite(item)));
}

export function validateGoldenVectorDocument(input: unknown, now = new Date()): string[] {
  const issues: string[] = [];
  if (!isRecord(input)) return ["vectors:invalid"];
  exactKeys(input, ["utilitySlug", "calculationVersion", "vectors"], issues, "vectors");
  if (!nonEmptyString(input.utilitySlug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.utilitySlug)) issues.push("vectors:utility-slug");
  if (!Number.isInteger(input.calculationVersion) || Number(input.calculationVersion) < 1) issues.push("vectors:calculation-version");
  if (!Array.isArray(input.vectors) || input.vectors.length === 0) return [...issues, "vectors:missing"];
  const ids = new Set<string>();
  for (const raw of input.vectors) {
    if (!isRecord(raw)) { issues.push("vector:invalid"); continue; }
    exactKeys(raw, ["vectorId", "purpose", "inputs", "normalizedInputs", "expectedOutputs", "comparisonMode", "tolerance", "roundingExpectation", "sourceOrDerivation", "reviewer", "reviewedDate", "calculationVersion", "jurisdiction"], issues, "vector");
    const id = String(raw.vectorId ?? "missing");
    if (!nonEmptyString(raw.vectorId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.vectorId)) issues.push(`vector:id:${id}`);
    if (ids.has(id)) issues.push(`vector:duplicate:${id}`); else ids.add(id);
    if (!nonEmptyString(raw.purpose) || !nonEmptyString(raw.roundingExpectation) || !nonEmptyString(raw.reviewer)) issues.push(`vector:required:${id}`);
    if (!finiteRecord(raw.inputs) || !finiteRecord(raw.normalizedInputs) || !finiteRecord(raw.expectedOutputs)) issues.push(`vector:data:${id}`);
    if (!Number.isInteger(raw.calculationVersion) || raw.calculationVersion !== input.calculationVersion) issues.push(`vector:calculation-version:${id}`);
    if (!validDate(raw.reviewedDate) || !reviewIsFresh(raw.reviewedDate, ["calculation-change"], now)) issues.push(`vector:review-date:${id}`);
    if (!(COMPARISON_MODES as readonly unknown[]).includes(raw.comparisonMode)) issues.push(`vector:comparison:${id}`);
    if (!isRecord(raw.sourceOrDerivation)) issues.push(`vector:derivation:${id}`);
    else {
      exactKeys(raw.sourceOrDerivation, ["kind", "reference", "independentFromImplementation"], issues, `vector:derivation:${id}`);
      if (!(raw.sourceOrDerivation.kind === "authoritative-source" || raw.sourceOrDerivation.kind === "independent-calculation" || raw.sourceOrDerivation.kind === "reviewed-reference") || raw.sourceOrDerivation.independentFromImplementation !== true || !nonEmptyString(raw.sourceOrDerivation.reference)) issues.push(`vector:derivation:${id}`);
    }
    const toleranceMode = raw.comparisonMode === "decimal-tolerance" || raw.comparisonMode === "relative-tolerance";
    if (toleranceMode) {
      if (!isRecord(raw.tolerance)) issues.push(`vector:tolerance:${id}`);
      else {
        exactKeys(raw.tolerance, ["maximumPermittedError", "reason", "displayedDecimalPlaces", "distanceToRoundingBoundary"], issues, `vector:tolerance:${id}`);
        const places = raw.tolerance.displayedDecimalPlaces;
        const error = raw.tolerance.maximumPermittedError;
        const distance = raw.tolerance.distanceToRoundingBoundary;
        if (!Number.isInteger(places) || Number(places) < 0 || Number(places) > 12 || typeof error !== "number" || !Number.isFinite(error) || error <= 0 || typeof distance !== "number" || !Number.isFinite(distance) || distance <= 0 || !nonEmptyString(raw.tolerance.reason)) issues.push(`vector:tolerance:${id}`);
        else {
          const halfDisplayedUnit = 0.5 * 10 ** -Number(places);
          const numericExpected = Object.values(isRecord(raw.expectedOutputs) ? raw.expectedOutputs : {}).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
          const absoluteError = raw.comparisonMode === "relative-tolerance"
            ? error * Math.max(...numericExpected.map(Math.abs), 0)
            : error;
          if (numericExpected.length === 0) issues.push(`vector:tolerance-numeric-output:${id}`);
          if (absoluteError > halfDisplayedUnit) issues.push(`vector:tolerance-exceeds-displayed-precision:${id}`);
          if (absoluteError >= distance) issues.push(`vector:tolerance-crosses-rounding-boundary:${id}`);
        }
      }
    } else if (raw.tolerance !== undefined) issues.push(`vector:unexpected-tolerance:${id}`);
    if (raw.comparisonMode === "integer" && isRecord(raw.expectedOutputs) && Object.values(raw.expectedOutputs).some((value) => typeof value !== "number" || !Number.isInteger(value))) issues.push(`vector:integer-output:${id}`);
    if (raw.comparisonMode === "categorical" && isRecord(raw.expectedOutputs) && Object.values(raw.expectedOutputs).some((value) => typeof value !== "string")) issues.push(`vector:categorical-output:${id}`);
    if (raw.comparisonMode === "formatted-output" && isRecord(raw.expectedOutputs) && Object.values(raw.expectedOutputs).some((value) => typeof value !== "string")) issues.push(`vector:formatted-output:${id}`);
  }
  return [...new Set(issues)].sort();
}

export function assessPerformanceMeasurement(id: string, value: number) {
  const budget = PERFORMANCE_BUDGETS.find((candidate) => candidate.id === id);
  if (!budget || !Number.isFinite(value) || value < 0) return { outcome: "invalid" as const };
  if (value > budget.hard) return { budget, outcome: "hard-failure" as const };
  if (value > budget.warning) return { budget, outcome: "warning" as const };
  return { budget, outcome: "pass" as const };
}

export function compareGoldenValue(actual: unknown, expected: unknown, mode: ComparisonMode, tolerance?: GoldenTolerance) {
  if (mode === "exact") return Object.is(actual, expected);
  if (mode === "integer") return typeof actual === "number" && typeof expected === "number" && Number.isInteger(actual) && Number.isInteger(expected) && actual === expected;
  if (mode === "categorical" || mode === "formatted-output") return typeof actual === "string" && typeof expected === "string" && actual === expected;
  if (typeof actual !== "number" || typeof expected !== "number" || !Number.isFinite(actual) || !Number.isFinite(expected) || !tolerance) return false;
  const difference = Math.abs(actual - expected);
  if (difference >= tolerance.distanceToRoundingBoundary) return false;
  if (mode === "decimal-tolerance") return difference <= tolerance.maximumPermittedError;
  const denominator = Math.max(Math.abs(expected), Number.EPSILON);
  return difference / denominator <= tolerance.maximumPermittedError;
}

export function canAdvanceGate(current: Readonly<Record<ReleaseGate, GateEvidence>>, gate: ReleaseGate, nextStatus: GateEvidence["status"], actor: "automation" | "operator" | "owner") {
  if (actor === "automation") return false;
  if (current[gate].status !== "pending" || nextStatus === "pending") return false;
  const gateIndex = RELEASE_GATES.indexOf(gate);
  if (RELEASE_GATES.slice(0, gateIndex).some((previous) => current[previous].status === "pending")) return false;
  if (nextStatus === "approved") return actor === "owner";
  return actor === "operator" || actor === "owner";
}
