import { PUBLIC_CANDIDATE_RELATIONSHIP_TYPES } from "@/lib/knowledge/relationship-semantics";

import {
  ANALYTICS_CALLER_COMMON_FIELDS,
  ANALYTICS_EVENT_NAMES,
  analyticsSchemaVersion,
  EVENT_FIELD_ALLOWLISTS,
  PROHIBITED_ANALYTICS_FIELDS,
  UTILITY_ANALYTICS_ELIGIBILITY_FIELDS,
  type AnalyticsConsentState,
  type AnalyticsErrorCountBucket,
  type AnalyticsEventEnvelope,
  type AnalyticsEventName,
  type AnalyticsPageType,
  type AnalyticsPlacementType,
  type AnalyticsResultClassification,
  type AnalyticsTimeToResultBucket,
  type AnalyticsValidationResult,
  type CanonicalAnalyticsContext,
  type UtilityAnalyticsEligibility,
} from "./contracts";

export const MAX_ANALYTICS_PAYLOAD_BYTES = 2_048;
const MAX_STRING_LENGTH = 80;
const IDENTIFIER_PATTERN = /^[a-z0-9]+(?:[-:][a-z0-9]+)*$/;
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[A-Z]{2})?$/;
const RELEASE_PATTERN = /^[a-f0-9]{7,64}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const eventNames = new Set<string>(ANALYTICS_EVENT_NAMES);
const commonFields = new Set<string>(ANALYTICS_CALLER_COMMON_FIELDS);
const prohibitedFields = new Set<string>(PROHIBITED_ANALYTICS_FIELDS);
const eligibilityFields = new Set<string>(UTILITY_ANALYTICS_ELIGIBILITY_FIELDS);
const pageTypes = new Set<AnalyticsPageType>(["platform", "directory", "utility", "trust", "review"]);
const consentStates = new Set<AnalyticsConsentState>([
  "unknown",
  "denied",
  "analytics-granted",
  "marketing-granted",
]);
const environments = new Set(["local", "preview", "production"]);
const resultClassifications = new Set<AnalyticsResultClassification>(["exact", "estimate"]);
const errorCountBuckets = new Set<AnalyticsErrorCountBucket>([
  "one",
  "two-to-three",
  "four-or-more",
]);
const timeBuckets = new Set<AnalyticsTimeToResultBucket>([
  "under-10-seconds",
  "10-to-30-seconds",
  "31-to-60-seconds",
  "one-to-three-minutes",
  "over-three-minutes",
]);
const placementTypes = new Set<AnalyticsPlacementType>([
  "after-result",
  "supporting-section",
  "footer",
  "related-content",
]);

function rejected(reason: Exclude<AnalyticsValidationResult["reason"], "accepted">): AnalyticsValidationResult {
  return Object.freeze({ ok: false, reason });
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return Object.getPrototypeOf(value) === Object.prototype;
}

function preflightPayload(payload: Record<string, unknown>): Exclude<AnalyticsValidationResult["reason"], "accepted"> | undefined {
  let bytes = 2;
  const seen = new Set<object>([payload]);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(payload))) {
    if (descriptor.get || descriptor.set) return "invalid-type";
    bytes += new TextEncoder().encode(key).byteLength + 4;
    const value = descriptor.value as unknown;
    if (typeof value === "string") bytes += new TextEncoder().encode(value).byteLength + 2;
    else if (typeof value === "number") {
      if (!Number.isFinite(value)) return "invalid-value";
      bytes += String(value).length;
    } else if (typeof value === "boolean" || value === null) bytes += 5;
    else if (typeof value === "object") {
      if (value !== null && seen.has(value)) return "circular-value";
      if (value !== null) seen.add(value);
      return "invalid-type";
    } else return "invalid-type";
    if (bytes > MAX_ANALYTICS_PAYLOAD_BYTES) return "oversized-payload";
  }
  return undefined;
}

function isBoundedString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_STRING_LENGTH;
}

function isIdentifier(value: unknown): value is string {
  return isBoundedString(value) && IDENTIFIER_PATTERN.test(value);
}

function assignString(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  key: string,
  predicate: (value: unknown) => value is string = isIdentifier,
) {
  const value = source[key];
  if (value === undefined) return true;
  if (!predicate(value)) return false;
  target[key] = value;
  return true;
}

