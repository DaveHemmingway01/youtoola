import { describe, expect, it, vi } from "vitest";

import { parseConsentCookie, serializeConsentCookie } from "@/lib/consent/cookie";
import {
  deleteGoogleAnalyticsCookies,
  resolveConsentRuntime,
  withdrawAnalyticsConsent,
} from "@/lib/consent/runtime";

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
    expect(() =>
      serializeConsentCookie("marketing-granted" as never, { secure: true }),
    ).toThrow(/Only denied or analytics-granted/);
  });
});

describe("consent runtime", () => {
  it("deletes only Google Analytics cookies for the host and canonical domain", () => {
    const writeCookie = vi.fn();
    expect(deleteGoogleAnalyticsCookies({
      cookieHeader: "other=value; _ga=GA1.1.1.1; _ga_ABC123=value; _gac_test=kept",
      secure: true,
      writeCookie,
    })).toBe(2);
    expect(writeCookie).toHaveBeenCalledTimes(4);
    const output = writeCookie.mock.calls.flat().join("\n");
    expect(output).toContain("_ga=");
    expect(output).toContain("_ga_ABC123=");
    expect(output).toContain("Domain=youtoola.com");
    expect(output).not.toContain("other=");
    expect(output).not.toContain("_gac_test=");
  });

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
      deleteProviderCookies: dependency("provider-cookies"),
      disableAdapter: dependency("disable"),
      providerLoaded: true,
      updateProviderDenied: dependency("provider-denied"),
      writeDeniedCookie: dependency("cookie"),
    };
    expect(withdrawAnalyticsConsent(dependencies)).toBe("denied");
    expect(order).toEqual([
      "cookie",
      "disable",
      "provider-denied",
      "provider-cookies",
      "dedup",
      "lifecycle",
      "page-view",
    ]);
  });
});
