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

export type GrowthActivationState =
  | "dormant"
  | "legally-approved"
  | "externally-configured"
  | "activation-ready"
  | "active"
  | "disabled"
  | "incident-disabled";

type PendingOrComplete = "complete" | "pending";
type ExternalServiceStatus = "configured" | "error" | "not-configured" | "verified";
type PublicUrlInspection = Readonly<{
  indexStatus: "pending";
  indexingRequest: "submitted-where-needed";
  liveTest: "passed";
  technicallyIndexable: true;
  url: string;
}>;

export interface GrowthActivationRecord {
  activationState: GrowthActivationState;
  analytics: Readonly<{
    customDimensions: readonly string[];
    keyEvents: readonly ["tool_complete"];
    measurementIdStatus: "configured" | "not-configured";
    productionVariables: "configured" | "not-configured";
    provider: "Google Analytics 4";
    retentionMonths: 2;
    sanitizedPageView: "approved" | "build-ready" | "verified";
    settings: Readonly<{
      advertisingFeatures: false;
      automaticPageViews: false;
      crossDomainMeasurement: false;
      enhancedMeasurement: false;
      googleSignals: false;
      measurementProtocol: false;
      userId: false;
    }>;
    status: "configured" | "disabled" | "not-configured" | "verified";
  }>;
  bing: Readonly<{
    site: string | null;
    status: ExternalServiceStatus;
    urlInspections?: readonly PublicUrlInspection[];
    verificationMethod?: "imported-from-google-search-console";
  }>;
  dashboard: Readonly<{
    owner: "Youtoola owner";
    status: "definition-only" | "operational";
  }>;
  evidence: Readonly<{
    externalConfiguration: PendingOrComplete;
    immediateReview: PendingOrComplete;
    previewProviderFree: PendingOrComplete;
    productionActivation: PendingOrComplete;
    twentyFourHourReview: PendingOrComplete;
  }>;
  legalPrivacy: Readonly<{
    approvalReference: string | null;
    jurisdictions: readonly string[];
    status: "approved" | "pending";
  }>;
  monitoring: Readonly<{
    owner: "Youtoola owner";
    schedule: "0 7 * * 1";
    status: "definition-only" | "operational";
  }>;
  owner: "Youtoola owner";
  privacyContact: Readonly<{
    address: string | null;
    status: "operational" | "pending";
  }>;
  recordVersion: 1;
  reviewedDate: string;
  searchConsole: Readonly<{
    property: string | null;
    propertyType?: "domain";
    status: ExternalServiceStatus;
    urlInspections?: readonly PublicUrlInspection[];
    verificationMethod?: "dns-txt";
  }>;
  sitemapSubmission: Readonly<{
    bing?: Readonly<{
      discoveredUrls: 5;
      processingStatus: "successfully-processed";
      status: "submitted";
    }>;
    google?: Readonly<{
      discoveredUrls: 5;
      processingStatus: "successfully-processed";
      status: "submitted";
    }>;
    status: "accepted" | "error" | "not-submitted" | "submitted";
    url: "https://www.youtoola.com/sitemap.xml";
  }>;
}
