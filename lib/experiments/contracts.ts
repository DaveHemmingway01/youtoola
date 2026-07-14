export const EXPERIMENT_STATUSES = Object.freeze(["draft", "approved-disabled", "active", "stopped"] as const);
export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number];

export interface ExperimentDefinition {
  id: `experiment:${string}`;
  hypothesis: string;
  subject: "discovery" | "utility-completion" | "commercial-placement";
  primaryMetric: string;
  guardrailMetrics: readonly string[];
  owner: "Youtoola owner";
  variants: readonly Readonly<{ id: string; allocationPercent: number }>[];
  status: ExperimentStatus;
  stopConditions: readonly string[];
  minimumSampleRequirement: number;
  minimumDetectableEffectPercent: number;
  startCriteria: readonly string[];
  endCriteria: readonly string[];
  decisionRule: string;
  accessibilityReview: "approved";
  privacyReview: "approved";
  seoReview: "approved";
  rollback: string;
  reviewedDate: string;
  ownerApprovalReference: string;
}

export type ExperimentValidationIssue =
  | "duplicate-metric"
  | "duplicate-variant"
  | "invalid-allocation"
  | "invalid-date"
  | "invalid-hypothesis"
  | "invalid-id"
  | "invalid-metric"
  | "invalid-owner-approval-reference"
  | "invalid-owner"
  | "invalid-status"
  | "invalid-stop-condition"
  | "invalid-review"
  | "invalid-rule"
  | "invalid-sample"
  | "invalid-subject"
  | "invalid-variant"
  | "unknown-field";

const ID_PATTERN = /^experiment:[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOKEN_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const fields = new Set([
  "accessibilityReview",
  "decisionRule",
  "endCriteria",
  "guardrailMetrics",
  "hypothesis",
  "id",
  "minimumDetectableEffectPercent",
  "minimumSampleRequirement",
  "owner",
  "ownerApprovalReference",
  "primaryMetric",
  "privacyReview",
  "reviewedDate",
  "rollback",
  "seoReview",
  "startCriteria",
  "status",
  "stopConditions",
  "subject",
  "variants",
]);
const statuses = new Set<string>(EXPERIMENT_STATUSES);
const subjects = new Set<string>(["discovery", "utility-completion", "commercial-placement"]);
export const REQUIRED_EXPERIMENT_STOP_CONDITIONS = Object.freeze([
  "calculation-discrepancy",
  "sensitive-data-exposure",
  "privacy-failure",
  "consent-failure",
  "security-regression",
  "broken-free-result",
  "serious-accessibility-defect",
  "seo-inconsistency",
  "material-third-party-failure",
  "material-performance-failure",
] as const);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}

export function validateExperimentDefinition(input: unknown): readonly ExperimentValidationIssue[] {
  if (!isPlainRecord(input)) return Object.freeze(["unknown-field"]);
  const issues: ExperimentValidationIssue[] = [];
  if (Object.keys(input).some((key) => !fields.has(key))) issues.push("unknown-field");
  if (typeof input.id !== "string" || !ID_PATTERN.test(input.id)) issues.push("invalid-id");
  if (typeof input.hypothesis !== "string" || input.hypothesis.length < 10 || input.hypothesis.length > 240) {
    issues.push("invalid-hypothesis");
  }
  if (typeof input.subject !== "string" || !subjects.has(input.subject)) issues.push("invalid-subject");
  if (input.owner !== "Youtoola owner") issues.push("invalid-owner");
  if (typeof input.primaryMetric !== "string" || !TOKEN_PATTERN.test(input.primaryMetric)) {
    issues.push("invalid-metric");
  }
  if (!Array.isArray(input.guardrailMetrics) || input.guardrailMetrics.some((metric) =>
    typeof metric !== "string" || !TOKEN_PATTERN.test(metric))) {
    issues.push("invalid-metric");
  } else if (new Set(input.guardrailMetrics).size !== input.guardrailMetrics.length) {
    issues.push("duplicate-metric");
  }
  if (!Array.isArray(input.stopConditions) || input.stopConditions.length === 0 ||
    input.stopConditions.some((condition) => typeof condition !== "string" || condition.length < 5 || condition.length > 160)) {
    issues.push("invalid-stop-condition");
  } else if (REQUIRED_EXPERIMENT_STOP_CONDITIONS.some((condition) =>
    !(input.stopConditions as readonly unknown[]).includes(condition))) {
    issues.push("invalid-stop-condition");
  }
  if (!Number.isSafeInteger(input.minimumSampleRequirement) || (input.minimumSampleRequirement as number) < 1) {
    issues.push("invalid-sample");
  }
  if (typeof input.minimumDetectableEffectPercent !== "number" ||
    !Number.isFinite(input.minimumDetectableEffectPercent) || input.minimumDetectableEffectPercent <= 0) {
    issues.push("invalid-sample");
  }
  for (const criteria of [input.startCriteria, input.endCriteria]) {
    if (!Array.isArray(criteria) || criteria.length === 0 || criteria.some((value) =>
      typeof value !== "string" || value.length < 5 || value.length > 160)) issues.push("invalid-rule");
  }
  for (const value of [input.decisionRule, input.rollback]) {
    if (typeof value !== "string" || value.length < 5 || value.length > 240) issues.push("invalid-rule");
  }
  if (input.accessibilityReview !== "approved" || input.privacyReview !== "approved" ||
    input.seoReview !== "approved") issues.push("invalid-review");
  if (!Array.isArray(input.variants) || input.variants.length < 2) {
    issues.push("invalid-variant");
  } else {
    const ids = input.variants.map((variant) => isPlainRecord(variant) ? variant.id : undefined);
    if (new Set(ids).size !== ids.length) issues.push("duplicate-variant");
    let allocation = 0;
    for (const variant of input.variants) {
      if (!isPlainRecord(variant) || Object.keys(variant).some((key) => key !== "id" && key !== "allocationPercent") ||
        typeof variant.id !== "string" || !TOKEN_PATTERN.test(variant.id)) {
        issues.push("invalid-variant");
        continue;
      }
      if (typeof variant.allocationPercent !== "number" || variant.allocationPercent <= 0 ||
        !Number.isInteger(variant.allocationPercent)) {
        issues.push("invalid-allocation");
      } else allocation += variant.allocationPercent;
    }
    if (allocation !== 100) issues.push("invalid-allocation");
  }
  if (typeof input.status !== "string" || !statuses.has(input.status)) issues.push("invalid-status");
  if (typeof input.reviewedDate !== "string" || !DATE_PATTERN.test(input.reviewedDate)) issues.push("invalid-date");
  if (typeof input.ownerApprovalReference !== "string" || input.ownerApprovalReference.length < 1 ||
    input.ownerApprovalReference.length > 80) issues.push("invalid-owner-approval-reference");
  return Object.freeze([...new Set(issues)]);
}
