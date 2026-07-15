import type { AnalyticsConsentState } from "@/lib/analytics/contracts";

import type { ConsentRuntimeDecision, ConsentRuntimeInput } from "./contracts";

export function resolveConsentRuntime(input: ConsentRuntimeInput): ConsentRuntimeDecision {
  const providerAllowed =
    input.environment === "production" &&
    input.analyticsAvailable &&
    input.consentState === "analytics-granted";

  return Object.freeze({
    analyticsAllowed: providerAllowed,
    automaticNoticeAllowed:
      input.environment === "production" &&
      input.analyticsAvailable &&
      input.consentState === "unknown",
    marketingAllowed: false,
    providerAllowed,
    state: input.consentState,
  });
}

export interface ConsentWithdrawalDependencies {
  clearAnalyticsDeduplication(): void;
  clearPageViewState(): void;
  clearProviderLifecycle(): void;
  disableAdapter(): void;
  providerLoaded: boolean;
  updateProviderDenied(): void;
  writeDeniedCookie(): void;
}

export function withdrawAnalyticsConsent(dependencies: ConsentWithdrawalDependencies) {
  dependencies.writeDeniedCookie();
  dependencies.disableAdapter();
  if (dependencies.providerLoaded) dependencies.updateProviderDenied();
  dependencies.clearAnalyticsDeduplication();
  dependencies.clearProviderLifecycle();
  dependencies.clearPageViewState();
  return "denied" satisfies AnalyticsConsentState;
}
