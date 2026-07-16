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
  deleteProviderCookies(): void;
  disableAdapter(): void;
  providerLoaded: boolean;
  updateProviderDenied(): void;
  writeDeniedCookie(): void;
}

export function withdrawAnalyticsConsent(dependencies: ConsentWithdrawalDependencies) {
  dependencies.writeDeniedCookie();
  dependencies.disableAdapter();
  if (dependencies.providerLoaded) dependencies.updateProviderDenied();
  dependencies.deleteProviderCookies();
  dependencies.clearAnalyticsDeduplication();
  dependencies.clearProviderLifecycle();
  dependencies.clearPageViewState();
  return "denied" satisfies AnalyticsConsentState;
}

export function deleteGoogleAnalyticsCookies({
  cookieHeader,
  secure,
  writeCookie,
}: {
  cookieHeader: string;
  secure: boolean;
  writeCookie(value: string): void;
}) {
  const names = [...new Set(
    cookieHeader
      .split(";")
      .map((part) => part.trim().split("=", 1)[0])
      .filter((name) => /^_ga(?:_|$)[A-Za-z0-9_]*$/.test(name)),
  )];
  const secureAttribute = secure ? "; Secure" : "";

  for (const name of names) {
    const expired = `${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax${secureAttribute}`;
    writeCookie(expired);
    writeCookie(`${expired}; Domain=youtoola.com`);
  }

  return names.length;
}
