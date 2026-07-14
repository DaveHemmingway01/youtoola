import type { RuntimeEnvironment } from "@/lib/environment";
import type { AnalyticsConsentState, AnalyticsEventName, AnalyticsPlacementType } from "@/lib/analytics/contracts";

export const COMMERCIAL_CAPABILITY_TYPES = Object.freeze([
  "advertising",
  "affiliate",
  "premium",
  "lead",
] as const);

export type CommercialCapabilityType = (typeof COMMERCIAL_CAPABILITY_TYPES)[number];
export type CommercialCapabilityId = `commercial:${string}`;
export type CommercialActivationStatus = "inactive" | "review-only" | "approved-disabled" | "active";
export type CommercialProviderStatus = "absent" | "approved-unconfigured" | "configured";

export interface CommercialCapabilityDefinition {
  id: CommercialCapabilityId;
  type: CommercialCapabilityType;
  label: string;
  disclosure: string;
  placementId: string;
  placementType: AnalyticsPlacementType;
  approvedPageLocation: AnalyticsPlacementType;
  status: CommercialActivationStatus;
  providerStatus: CommercialProviderStatus;
  permittedEvents: readonly AnalyticsEventName[];
  reviewedDate: string;
  ownerApprovalReference: string;
  audienceRestrictions: readonly string[];
  jurisdictionRestrictions: readonly string[];
  privacyClassification: "public" | "operational";
  dimensions?: Readonly<{ height: number; width: number }>;
}

export type CommercialValidationIssue =
  | "duplicate-event"
  | "invalid-dimensions"
  | "invalid-disclosure"
  | "invalid-event"
  | "invalid-id"
  | "invalid-label"
  | "invalid-owner-approval-reference"
  | "invalid-placement"
  | "invalid-provider-status"
  | "invalid-reviewed-date"
  | "invalid-status"
  | "invalid-type"
  | "invalid-value"
  | "missing-advertising-dimensions"
  | "unsafe-activation"
  | "unknown-field";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^commercial:[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PLACEMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedFields = new Set([
  "dimensions",
  "approvedPageLocation",
  "audienceRestrictions",
  "disclosure",
  "id",
  "jurisdictionRestrictions",
  "label",
  "ownerApprovalReference",
  "permittedEvents",
  "placementId",
  "placementType",
  "providerStatus",
  "privacyClassification",
  "reviewedDate",
  "status",
  "type",
]);
const types = new Set<string>(COMMERCIAL_CAPABILITY_TYPES);
const placements = new Set<string>(["after-result", "supporting-section", "footer", "related-content"]);
const statuses = new Set<string>(["inactive", "review-only", "approved-disabled", "active"]);
const providerStatuses = new Set<string>(["absent", "approved-unconfigured", "configured"]);
const eventsByType: Record<CommercialCapabilityType, ReadonlySet<string>> = {
  advertising: new Set(),
  affiliate: new Set(["affiliate_click"]),
  premium: new Set(["premium_click"]),
  lead: new Set(["lead_start", "lead_submit"]),
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}

export function validateCommercialCapability(input: unknown): readonly CommercialValidationIssue[] {
  if (!isPlainRecord(input)) return Object.freeze(["invalid-type"]);
  const issues: CommercialValidationIssue[] = [];
  if (Object.keys(input).some((key) => !allowedFields.has(key))) issues.push("unknown-field");
  if (typeof input.id !== "string" || !ID_PATTERN.test(input.id)) issues.push("invalid-id");
  if (typeof input.type !== "string" || !types.has(input.type)) issues.push("invalid-type");
  if (typeof input.label !== "string" || input.label.length < 1 || input.label.length > 80) issues.push("invalid-label");
  if (typeof input.disclosure !== "string" || input.disclosure.length < 1 || input.disclosure.length > 180) {
    issues.push("invalid-disclosure");
  }
  if (typeof input.placementId !== "string" || !PLACEMENT_PATTERN.test(input.placementId)) {
    issues.push("invalid-placement");
  }
  if (typeof input.placementType !== "string" || !placements.has(input.placementType)) {
    issues.push("invalid-placement");
  }
  if (typeof input.approvedPageLocation !== "string" || !placements.has(input.approvedPageLocation)) {
    issues.push("invalid-placement");
  }
  if (input.approvedPageLocation !== input.placementType) issues.push("invalid-placement");
  if (typeof input.status !== "string" || !statuses.has(input.status)) issues.push("invalid-status");
  if (typeof input.providerStatus !== "string" || !providerStatuses.has(input.providerStatus)) {
    issues.push("invalid-provider-status");
  }
  if (typeof input.reviewedDate !== "string" || !DATE_PATTERN.test(input.reviewedDate)) {
    issues.push("invalid-reviewed-date");
  }
  if (
    typeof input.ownerApprovalReference !== "string" ||
    input.ownerApprovalReference.length < 1 ||
    input.ownerApprovalReference.length > 80
  ) issues.push("invalid-owner-approval-reference");
  if (input.privacyClassification !== "public" && input.privacyClassification !== "operational") {
    issues.push("invalid-type");
  }
  for (const restrictions of [input.audienceRestrictions, input.jurisdictionRestrictions]) {
    if (!Array.isArray(restrictions) || restrictions.some((value) =>
      typeof value !== "string" || value.length < 1 || value.length > 80)) issues.push("invalid-value");
  }

  if (!Array.isArray(input.permittedEvents)) {
    issues.push("invalid-event");
  } else {
    if (new Set(input.permittedEvents).size !== input.permittedEvents.length) issues.push("duplicate-event");
    const type = input.type as CommercialCapabilityType;
    const allowed = eventsByType[type];
    if (!allowed || input.permittedEvents.some((event) => typeof event !== "string" || !allowed.has(event))) {
      issues.push("invalid-event");
    }
  }

  if (input.type === "advertising" && input.dimensions === undefined) {
    issues.push("missing-advertising-dimensions");
  }
  if (input.dimensions !== undefined) {
    if (
      !isPlainRecord(input.dimensions) ||
      Object.keys(input.dimensions).some((key) => key !== "height" && key !== "width") ||
      !Number.isSafeInteger(input.dimensions.height) ||
      !Number.isSafeInteger(input.dimensions.width) ||
      (input.dimensions.height as number) <= 0 ||
      (input.dimensions.width as number) <= 0
    ) issues.push("invalid-dimensions");
  }
  if (input.status === "active" && input.providerStatus !== "configured") issues.push("unsafe-activation");

  return Object.freeze([...new Set(issues)]);
}

export function shouldRenderCommercialCapability({
  capability,
  consentState,
  environment,
  jurisdictionApproved,
  ownerApproved,
  placementApproved,
  resultAvailable,
  utilityEligibleCapabilityIds,
}: {
  capability: CommercialCapabilityDefinition;
  consentState: AnalyticsConsentState;
  environment: RuntimeEnvironment;
  jurisdictionApproved: boolean;
  ownerApproved: boolean;
  placementApproved: boolean;
  resultAvailable: boolean;
  utilityEligibleCapabilityIds: readonly CommercialCapabilityId[];
}) {
  return environment === "production" &&
    consentState === "marketing-granted" &&
    capability.status === "active" &&
    capability.providerStatus === "configured" &&
    ownerApproved &&
    jurisdictionApproved &&
    placementApproved &&
    resultAvailable &&
    utilityEligibleCapabilityIds.includes(capability.id) &&
    validateCommercialCapability(capability).length === 0;
}
