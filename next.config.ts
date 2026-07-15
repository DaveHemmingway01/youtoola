import type { NextConfig } from "next";

import { getDesignSystemReviewRewrites } from "./lib/design-system-review";
import { isIndexingAllowed } from "./lib/environment";
import { createReportOnlyContentSecurityPolicy } from "./lib/security/content-security-policy";

const indexingAllowed = isIndexingAllowed();

const securityHeaders = [
  {
    key: "Content-Security-Policy-Report-Only",
    value: createReportOnlyContentSecurityPolicy(),
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=()",
  },
  ...(!indexingAllowed
    ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: getDesignSystemReviewRewrites(),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
