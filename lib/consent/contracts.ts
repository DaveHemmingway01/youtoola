import type { AnalyticsConsentState } from "@/lib/analytics/contracts";
import type { RuntimeEnvironment } from "@/lib/environment";

export const CONSENT_POLICY_VERSION = "v1" as const;
export const CONSENT_COOKIE_NAME = "youtoola_consent" as const;
export const CONSENT_COOKIE_MAX_AGE_SECONDS = 15_552_000 as const;

export type SerializableConsentState = "denied" | "analytics-granted";

export interface ConsentCookieParseResult {
  state: AnalyticsConsentState;
  valid: boolean;
}

export interface ConsentRuntimeDecision {
  analyticsAllowed: boolean;
  automaticNoticeAllowed: boolean;
  marketingAllowed: false;
  providerAllowed: boolean;
  state: AnalyticsConsentState;
}

export interface ConsentRuntimeInput {
  analyticsAvailable: boolean;
  consentState: AnalyticsConsentState;
  environment: RuntimeEnvironment;
}
