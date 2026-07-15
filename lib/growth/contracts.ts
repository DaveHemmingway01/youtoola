export interface GrowthFoundationRecord {
  analytics: Readonly<{
    activation: "disabled";
    displayName: "Google Analytics 4";
    identifierStatus: "not-configured";
    legalPrivacyApproval: "pending";
    recommendedKeyEvents: readonly ["tool_complete"];
  }>;
  bing: Readonly<{ owner: "Youtoola owner"; status: "not-configured" }>;
  consent: Readonly<{
    activeChoices: readonly ["denied", "analytics-granted"];
    cookieMaxAgeSeconds: 15552000;
    marketingStatus: "reserved-unavailable-denied";
    policyVersion: "v1";
  }>;
  dashboard: Readonly<{
    owner: "Youtoola owner";
    status: "definition-only";
    zeroDenominator: "not-available";
  }>;
  features: Readonly<{
    advertising: false;
    analytics: false;
    clarity: false;
    experiments: false;
    leads: false;
    premium: false;
  }>;
  monitoring: Readonly<{
    owner: "Youtoola owner";
    schedule: "0 7 * * 1";
    status: "definition-only";
  }>;
  owner: "Youtoola owner";
  recordVersion: 1;
  reviewedDate: string;
  searchConsole: Readonly<{ owner: "Youtoola owner"; status: "not-configured" }>;
  sitemapSubmission: Readonly<{ status: "not-submitted" }>;
}

export interface DashboardMetricDefinition {
  denominator: string | null;
  id: string;
  numerator: string;
  source: "Bing Webmaster Tools" | "GA4" | "Google Search Console" | "Repository" | "Vercel";
}

export interface GrowthMonitoringDefinition {
  checks: readonly string[];
  owner: "Youtoola owner";
  schedule: "0 7 * * 1";
  status: "definition-only";
}
