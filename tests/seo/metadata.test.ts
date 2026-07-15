import { describe, expect, it } from "vitest";

import { PLATFORM_PAGE_DEFINITIONS, PLATFORM_SEO } from "@/data/seo/platform";
import { TRUST_PAGE_DEFINITIONS } from "@/data/seo/trust-pages";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  getMetadataAdvisories,
  validateIndexablePageDefinitions,
  validateUtilitySeoDefinitions,
} from "@/lib/seo/validation";
import { tools } from "@/data/registry/tools";

describe("SEO metadata contracts", () => {
  it("uses the approved homepage metadata and frozen social image", () => {
    const metadata = createPageMetadata(
      {
        canonicalPath: "/",
        description: PLATFORM_SEO.conciseDescription,
        title: PLATFORM_SEO.homeTitle,
      },
      { absoluteTitle: true },
    );

    expect(metadata.title).toEqual({ absolute: PLATFORM_SEO.homeTitle });
    expect(metadata.description).toBe(PLATFORM_SEO.conciseDescription);
    expect(metadata.alternates).toEqual({ canonical: "https://www.youtoola.com" });
    expect(metadata.openGraph).toMatchObject({
      description: PLATFORM_SEO.conciseDescription,
      locale: "en",
      siteName: "Youtoola",
      title: PLATFORM_SEO.homeTitle,
      type: "website",
      url: "https://www.youtoola.com",
    });
    expect(metadata.openGraph).toHaveProperty("images", [{
      alt: "Youtoola — Useful tools. No account. No nonsense.",
      height: 630,
      type: "image/png",
      url: "https://www.youtoola.com/brand/og-default.png",
      width: 1200,
    }]);
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["https://www.youtoola.com/brand/og-default.png"],
    });
  });

  it("requires unique, complete trust-page metadata", () => {
    expect(validateIndexablePageDefinitions()).toEqual([]);
    expect(new Set(TRUST_PAGE_DEFINITIONS.map((page) => page.title)).size).toBe(3);
    expect(new Set(TRUST_PAGE_DEFINITIONS.map((page) => page.description)).size).toBe(3);
    expect(new Set(TRUST_PAGE_DEFINITIONS.map((page) => page.canonicalPath)).size).toBe(3);
  });

  it("rejects a trust page that collides with a permanent platform page", () => {
    expect(
      validateIndexablePageDefinitions([
        PLATFORM_PAGE_DEFINITIONS.tools,
        {
          ...TRUST_PAGE_DEFINITIONS[0],
          canonicalPath: "/tools",
        },
      ]),
    ).toContain("Duplicate canonical URL: https://www.youtoola.com/tools.");
  });

  it("reports length guidance as advisory rather than publication failure", () => {
    const advisories = TRUST_PAGE_DEFINITIONS.flatMap(getMetadataAdvisories);
    expect(Array.isArray(advisories)).toBe(true);
    expect(validateIndexablePageDefinitions()).toEqual([]);
  });

  it("does not create utility SEO records and rejects an unreleased record", () => {
    expect(validateUtilitySeoDefinitions([], tools)).toEqual([]);
    expect(
      validateUtilitySeoDefinitions(
        [
          {
            conciseUserProblem: "Internal test only",
            description: "Internal test description",
            indexable: true,
            methodologyVersion: 1,
            primaryIntent: "internal test",
            reviewedDate: "2026-07-14",
            sitemapEligible: true,
            socialDescription: "Internal test description",
            socialTitle: "Internal test",
            title: "Internal test",
            utilityId: "fuel-trip-calculator",
          },
        ],
        tools,
      ),
    ).toContain("Utility SEO definition fuel-trip-calculator is not released.");
  });
});
