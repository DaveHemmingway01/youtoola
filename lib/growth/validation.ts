import type { DashboardMetricDefinition } from "./contracts";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const dashboardSources = new Set<DashboardMetricDefinition["source"]>([
  "Bing Webmaster Tools",
  "GA4",
  "Google Search Console",
  "Repository",
  "Vercel",
]);
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]) {
  const actual = Object.keys(value).sort();
  return actual.length === expected.length &&
    actual.every((key, index) => key === [...expected].sort()[index]);
}

function isValidDate(value: unknown) {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function expectRecord(
  value: unknown,
  expectedKeys: readonly string[],
  issue: string,
  issues: string[],
) {
  if (!isRecord(value) || !hasExactKeys(value, expectedKeys)) {
    issues.push(issue);
    return null;
  }
  return value;
}

export function validateGrowthFoundationRecord(input: unknown) {
  const issues: string[] = [];
  const record = expectRecord(
    input,
    [
      "analytics",
      "bing",
      "consent",
      "dashboard",
      "features",
      "monitoring",
      "owner",
      "recordVersion",
      "reviewedDate",
      "searchConsole",
      "sitemapSubmission",
    ],
    "record-fields",
    issues,
  );
  if (!record) return Object.freeze(issues);

  if (record.recordVersion !== 1) issues.push("record-version");
  if (record.owner !== "Youtoola owner") issues.push("owner");
  if (!isValidDate(record.reviewedDate)) issues.push("reviewed-date");

  const analytics = expectRecord(
    record.analytics,
    ["activation", "displayName", "identifierStatus", "legalPrivacyApproval", "recommendedKeyEvents"],
    "analytics-fields",
    issues,
  );
  if (analytics) {
    if (analytics.activation !== "disabled") issues.push("analytics-active");
    if (analytics.displayName !== "Google Analytics 4") issues.push("analytics-display-name");
    if (analytics.identifierStatus !== "not-configured") issues.push("identifier-configured");
    if (analytics.legalPrivacyApproval !== "pending") issues.push("legal-approval-claimed");
    if (!Array.isArray(analytics.recommendedKeyEvents) ||
      analytics.recommendedKeyEvents.length !== 1 ||
      analytics.recommendedKeyEvents[0] !== "tool_complete") issues.push("key-events");
  }

  const consent = expectRecord(
    record.consent,
    ["activeChoices", "cookieMaxAgeSeconds", "marketingStatus", "policyVersion"],
    "consent-fields",
    issues,
  );
  if (consent) {
    if (!Array.isArray(consent.activeChoices) ||
      consent.activeChoices.join(",") !== "denied,analytics-granted") issues.push("consent-choices");
    if (consent.marketingStatus !== "reserved-unavailable-denied") issues.push("marketing-state");
    if (consent.cookieMaxAgeSeconds !== 15_552_000) issues.push("cookie-lifetime");
    if (consent.policyVersion !== "v1") issues.push("policy-version");
  }

  const features = expectRecord(
    record.features,
    ["advertising", "analytics", "clarity", "experiments", "leads", "premium"],
    "feature-fields",
    issues,
  );
  if (features && Object.values(features).some((value) => value !== false)) {
    issues.push("feature-activation");
  }

  for (const [key, issue] of [
    ["searchConsole", "search-console"],
    ["bing", "bing"],
  ] as const) {
    const service = expectRecord(record[key], ["owner", "status"], `${issue}-fields`, issues);
    if (service) {
      if (service.owner !== "Youtoola owner") issues.push(`${issue}-owner`);
      if (service.status !== "not-configured") issues.push(issue);
    }
  }

  const sitemap = expectRecord(
    record.sitemapSubmission,
    ["status"],
    "sitemap-submission-fields",
    issues,
  );
  if (sitemap?.status !== "not-submitted") issues.push("sitemap-submission");

  const dashboard = expectRecord(
    record.dashboard,
    ["owner", "status", "zeroDenominator"],
    "dashboard-fields",
    issues,
  );
  if (dashboard) {
    if (dashboard.owner !== "Youtoola owner") issues.push("dashboard-owner");
    if (dashboard.status !== "definition-only") issues.push("dashboard-status");
    if (dashboard.zeroDenominator !== "not-available") issues.push("dashboard-zero-denominator");
  }

  const monitoring = expectRecord(
    record.monitoring,
    ["owner", "schedule", "status"],
    "monitoring-fields",
    issues,
  );
  if (monitoring) {
    if (monitoring.owner !== "Youtoola owner") issues.push("monitoring-owner");
    if (monitoring.schedule !== "0 7 * * 1") issues.push("monitoring-schedule");
    if (monitoring.status !== "definition-only") issues.push("monitoring-status");
  }

  return Object.freeze([...new Set(issues)]);
}

export function validateDashboardDefinitions(input: unknown) {
  const issues: string[] = [];
  if (!Array.isArray(input)) return Object.freeze(["dashboard-definitions"]);
  const ids = new Set<string>();
  for (const rawMetric of input) {
    const fallbackId = isRecord(rawMetric) && typeof rawMetric.id === "string"
      ? rawMetric.id
      : "unknown";
    const metric = expectRecord(
      rawMetric,
      ["denominator", "id", "numerator", "source"],
      `metric-fields:${fallbackId}`,
      issues,
    );
    if (!metric) continue;
    const id = typeof metric.id === "string" && metric.id.length > 0 ? metric.id : "unknown";
    if (id === "unknown" || ids.has(id)) issues.push("metric-id");
    ids.add(id);
    if (typeof metric.numerator !== "string" || metric.numerator.length === 0) {
      issues.push(`numerator:${id}`);
    }
    if (metric.denominator !== null &&
      (typeof metric.denominator !== "string" || metric.denominator.length === 0)) {
      issues.push(`denominator:${id}`);
    }
    if (metric.denominator === "0") issues.push(`zero-denominator:${id}`);
    if (!dashboardSources.has(metric.source as DashboardMetricDefinition["source"])) {
      issues.push(`source:${id}`);
    }
  }
  return Object.freeze([...new Set(issues)]);
}

export function validateGrowthMonitoring(input: unknown) {
  const issues: string[] = [];
  const monitoring = expectRecord(
    input,
    ["checks", "owner", "schedule", "status"],
    "monitoring-fields",
    issues,
  );
  if (!monitoring) return Object.freeze(issues);
  if (monitoring.owner !== "Youtoola owner") issues.push("owner");
  if (monitoring.schedule !== "0 7 * * 1") issues.push("schedule");
  if (monitoring.status !== "definition-only") issues.push("status");
  if (!Array.isArray(monitoring.checks) ||
    monitoring.checks.some((check) => typeof check !== "string")) {
    issues.push("checks");
    return Object.freeze([...new Set(issues)]);
  }
  const checks = monitoring.checks as string[];
  if (new Set(checks).size !== checks.length) issues.push("duplicate-check");
  for (const check of requiredMonitoringChecks) {
    if (!checks.includes(check)) issues.push(`missing-check:${check}`);
  }
  for (const check of checks) {
    if (!(requiredMonitoringChecks as readonly string[]).includes(check)) {
      issues.push(`unexpected-check:${check}`);
    }
  }
  return Object.freeze([...new Set(issues)]);
}
