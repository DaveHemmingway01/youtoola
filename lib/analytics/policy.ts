import type { RuntimeEnvironment } from "@/lib/environment";

import type { AnalyticsConsentState } from "./contracts";

export function isAnalyticsConsentGranted(consentState: AnalyticsConsentState) {
  return consentState === "analytics-granted";
}

export function isAnalyticsEnvironmentEligible(environment: RuntimeEnvironment) {
  return environment === "production";
}
