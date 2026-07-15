import type {
  DashboardMetricDefinition,
  GrowthFoundationRecord,
  GrowthMonitoringDefinition,
} from "./contracts";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const requiredMonitoringChecks = [
  "approved-public-routes",
  "approved-unavailable-routes",
  "apex-308",
  "canonicals",
  "sitemap",
  "indexability",
  "security-headers",
  "open-graph-metadata",
  "open-graph-asset",
  "report-only-csp",
  "no-enforced-csp",
  "no-provider-identifiers-or-requests",
  "no-analytics-set-cookie",
  "no-clarity-or-commercial-providers",
] as const;

export function validateGrowthFoundationRecord(input: GrowthFoundationRecord) {
  const issues: string[] = [];
  if (input.recordVersion !== 1) issues.push("record-version");
  if (!datePattern.test(input.reviewedDate)) issues.push("reviewed-date");
  if (input.analytics.activation !== "disabled") issues.push("analytics-active");
  if (input.analytics.identifierStatus !== "not-configured") issues.push("identifier-configured");
  if (input.analytics.legalPrivacyApproval !== "pending") issues.push("legal-approval-claimed");
  if (input.analytics.recommendedKeyEvents.join(",") !== "tool_complete") issues.push("key-events");
  if (input.consent.activeChoices.join(",") !== "denied,analytics-granted") issues.push("consent-choices");
  if (input.consent.marketingStatus !== "reserved-unavailable-denied") issues.push("marketing-state");
  if (input.consent.cookieMaxAgeSeconds !== 15_552_000) issues.push("cookie-lifetime");
  if (Object.values(input.features).some(Boolean)) issues.push("feature-activation");
  if (input.searchConsole.status !== "not-configured") issues.push("search-console");
  if (input.bing.status !== "not-configured") issues.push("bing");
  if (input.sitemapSubmission.status !== "not-submitted") issues.push("sitemap-submission");
  if (input.dashboard.status !== "definition-only") issues.push("dashboard-status");
  if (input.monitoring.status !== "definition-only") issues.push("monitoring-status");
  return Object.freeze(issues);
}

export function validateDashboardDefinitions(input: readonly DashboardMetricDefinition[]) {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const metric of input) {
    if (!metric.id || ids.has(metric.id)) issues.push("metric-id");
    ids.add(metric.id);
    if (!metric.numerator) issues.push(`numerator:${metric.id}`);
    if (metric.denominator === "0") issues.push(`zero-denominator:${metric.id}`);
  }
  return Object.freeze(issues);
}

export function validateGrowthMonitoring(input: GrowthMonitoringDefinition) {
  const issues: string[] = [];
  if (input.schedule !== "0 7 * * 1") issues.push("schedule");
  if (input.status !== "definition-only") issues.push("status");
  if (new Set(input.checks).size !== input.checks.length) issues.push("duplicate-check");
  for (const check of requiredMonitoringChecks) {
    if (!input.checks.includes(check)) issues.push(`missing-check:${check}`);
  }
  return Object.freeze(issues);
}
