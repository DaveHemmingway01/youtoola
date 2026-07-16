import type { RuntimeEnvironment } from "@/lib/environment";
import type { RelationshipType } from "@/lib/knowledge/types";

export const analyticsSchemaVersion = 1 as const;

export const ANALYTICS_EVENT_NAMES = Object.freeze([
  "tool_view",
  "tool_start",
  "tool_validation_error",
  "tool_complete",
  "result_copy",
  "result_share",
  "result_export",
  "related_tool_click",
  "affiliate_click",
  "premium_click",
  "lead_start",
  "lead_submit",
] as const);
export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsConsentState =
  | "unknown"
  | "denied"
  | "analytics-granted"
  | "marketing-granted";
export type AnalyticsPageType = "platform" | "directory" | "utility" | "trust" | "review";
export type AnalyticsResultClassification = "exact" | "estimate";
export type AnalyticsErrorCountBucket = "one" | "two-to-three" | "four-or-more";
export type AnalyticsTimeToResultBucket =
  | "under-10-seconds"
  | "10-to-30-seconds"
  | "31-to-60-seconds"
  | "one-to-three-minutes"
  | "over-three-minutes";
export type AnalyticsPlacementType =
  | "after-result"
  | "supporting-section"
  | "footer"
  | "related-content";

export interface UtilityAnalyticsEligibility {
  allowedEvents: readonly AnalyticsEventName[];
  allowedInteractionSources: readonly string[];
  allowedErrorCodes: readonly string[];
  allowedFieldIds: readonly string[];
  allowedResultTypes: readonly string[];
  allowResultClassification: boolean;
  allowedCommercialCapabilityIds: readonly string[];
  reviewedDate: string;
  ownerApprovalReference: string;
}

export interface CanonicalAnalyticsContext {
  categoryId: string;
  releasedTargetUtilityIds: readonly string[];
  releaseReference?: string;
  utilityId: string;
  utilitySlug: string;
}

export interface AnalyticsEventEnvelope {
  analyticsSchemaVersion: typeof analyticsSchemaVersion;
  categoryId: string;
  consentState: AnalyticsConsentState;
  environment: RuntimeEnvironment;
  eventName: AnalyticsEventName;
  pageType: AnalyticsPageType;
  utilityId: string;
  utilitySlug: string;
  locale: string;
  capabilityId?: string;
  destinationCategory?: string;
  errorCode?: string;
  errorCountBucket?: AnalyticsErrorCountBucket;
  fieldId?: string;
  interactionSource?: string;
  nonSensitiveResultType?: string;
  placementId?: string;
  placementType?: AnalyticsPlacementType;
  relationshipType?: RelationshipType;
  releaseReference?: string;
  resultClassification?: AnalyticsResultClassification;
  targetUtilityId?: string;
  timeToResultBucket?: AnalyticsTimeToResultBucket;
}

export type UtilityAnalyticsEventInput = Readonly<
  Pick<AnalyticsEventEnvelope, "eventName"> &
    Partial<
      Pick<
        AnalyticsEventEnvelope,
        | "errorCode"
        | "errorCountBucket"
        | "fieldId"
        | "interactionSource"
        | "nonSensitiveResultType"
        | "resultClassification"
        | "timeToResultBucket"
      >
    >
>;

export type AnalyticsDataClassification = "public" | "operational" | "sensitive" | "prohibited";

export const ANALYTICS_FIELD_CLASSIFICATIONS = Object.freeze({
  analyticsSchemaVersion: "operational",
  capabilityId: "operational",
  categoryId: "public",
  consentState: "operational",
  destinationCategory: "operational",
  environment: "operational",
  errorCode: "operational",
  errorCountBucket: "operational",
  eventName: "operational",
  fieldId: "operational",
  interactionSource: "operational",
  locale: "public",
  nonSensitiveResultType: "operational",
  pageType: "public",
  placementId: "operational",
  placementType: "operational",
  relationshipType: "public",
  releaseReference: "operational",
  resultClassification: "operational",
  targetUtilityId: "public",
  timeToResultBucket: "operational",
  utilityId: "public",
  utilitySlug: "public",
} satisfies Readonly<Record<keyof AnalyticsEventEnvelope, Extract<AnalyticsDataClassification, "public" | "operational">>>);

export type AnalyticsValidationReason =
  | "accepted"
  | "circular-value"
  | "ineligible-category"
  | "ineligible-event"
  | "invalid-field"
  | "invalid-prototype"
  | "invalid-schema-version"
  | "invalid-type"
  | "invalid-value"
  | "oversized-payload"
  | "prohibited-field"
  | "unknown-event"
  | "unknown-field";

export type AnalyticsValidationResult =
  | Readonly<{ ok: true; event: Readonly<AnalyticsEventEnvelope>; reason: "accepted" }>
  | Readonly<{ ok: false; reason: Exclude<AnalyticsValidationReason, "accepted"> }>;

export const EVENT_FIELD_ALLOWLISTS = Object.freeze({
  tool_view: Object.freeze([]),
  tool_start: Object.freeze(["interactionSource"]),
  tool_validation_error: Object.freeze(["errorCode", "errorCountBucket", "fieldId"]),
  tool_complete: Object.freeze([
    "nonSensitiveResultType",
    "resultClassification",
    "timeToResultBucket",
  ]),
  result_copy: Object.freeze(["interactionSource"]),
  result_share: Object.freeze(["interactionSource"]),
  result_export: Object.freeze(["interactionSource"]),
  related_tool_click: Object.freeze([
    "interactionSource",
    "relationshipType",
    "targetUtilityId",
  ]),
  affiliate_click: Object.freeze([
    "capabilityId",
    "destinationCategory",
    "interactionSource",
    "placementId",
    "placementType",
  ]),
  premium_click: Object.freeze([
    "capabilityId",
    "interactionSource",
    "placementId",
    "placementType",
  ]),
  lead_start: Object.freeze([
    "capabilityId",
    "interactionSource",
    "placementId",
    "placementType",
  ]),
  lead_submit: Object.freeze(["capabilityId", "placementId", "placementType"]),
} satisfies Record<AnalyticsEventName, readonly string[]>);

export const ANALYTICS_CALLER_COMMON_FIELDS = Object.freeze([
  "analyticsSchemaVersion",
  "consentState",
  "environment",
  "eventName",
  "locale",
  "pageType",
] as const);

export const UTILITY_ANALYTICS_ELIGIBILITY_FIELDS = Object.freeze([
  "allowResultClassification",
  "allowedCommercialCapabilityIds",
  "allowedErrorCodes",
  "allowedEvents",
  "allowedFieldIds",
  "allowedInteractionSources",
  "allowedResultTypes",
  "ownerApprovalReference",
  "reviewedDate",
] as const);

export const PROHIBITED_ANALYTICS_FIELDS = Object.freeze([
  "address",
  "advertisingId",
  "constructor",
  "deviceFingerprint",
  "email",
  "exactResult",
  "fileContent",
  "filename",
  "freeText",
  "healthData",
  "legalData",
  "message",
  "name",
  "personalData",
  "phone",
  "preciseLocation",
  "prototype",
  "rawInput",
  "sensitiveData",
  "sessionId",
  "uploadedContent",
  "userId",
  "__proto__",
] as const);
