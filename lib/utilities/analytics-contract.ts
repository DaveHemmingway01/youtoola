import type { UtilityAnalyticsEventName } from "./contracts";

export interface UtilityAnalyticsEligibility {
  category: string;
  eligibleEvents: readonly UtilityAnalyticsEventName[];
  nonSensitiveResultTypes?: readonly string[];
  utilitySlug: string;
}

export interface UtilityAnalyticsContext {
  category: string;
  nonSensitiveResultType?: string;
  utilitySlug: string;
}

export const PROHIBITED_ANALYTICS_FIELDS = Object.freeze([
  "email",
  "exactResult",
  "fileContent",
  "name",
  "personalData",
  "rawInput",
  "sensitiveData",
  "uploadedContent",
] as const);

export function isUtilityEventEligible(
  eligibility: UtilityAnalyticsEligibility,
  eventName: UtilityAnalyticsEventName,
) {
  return eligibility.eligibleEvents.includes(eventName);
}

export function containsProhibitedAnalyticsField(payload: Readonly<Record<string, unknown>>) {
  return PROHIBITED_ANALYTICS_FIELDS.some((field) => Object.hasOwn(payload, field));
}

export function createUtilityAnalyticsContext(context: UtilityAnalyticsContext) {
  return Object.freeze({
    category: context.category,
    ...(context.nonSensitiveResultType
      ? { nonSensitiveResultType: context.nonSensitiveResultType }
      : {}),
    utilitySlug: context.utilitySlug,
  });
}
