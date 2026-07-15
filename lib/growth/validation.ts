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
  "preview-provider-free",
  "pre-consent-provider-silence",
  "reject-provider-silence",
  "single-sanitized-page-view",
  "withdrawal-blocks-future-events",
] as const;
const activationStates = new Set([
  "dormant",
  "legally-approved",
  "externally-configured",
  "activation-ready",
  "active",
  "disabled",
  "incident-disabled",
]);
const allowedCustomDimensions = new Set([
  "utility_id",
  "category_id",
  "error_code",
  "result_classification",
  "non_sensitive_result_type",
  "time_to_result_bucket",
  "relationship_type",
  "target_utility_id",
]);
const publicGrowthUrls = [
  "https://www.youtoola.com/",
  "https://www.youtoola.com/tools",
  "https://www.youtoola.com/about",
  "https://www.youtoola.com/methodology",
  "https://www.youtoola.com/privacy",
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

function validateUrlInspections(value: unknown, issue: string, issues: string[]) {
  if (!Array.isArray(value) || value.length !== publicGrowthUrls.length) {
    issues.push(`${issue}-url-inspections`);
    return;
  }
  value.forEach((rawInspection, index) => {
    const inspection = expectRecord(
      rawInspection,
      ["indexStatus", "indexingRequest", "liveTest", "technicallyIndexable", "url"],
      `${issue}-url-inspection-fields`,
      issues,
    );
    if (!inspection) return;
    if (inspection.url !== publicGrowthUrls[index]) issues.push(`${issue}-url`);
    if (inspection.liveTest !== "passed") issues.push(`${issue}-live-test`);
    if (inspection.technicallyIndexable !== true) issues.push(`${issue}-indexability`);
    if (inspection.indexingRequest !== "submitted-where-needed") issues.push(`${issue}-indexing-request`);
    if (inspection.indexStatus !== "pending") issues.push(`${issue}-index-status`);
  });
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

export function validateGrowthActivationRecord(input: unknown) {
  const issues: string[] = [];
  const record = expectRecord(
    input,
    [
      "activationState",
      "analytics",
      "bing",
      "dashboard",
      "evidence",
      "legalPrivacy",
      "monitoring",
      "owner",
      "privacyContact",
      "recordVersion",
      "reviewedDate",
      "searchConsole",
      "sitemapSubmission",
    ],
    "activation-record-fields",
    issues,
  );
  if (!record) return Object.freeze(issues);

  if (record.recordVersion !== 1) issues.push("activation-record-version");
  if (record.owner !== "Youtoola owner") issues.push("activation-owner");
  if (!isValidDate(record.reviewedDate)) issues.push("activation-reviewed-date");
  if (typeof record.activationState !== "string" || !activationStates.has(record.activationState)) {
    issues.push("activation-state");
  }

  const legal = expectRecord(
    record.legalPrivacy,
    ["approvalReference", "jurisdictions", "status"],
    "legal-privacy-fields",
    issues,
  );
  if (legal) {
    if (!["approved", "pending"].includes(legal.status as string)) issues.push("legal-privacy-status");
    if (!Array.isArray(legal.jurisdictions) || legal.jurisdictions.some((value) => typeof value !== "string" || value.length === 0)) {
      issues.push("legal-jurisdictions");
    }
    if (legal.status === "approved" && (typeof legal.approvalReference !== "string" || legal.approvalReference.length === 0)) {
      issues.push("legal-approval-reference");
    }
    if (legal.status === "pending" && legal.approvalReference !== null) issues.push("premature-legal-reference");
  }

  const contact = expectRecord(
    record.privacyContact,
    ["address", "status"],
    "privacy-contact-fields",
    issues,
  );
  if (contact) {
    if (!["operational", "pending"].includes(contact.status as string)) issues.push("privacy-contact-status");
    if (contact.status === "operational" && (typeof contact.address !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.address))) {
      issues.push("privacy-contact-address");
    }
    if (contact.status === "pending" && contact.address !== null) issues.push("premature-privacy-contact");
  }

  const analytics = expectRecord(
    record.analytics,
    ["configuration", "customDimensions", "keyEvents", "measurementIdStatus", "productionVariables", "provider", "retentionMonths", "sanitizedPageView", "settings", "settingsVerification", "status"],
    "activation-analytics-fields",
    issues,
  );
  if (analytics) {
    if (analytics.provider !== "Google Analytics 4") issues.push("activation-provider");
    if (!["configured", "disabled", "not-configured", "partially-configured", "verified"].includes(analytics.status as string)) issues.push("activation-analytics-status");
    if (!["configured", "not-configured"].includes(analytics.measurementIdStatus as string)) issues.push("measurement-id-status");
    if (!["configured", "not-configured"].includes(analytics.productionVariables as string)) issues.push("production-variables-status");
    if (analytics.retentionMonths !== 2) issues.push("analytics-retention");
    if (!["pending", "verified"].includes(analytics.settingsVerification as string)) issues.push("analytics-settings-verification");
    if (!["approved", "build-ready", "verified"].includes(analytics.sanitizedPageView as string)) issues.push("sanitized-page-view-status");
    if (!Array.isArray(analytics.keyEvents) || analytics.keyEvents.join(",") !== "tool_complete") issues.push("activation-key-events");
    if (!Array.isArray(analytics.customDimensions) ||
      analytics.customDimensions.some((value) => typeof value !== "string" || !allowedCustomDimensions.has(value)) ||
      new Set(analytics.customDimensions).size !== analytics.customDimensions.length) {
      issues.push("custom-dimensions");
    }
    const configuration = expectRecord(
      analytics.configuration,
      ["accountDisplayName", "evidenceReference", "measurementIdFingerprint", "propertyDisplayName", "propertyId", "streamDisplayName", "streamId", "streamUrl"],
      "analytics-configuration-fields",
      issues,
    );
    if (configuration) {
      if (configuration.accountDisplayName !== null) issues.push("unverified-analytics-account-name");
      if (configuration.propertyDisplayName !== null) issues.push("unverified-analytics-property-name");
      if (configuration.propertyId !== null) issues.push("unverified-analytics-property-id");
      if (configuration.streamDisplayName !== "Youtoola") issues.push("analytics-stream-name");
      if (configuration.streamId !== "15263953983") issues.push("analytics-stream-id");
      if (configuration.streamUrl !== "https://www.youtoola.com") issues.push("analytics-stream-url");
      if (configuration.measurementIdFingerprint !== "sha256:96718192b2e08dc78eec82cd444dbdf359b3d6bbcf550c1ae0a96f81b10fe67b") issues.push("analytics-measurement-id-fingerprint");
      if (typeof configuration.evidenceReference !== "string" || !configuration.evidenceReference.includes("7a684274b68f8bf0b56d74ce47791e7a369bb0e400627a328ffac04628743ee4")) {
        issues.push("analytics-evidence-reference");
      }
    }
    if (analytics.status === "partially-configured" &&
      (analytics.measurementIdStatus !== "configured" || analytics.settingsVerification !== "pending")) {
      issues.push("analytics-partial-configuration");
    }
    const settings = expectRecord(
      analytics.settings,
      ["advertisingFeatures", "automaticPageViews", "crossDomainMeasurement", "enhancedMeasurement", "googleSignals", "measurementProtocol", "userId"],
      "analytics-settings-fields",
      issues,
    );
    if (settings && Object.values(settings).some((value) => value !== false)) issues.push("prohibited-analytics-setting");
  }

  for (const [key, issue] of [["searchConsole", "search-console"], ["bing", "bing"]] as const) {
    const rawService = record[key];
    const verified = isRecord(rawService) && rawService.status === "verified";
    const expectedKeys = key === "searchConsole"
      ? verified
        ? ["property", "propertyType", "status", "urlInspections", "verificationMethod"]
        : ["property", "status"]
      : verified
        ? ["site", "status", "urlInspections", "verificationMethod"]
        : ["site", "status"];
    const service = expectRecord(rawService, expectedKeys, `${issue}-activation-fields`, issues);
    if (!service) continue;
    if (!["configured", "error", "not-configured", "verified"].includes(service.status as string)) issues.push(`${issue}-activation-status`);
    const identifier = key === "searchConsole" ? service.property : service.site;
    if ((service.status === "configured" || service.status === "verified") && (typeof identifier !== "string" || identifier.length === 0)) issues.push(`${issue}-identifier`);
    if (service.status === "not-configured" && identifier !== null) issues.push(`premature-${issue}-identifier`);
    if (service.status === "verified") {
      if (identifier !== "youtoola.com") issues.push(`${issue}-property`);
      if (key === "searchConsole") {
        if (service.propertyType !== "domain") issues.push("search-console-property-type");
        if (service.verificationMethod !== "dns-txt") issues.push("search-console-verification-method");
      } else if (service.verificationMethod !== "imported-from-google-search-console") {
        issues.push("bing-verification-method");
      }
      validateUrlInspections(service.urlInspections, issue, issues);
    }
  }

  const rawSitemap = record.sitemapSubmission;
  const sitemapAccepted = isRecord(rawSitemap) && rawSitemap.status === "accepted";
  const sitemap = expectRecord(
    rawSitemap,
    sitemapAccepted ? ["bing", "google", "status", "url"] : ["status", "url"],
    "activation-sitemap-fields",
    issues,
  );
  if (sitemap) {
    if (!["accepted", "error", "not-submitted", "submitted"].includes(sitemap.status as string)) issues.push("activation-sitemap-status");
    if (sitemap.url !== "https://www.youtoola.com/sitemap.xml") issues.push("activation-sitemap-url");
    if (sitemap.status === "accepted") {
      for (const provider of ["google", "bing"] as const) {
        const providerEvidence = expectRecord(
          sitemap[provider],
          ["discoveredUrls", "processingStatus", "status"],
          `activation-sitemap-${provider}-fields`,
          issues,
        );
        if (!providerEvidence) continue;
        if (providerEvidence.status !== "submitted") issues.push(`activation-sitemap-${provider}-status`);
        if (providerEvidence.processingStatus !== "successfully-processed") issues.push(`activation-sitemap-${provider}-processing`);
        if (providerEvidence.discoveredUrls !== 5) issues.push(`activation-sitemap-${provider}-urls`);
      }
    }
  }

  for (const key of ["dashboard", "monitoring"] as const) {
    const expectedKeys = key === "monitoring" ? ["owner", "schedule", "status"] : ["owner", "status"];
    const item = expectRecord(record[key], expectedKeys, `${key}-activation-fields`, issues);
    if (!item) continue;
    if (item.owner !== "Youtoola owner") issues.push(`${key}-activation-owner`);
    if (!["definition-only", "operational"].includes(item.status as string)) issues.push(`${key}-activation-status`);
    if (key === "monitoring" && item.schedule !== "0 7 * * 1") issues.push("monitoring-activation-schedule");
  }

  const evidence = expectRecord(
    record.evidence,
    ["externalConfiguration", "immediateReview", "previewProviderFree", "productionActivation", "twentyFourHourReview"],
    "activation-evidence-fields",
    issues,
  );
  if (evidence && Object.values(evidence).some((value) => value !== "pending" && value !== "complete")) {
    issues.push("activation-evidence-status");
  }

  const state = record.activationState;
  const legalReady = legal?.status === "approved" && contact?.status === "operational";
  const externalReady = analytics?.status === "configured" || analytics?.status === "verified";
  const servicesReady =
    ["configured", "verified"].includes((record.searchConsole as Record<string, unknown> | undefined)?.status as string) &&
    ["configured", "verified"].includes((record.bing as Record<string, unknown> | undefined)?.status as string) &&
    ["submitted", "accepted"].includes(sitemap?.status as string);
  if (["legally-approved", "externally-configured", "activation-ready", "active"].includes(state as string) && !legalReady) {
    issues.push("activation-transition:legal");
  }
  if (["externally-configured", "activation-ready", "active"].includes(state as string) &&
    (!externalReady || !servicesReady || evidence?.externalConfiguration !== "complete")) {
    issues.push("activation-transition:external");
  }
  if (["activation-ready", "active"].includes(state as string) &&
    (analytics?.productionVariables !== "configured" || evidence?.previewProviderFree !== "complete")) {
    issues.push("activation-transition:ready");
  }
  if (state === "active" &&
    (analytics?.status !== "verified" || sitemap?.status !== "accepted" ||
      evidence?.productionActivation !== "complete" || evidence?.immediateReview !== "complete" ||
      evidence?.twentyFourHourReview !== "complete")) {
    issues.push("activation-transition:active");
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
