import { describe, expect, it } from "vitest";

import dashboard from "@/data/growth/dashboard.json";
import foundation from "@/data/growth/foundation.json";
import monitoring from "@/data/growth/monitoring.json";
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
  });
});
