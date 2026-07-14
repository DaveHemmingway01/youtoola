import type { MetadataRoute } from "next";

import { TRUST_PAGE_DEFINITIONS } from "@/data/seo/trust-pages";
import { getPublicDiscoveryUrls } from "@/lib/discovery";

import { createCanonicalUrl } from "./canonical";

export function getPublicSitemapUrls() {
  return Object.freeze([
    ...new Set([
      ...getPublicDiscoveryUrls(),
      ...TRUST_PAGE_DEFINITIONS.map((page) => createCanonicalUrl(page.canonicalPath)),
    ]),
  ]);
}

export function createPublicSitemap(): MetadataRoute.Sitemap {
  return getPublicSitemapUrls().map((url) => ({ url }));
}
