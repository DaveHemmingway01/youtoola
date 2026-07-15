export const DELIVERY_SCHEMA_VERSION = 1 as const;
export const DELIVERY_CANONICAL_ORIGIN = "https://www.youtoola.com";

type DeliveryRuntimeEnvironment = "local" | "preview" | "production";

export const APPROVED_BRANCH_FAMILIES = [
  "platform",
  "utility",
  "docs",
  "hotfix",
] as const;

export const REQUIRED_CHECKS = ["Quality", "End-to-end", "Vercel"] as const;
export const INFORMATIONAL_CHECKS = ["Vercel Preview Comments"] as const;

export const APPROVED_PRODUCTION_ORIGINS = Object.freeze([
  DELIVERY_CANONICAL_ORIGIN,
  "https://youtoola.com",
]);

export const EXPECTED_PUBLIC_PATHS = Object.freeze([
  "/",
  "/tools",
  "/about",
  "/methodology",
  "/privacy",
]);

export const EXPECTED_UNAVAILABLE_PATHS = Object.freeze([
  "/fuel-trip-calculator",
  "/design-system-review",
]);

export const EXPECTED_SITEMAP_URLS = Object.freeze(
  EXPECTED_PUBLIC_PATHS.map((path) =>
    path === "/"
      ? DELIVERY_CANONICAL_ORIGIN
      : `${DELIVERY_CANONICAL_ORIGIN}${path}`,
  ),
);

export const EXPECTED_SECURITY_HEADERS = Object.freeze({
  "permissions-policy": "camera=(), geolocation=(), microphone=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
});

export const FROZEN_BRAND_HASHES = Object.freeze({
  "/brand/apple-touch-icon.png":
    "b35a8289133f77051383eaabaead44b5900f17f2c7db2a5e35d48fb930e8f56a",
  "/brand/favicon-16x16.png":
    "df7ed4cc45542d7ee90ac1ae2e7bef4a3f333561778858e527206b929c657d2e",
  "/brand/favicon-32x32.png":
    "ab5fe330d3c3a5706ede6192603918bfa3e6145646340d691502ce8ad79a39f3",
  "/brand/favicon-48x48.png":
    "60312cc13c13225738614924a29fbf064c4e7e1589abe98f0659fd628b911c12",
  "/brand/favicon-64x64.png":
    "747ce1971551489a6fc9cf06ed111613e69d9c4e0abe00ff945636311924fd20",
  "/brand/favicon.ico":
    "81a006e16159b950c3172b31fd33306945d5b8ae113516a28b7c00db937c3b01",
  "/brand/icon-192.png":
    "730e8b61a33ed09ec469d96f3d8a5447ac1b513c63ef2921328326ef5a1e3ba5",
  "/brand/icon-512.png":
    "05fe32cf751b617f7b9e88781c3e07bf36a37083312f9c5e2279c173ccaedb63",
  "/brand/youtoola-logo-1500.png":
    "45bd10d72acbc15eb7116fbb2916febe001c8c26634edfe6fe47865675885d32",
  "/brand/youtoola-logo-750.png":
    "15faa5d0f2df34d92b703acd7cbf55dd75719f7b3f0772c94ee2e4e95e26698e",
  "/brand/youtoola-logo.png":
    "d2e096a9c186027ecdc576281b7b5c71488dda007f37c122172e471bbd749a05",
  "/brand/youtoola-symbol-1024.png":
    "f928cdaa5223ee2c52aee1f03c594c22cc1f5b48c8a6879a118fd43f3a3bf2b2",
  "/brand/youtoola-symbol-512.png":
    "fa10ce95ca2847c51c381b55262f8e5517570729e4a2542f475e0090f51730ca",
  "/brand/youtoola-symbol.png":
    "c240dd3396a4d9c766b1d772e5bc4b6d148a89a337b88b8ca69b12daab9e326c",
});

export const FOLLOW_UP_PERIODS = [
  "immediate",
  "24-hour",
  "7-day",
  "28-day",
  "monthly",
  "quarterly",
] as const;

export const RELEASE_KINDS = [
  "normal",
  "documentation-only",
  "hotfix",
] as const;

export const ENVIRONMENT_POLICIES: Readonly<
  Record<
    DeliveryRuntimeEnvironment,
    {
      indexing: boolean;
      productionProviders: boolean;
      reviewRoutes: boolean;
    }
  >
> = {
  local: {
    indexing: false,
    productionProviders: false,
    reviewRoutes: true,
  },
  preview: {
    indexing: false,
    productionProviders: false,
    reviewRoutes: true,
  },
  production: {
    indexing: true,
    productionProviders: true,
    reviewRoutes: false,
  },
};

export type ApprovedBranchFamily = (typeof APPROVED_BRANCH_FAMILIES)[number];
export type FollowUpPeriod = (typeof FOLLOW_UP_PERIODS)[number];
export type ReleaseKind = (typeof RELEASE_KINDS)[number];

export type EnvironmentVariableClassification =
  | "browser-safe-public"
  | "secret"
  | "server-only"
  | "unapproved";

export function classifyEnvironmentVariable(
  name: string,
): EnvironmentVariableClassification {
  if (!/^[A-Z][A-Z0-9_]*$/.test(name)) return "unapproved";

  const secret = /(?:^|_)(?:SECRET|TOKEN|KEY)$/.test(name);
  if (name.startsWith("NEXT_PUBLIC_")) {
    if (secret || !name.startsWith("NEXT_PUBLIC_YOUTOOLA_")) {
      return "unapproved";
    }
    return "browser-safe-public";
  }

  if (secret) return "secret";
  if (name.startsWith("YOUTOOLA_")) return "server-only";
  return "unapproved";
}
