import type { MetadataRoute } from "next";

import { TRUST_PAGE_DEFINITIONS } from "@/data/seo/trust-pages";
import { getPublicDiscoveryUrls } from "@/lib/discovery";

import { assertCanonicalUrl, createCanonicalUrl } from "./canonical";

export function assertUniqueSitemapUrls(urls: readonly string[]) {
  const seen = new Set<string>();

  for (const url of urls) {
    assertCanonicalUrl(url);
    if (seen.has(url)) throw new Error(`Duplicate sitemap URL: ${url}.`);
    seen.add(url);
  }
}

export function getPublicSitemapUrls() {
  const urls = [
    ...getPublicDiscoveryUrls(),
    ...TRUST_PAGE_DEFINITIONS.map((page) => createCanonicalUrl(page.canonicalPath)),
  ];
  assertUniqueSitemapUrls(urls);
  return Object.freeze(urls);
}

export function createPublicSitemap(): MetadataRoute.Sitemap {
  return getPublicSitemapUrls().map((url) => ({ url }));
}
