export interface PlatformSeoDefinition {
  applicationName: "Youtoola";
  conciseDescription: string;
  extendedDescription: string;
  homeTitle: string;
  language: "en";
  locale: "en";
  organizationId: `${string}#organization`;
  organizationLogo: Readonly<{
    height: number;
    type: "image/png";
    url: `https://${string}`;
    width: number;
  }>;
  siteName: "Youtoola";
  titleTemplate: "%s | Youtoola";
  websiteId: `${string}#website`;
}

export interface IndexablePageDefinition {
  canonicalPath: `/${string}` | "/";
  description: string;
  owner: "Youtoola owner";
  reviewedDate: `${number}-${number}-${number}`;
  title: string;
}

export interface TrustPageDefinition extends IndexablePageDefinition {
  breadcrumbLabel: string;
  key: "about" | "methodology" | "privacy";
}

export interface UtilitySeoDefinition {
  canonicalPath: `/${string}`;
  conciseUserProblem: string;
  description: string;
  indexable: boolean;
  methodologyVersion: number;
  primaryIntent: string;
  reviewedDate: `${number}-${number}-${number}`;
  sitemapEligible: boolean;
  socialDescription: string;
  socialImage?: `https://${string}`;
  socialTitle: string;
  title: string;
  utilityId: string;
}

export interface SeoBreadcrumbItem {
  href: `/${string}` | "/";
  label: string;
}

export type JsonPrimitive = boolean | null | number | string;
export type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };
export type JsonLdObject = Readonly<Record<string, JsonValue>>;
