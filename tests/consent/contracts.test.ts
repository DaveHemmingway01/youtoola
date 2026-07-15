import { describe, expect, it, vi } from "vitest";

import { parseConsentCookie, serializeConsentCookie } from "@/lib/consent/cookie";
import { resolveConsentRuntime, withdrawAnalyticsConsent } from "@/lib/consent/runtime";

describe("consent cookie contract", () => {
  it.each([
    ["youtoola_consent=v1:denied", "denied"],
    ["other=value; youtoola_consent=v1:analytics-granted", "analytics-granted"],
  ])("parses %s", (cookie, state) => {
    expect(parseConsentCookie(cookie)).toEqual({ state, valid: true });
  });

  it.each([
    "",
    "youtoola_consent=v2:denied",
    "youtoola_consent=v1:marketing-granted",
    "youtoola_consent=malformed",
    "youtoola_consent=v1:denied; youtoola_consent=v1:analytics-granted",
  ])("fails unknown, malformed and duplicate values closed", (cookie) => {
    expect(parseConsentCookie(cookie)).toEqual({ state: "unknown", valid: false });
  });

  it("serializes only exact V1 attributes", () => {
    expect(serializeConsentCookie("denied", { secure: false })).toBe(
      "youtoola_consent=v1:denied; Max-Age=15552000; Path=/; SameSite=Lax",
    );
    expect(serializeConsentCookie("analytics-granted", { secure: true })).toBe(
      "youtoola_consent=v1:analytics-granted; Max-Age=15552000; Path=/; SameSite=Lax; Secure",
    );
    expect(serializeConsentCookie("denied", { secure: true })).not.toMatch(/Domain|HttpOnly|timestamp|user/i);
  });
});

describe("consent runtime", () => {
  it("preserves all states while keeping marketing unavailable", () => {
    for (const consentState of ["unknown", "denied", "analytics-granted", "marketing-granted"] as const) {
      const decision = resolveConsentRuntime({ analyticsAvailable: true, consentState, environment: "production" });
      expect(decision.marketingAllowed).toBe(false);
      expect(decision.providerAllowed).toBe(consentState === "analytics-granted");
    }
  });

  it("blocks Local, Preview and dormant Production", () => {
    expect(resolveConsentRuntime({ analyticsAvailable: true, consentState: "analytics-granted", environment: "local" }).providerAllowed).toBe(false);
    expect(resolveConsentRuntime({ analyticsAvailable: true, consentState: "analytics-granted", environment: "preview" }).providerAllowed).toBe(false);
    expect(resolveConsentRuntime({ analyticsAvailable: false, consentState: "analytics-granted", environment: "production" }).providerAllowed).toBe(false);
  });

  it("withdraws in the required order and only updates a loaded provider", () => {
    const order: string[] = [];
    const dependency = (name: string) => vi.fn(() => order.push(name));
    const dependencies = {
      clearAnalyticsDeduplication: dependency("dedup"),
      clearPageViewState: dependency("page-view"),
      clearProviderLifecycle: dependency("lifecycle"),
      disableAdapter: dependency("disable"),
      providerLoaded: true,
      updateProviderDenied: dependency("provider-denied"),
      writeDeniedCookie: dependency("cookie"),
    };
    expect(withdrawAnalyticsConsent(dependencies)).toBe("denied");
    expect(order).toEqual(["cookie", "disable", "provider-denied", "dedup", "lifecycle", "page-view"]);
  });
});