function hasRequiredFields(eventName: AnalyticsEventName, event: Record<string, unknown>) {
  if (eventName === "tool_start") return event.interactionSource !== undefined;
  if (eventName === "tool_validation_error") return event.errorCode !== undefined;
  if (eventName === "related_tool_click") {
    return event.relationshipType !== undefined && event.targetUtilityId !== undefined;
  }
  if (["affiliate_click", "premium_click", "lead_start", "lead_submit"].includes(eventName)) {
    return event.capabilityId !== undefined && event.placementId !== undefined && event.placementType !== undefined;
  }
  return true;
}

function validateEligibility(
  event: Record<string, unknown>,
  eligibility: UtilityAnalyticsEligibility,
) {
  const eventName = event.eventName as AnalyticsEventName;
  if (!eligibility.allowedEvents.includes(eventName)) return false;
  if (
    event.interactionSource !== undefined &&
    !eligibility.allowedInteractionSources.includes(event.interactionSource as string)
  ) return false;
  if (event.errorCode !== undefined && !eligibility.allowedErrorCodes.includes(event.errorCode as string)) {
    return false;
  }
  if (event.fieldId !== undefined && !eligibility.allowedFieldIds.includes(event.fieldId as string)) {
    return false;
  }
  if (
    event.nonSensitiveResultType !== undefined &&
    !eligibility.allowedResultTypes.includes(event.nonSensitiveResultType as string)
  ) return false;
  if (event.resultClassification !== undefined && !eligibility.allowResultClassification) return false;
  if (
    event.capabilityId !== undefined &&
    !eligibility.allowedCommercialCapabilityIds.includes(event.capabilityId as string)
  ) return false;
  return true;
}

export function validateUtilityAnalyticsEligibility(input: unknown) {
  const issues: string[] = [];
  if (!isPlainRecord(input)) return Object.freeze(["invalid-eligibility"]);
  if (Object.keys(input).some((field) => !eligibilityFields.has(field))) {
    return Object.freeze(["invalid-eligibility"]);
  }
  const arrayFields = [
    "allowedEvents",
    "allowedInteractionSources",
    "allowedErrorCodes",
    "allowedFieldIds",
    "allowedResultTypes",
    "allowedCommercialCapabilityIds",
  ] as const;
  if (arrayFields.some((field) => !Array.isArray(input[field]))) return Object.freeze(["invalid-eligibility"]);
  if (typeof input.allowResultClassification !== "boolean") issues.push("invalid-result-classification-policy");
  const eligibility = input as unknown as UtilityAnalyticsEligibility;
  if (!DATE_PATTERN.test(eligibility.reviewedDate)) issues.push("invalid-reviewed-date");
  if (!isBoundedString(eligibility.ownerApprovalReference)) issues.push("invalid-owner-approval-reference");
  if (new Set(eligibility.allowedEvents).size !== eligibility.allowedEvents.length) issues.push("duplicate-event");
  if (eligibility.allowedEvents.some((event) => !eventNames.has(event))) issues.push("unknown-event");
  for (const values of [
    eligibility.allowedInteractionSources,
    eligibility.allowedErrorCodes,
    eligibility.allowedFieldIds,
    eligibility.allowedResultTypes,
    eligibility.allowedCommercialCapabilityIds,
  ]) {
    if (new Set(values).size !== values.length) issues.push("duplicate-allowlist-value");
    if (values.some((value) => !isIdentifier(value))) issues.push("invalid-allowlist-value");
  }
  return Object.freeze([...new Set(issues)]);
}

