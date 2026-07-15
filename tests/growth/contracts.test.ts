import { describe, expect, it } from "vitest";

import dashboard from "@/data/growth/dashboard.json";
import foundation from "@/data/growth/foundation.json";
import monitoring from "@/data/growth/monitoring.json";
import { GA4_CSP_ORIGINS } from "@/lib/analytics/ga4-adapter";
import { createReportOnlyContentSecurityPolicy } from "@/lib/security/content-security-policy";
import type { DashboardMetricDefinition, GrowthFoundationRecord, GrowthMonitoringDefinition } from "@/lib/growth/contracts";
import { validateDashboardDefinitions, validateGrowthFoundationRecord, validateGrowthMonitoring } from "@/lib/growth/validation";

describe("Growth Foundation records", () => {
  it("validates dormant, secret-free configuration", () => {
    expect(validateGrowthFoundationRecord(foundation as unknown as GrowthFoundationRecord)).toEqual([]);
    expect(JSON.stringify(foundation)).not.toMatch(/token|credential|oauth|recovery|api.?key/i);
  });

  it("validates dashboard denominators and monitoring coverage", () => {
    expect(validateDashboardDefinitions(dashboard as DashboardMetricDefinition[])).toEqual([]);
    expect(validateGrowthMonitoring(monitoring as GrowthMonitoringDefinition)).toEqual([]);
  });

  it("uses a non-enforcing provider-free CSP", () => {
    const policy = createReportOnlyContentSecurityPolicy();
    expect(policy).not.toMatch(/google|clarity|report-uri|report-to/i);
    expect(policy).toContain("script-src 'self' 'unsafe-inline'");

    const readyPolicy = createReportOnlyContentSecurityPolicy({
      providerOrigins: GA4_CSP_ORIGINS,
    });
    expect(readyPolicy).toContain("connect-src 'self' https://www.google-analytics.com");
    expect(readyPolicy).toContain("script-src 'self' 'unsafe-inline' https://www.googletagmanager.com");
    expect(readyPolicy).not.toContain("*");
  });

  it("fails closed for malformed, unknown or activated record data", () => {
    expect(validateGrowthFoundationRecord({ ...foundation, unexpected: true })).toContain("record-fields");
    expect(validateGrowthFoundationRecord({ ...foundation, analytics: { ...foundation.analytics, activation: "enabled" } })).toContain("analytics-active");
    expect(validateGrowthFoundationRecord({})).toContain("record-fields");

    expect(validateDashboardDefinitions([{ ...dashboard[0], unexpected: true }])).toContain("metric-fields:organic-landing-sessions");
    expect(validateDashboardDefinitions([{ ...dashboard[0], source: "Unknown" }])).toContain("source:organic-landing-sessions");

    expect(validateGrowthMonitoring({ ...monitoring, unexpected: true })).toContain("monitoring-fields");
    expect(validateGrowthMonitoring({ ...monitoring, checks: [...monitoring.checks, "unknown"] })).toContain("unexpected-check:unknown");
  });
});
