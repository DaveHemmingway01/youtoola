import { describe, expect, it } from "vitest";

import { createClientGrowthConfiguration, resolveGa4Configuration } from "@/lib/analytics/ga4-configuration";

describe("server-owned analytics configuration", () => {
  const syntheticValidIdentifier = `G-${"A".repeat(5)}`;
  it("defaults to disabled and sends no identifier to the client", () => {
    const configuration = resolveGa4Configuration({});
    expect(configuration).toEqual({ enabled: false, environment: "local", warnings: [] });
    expect(createClientGrowthConfiguration(configuration)).toEqual({ analyticsAvailable: false, secureCookie: false });
  });

  it.each(["local", "preview"] as const)("rejects any provider configuration in %s", (environment) => {
    expect(() => resolveGa4Configuration({ YOUTOOLA_ENV: environment, YOUTOOLA_ANALYTICS_ENABLED: "true" })).toThrow(/prohibited/);
    expect(() => resolveGa4Configuration({ YOUTOOLA_ENV: environment, YOUTOOLA_GA4_MEASUREMENT_ID: syntheticValidIdentifier })).toThrow(/prohibited/);
  });

  it("fails invalid activation and enabled Production without a valid identifier", () => {
    expect(() => resolveGa4Configuration({ YOUTOOLA_ANALYTICS_ENABLED: "yes" })).toThrow(/true, false/);
    expect(() => resolveGa4Configuration({ YOUTOOLA_ENV: "production", YOUTOOLA_ANALYTICS_ENABLED: "true" })).toThrow(/valid bounded/);
    expect(() => resolveGa4Configuration({ YOUTOOLA_ENV: "production", YOUTOOLA_ANALYTICS_ENABLED: "true", YOUTOOLA_GA4_MEASUREMENT_ID: "g-lower" })).toThrow(/valid bounded/);
  });

  it("warns but remains disabled when Production has a residual identifier", () => {
    const configuration = resolveGa4Configuration({ YOUTOOLA_ENV: "production", YOUTOOLA_GA4_MEASUREMENT_ID: syntheticValidIdentifier });
    expect(configuration.enabled).toBe(false);
    expect(configuration.measurementId).toBeUndefined();
    expect(configuration.warnings).toHaveLength(1);
    expect(createClientGrowthConfiguration(configuration)).toEqual({ analyticsAvailable: false, secureCookie: true });
  });
});