export function validateAnalyticsEvent(
  payload: unknown,
  eligibility: UtilityAnalyticsEligibility,
  canonicalContext: CanonicalAnalyticsContext,
): AnalyticsValidationResult {
  if (validateUtilityAnalyticsEligibility(eligibility).length > 0) return rejected("ineligible-category");
  if (!isPlainRecord(payload)) return rejected("invalid-prototype");
  const preflightFailure = preflightPayload(payload);
  if (preflightFailure) return rejected(preflightFailure);

  const keys = Object.keys(payload);
  if (keys.some((key) => prohibitedFields.has(key))) return rejected("prohibited-field");

  const rawEventName = payload.eventName;
  if (typeof rawEventName !== "string" || !eventNames.has(rawEventName)) return rejected("unknown-event");
  const eventName = rawEventName as AnalyticsEventName;
  const eventFields = new Set<string>(EVENT_FIELD_ALLOWLISTS[eventName]);
  if (keys.some((key) => !commonFields.has(key) && !eventFields.has(key))) return rejected("unknown-field");

  if (payload.analyticsSchemaVersion !== analyticsSchemaVersion) return rejected("invalid-schema-version");
  if (!pageTypes.has(payload.pageType as AnalyticsPageType)) return rejected("invalid-value");
  if (!environments.has(payload.environment as string)) return rejected("invalid-value");
  if (!consentStates.has(payload.consentState as AnalyticsConsentState)) return rejected("invalid-value");
  if (!isBoundedString(payload.locale) || !LOCALE_PATTERN.test(payload.locale)) return rejected("invalid-value");

  const safe: Record<string, unknown> = {
    analyticsSchemaVersion,
    categoryId: canonicalContext.categoryId,
    consentState: payload.consentState,
    environment: payload.environment,
    eventName,
    locale: payload.locale,
    pageType: payload.pageType,
    utilityId: canonicalContext.utilityId,
    utilitySlug: canonicalContext.utilitySlug,
  };

  for (const key of ["categoryId", "utilityId", "utilitySlug"] as const) {
    if (!isIdentifier(canonicalContext[key])) return rejected("invalid-value");
  }
  for (const key of [
    "capabilityId",
    "destinationCategory",
    "errorCode",
    "fieldId",
    "interactionSource",
    "nonSensitiveResultType",
    "placementId",
    "targetUtilityId",
  ] as const) {
    if (!assignString(payload, safe, key)) return rejected("invalid-value");
  }
  if (canonicalContext.releaseReference !== undefined) {
    if (!isBoundedString(canonicalContext.releaseReference) ||
      !RELEASE_PATTERN.test(canonicalContext.releaseReference)) return rejected("invalid-value");
    safe.releaseReference = canonicalContext.releaseReference;
  }

  if (payload.resultClassification !== undefined) {
    if (!resultClassifications.has(payload.resultClassification as AnalyticsResultClassification)) {
      return rejected("invalid-value");
    }
    safe.resultClassification = payload.resultClassification;
  }
  if (payload.errorCountBucket !== undefined) {
    if (!errorCountBuckets.has(payload.errorCountBucket as AnalyticsErrorCountBucket)) return rejected("invalid-value");
    safe.errorCountBucket = payload.errorCountBucket;
  }
  if (payload.timeToResultBucket !== undefined) {
    if (!timeBuckets.has(payload.timeToResultBucket as AnalyticsTimeToResultBucket)) return rejected("invalid-value");
    safe.timeToResultBucket = payload.timeToResultBucket;
  }
  if (payload.placementType !== undefined) {
    if (!placementTypes.has(payload.placementType as AnalyticsPlacementType)) return rejected("invalid-value");
    safe.placementType = payload.placementType;
  }
  if (payload.relationshipType !== undefined) {
    if (!PUBLIC_CANDIDATE_RELATIONSHIP_TYPES.has(payload.relationshipType as never)) return rejected("invalid-value");
    safe.relationshipType = payload.relationshipType;
  }

  if (safe.targetUtilityId !== undefined &&
    !canonicalContext.releasedTargetUtilityIds.includes(safe.targetUtilityId as string)) {
    return rejected("ineligible-category");
  }

  if (!hasRequiredFields(eventName, safe)) return rejected("invalid-field");
  if (!validateEligibility(safe, eligibility)) return rejected("ineligible-category");

  let serialized: string;
  try {
    serialized = JSON.stringify(safe);
  } catch {
    return rejected("circular-value");
  }
  if (new TextEncoder().encode(serialized).byteLength > MAX_ANALYTICS_PAYLOAD_BYTES) {
    return rejected("oversized-payload");
  }

  return Object.freeze({
    event: Object.freeze(safe) as unknown as Readonly<AnalyticsEventEnvelope>,
    ok: true,
    reason: "accepted",
  });
}
