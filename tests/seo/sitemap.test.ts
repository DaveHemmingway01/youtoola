import { describe, expect, it } from "vitest";

import { createPublicSitemap, getPublicSitemapUrls } from "@/lib/seo/sitemap";

const approvedUrls = [
  "https://www.youtoola.com",
  "https://www.youtoola.com/tools",
  "https://www.youtoola.com/about",
  "https://www.youtoola.com/methodology",
  "https://www.youtoola.com/privacy",
];

describe("SEO sitemap composition", () => {
  it("contains exactly the approved public URLs", () => {
    expect(getPublicSitemapUrls()).toEqual(approvedUrls);
    expect(createPublicSitemap()).toEqual(approvedUrls.map((url) => ({ url })));
  });

  it("omits speculative metadata and private routes", () => {
    const serialized = JSON.stringify(createPublicSitemap());
    for (const value of [
      "accessibility",
      "contact",
      "editorial-policy",
      "fuel-trip-calculator",
      "categories/",
      "journeys/",
      "search",
      "design-system-review",
      "lastModified",
      "changeFrequency",
      "priority",
    ]) {
      expect(serialized).not.toContain(value);
    }
  });
});
