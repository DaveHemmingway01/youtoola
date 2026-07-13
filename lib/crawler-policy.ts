import type { MetadataRoute } from "next";

import {
  CANONICAL_ORIGIN,
  type RuntimeEnvironment,
} from "./environment";

const productionSitemap = `${CANONICAL_ORIGIN}/sitemap.xml`;

export function createCrawlerPolicy(
  environment: RuntimeEnvironment,
): MetadataRoute.Robots {
  if (environment !== "production") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
    ],
    sitemap: productionSitemap,
  };
}
