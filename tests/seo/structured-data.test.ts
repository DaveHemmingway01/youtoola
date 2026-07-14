import { describe, expect, it } from "vitest";

import { PLATFORM_SEO } from "@/data/seo/platform";
import {
  createBreadcrumbItems,
  createBreadcrumbStructuredData,
  createHomeStructuredData,
  serializeJsonLd,
} from "@/lib/seo/structured-data";

describe("structured data", () => {
  it("emits only approved Organization and WebSite facts", () => {
    const data = createHomeStructuredData();
    const serialized = serializeJsonLd(data);
    const parsed = JSON.parse(serialized);
    const [organization, website] = parsed["@graph"];

    expect(organization).toEqual({
      "@id": "https://www.youtoola.com/#organization",
      "@type": "Organization",
      description: PLATFORM_SEO.conciseDescription,
      logo: {
        "@type": "ImageObject",
        contentUrl: "https://www.youtoola.com/brand/youtoola-logo.png",
        height: 819,
        url: "https://www.youtoola.com/brand/youtoola-logo.png",
        width: 3000,
      },
      name: "Youtoola",
      url: "https://www.youtoola.com",
    });
    expect(website).toMatchObject({
      "@id": "https://www.youtoola.com/#website",
      "@type": "WebSite",
      inLanguage: "en",
      publisher: { "@id": "https://www.youtoola.com/#organization" },
    });

    for (const prohibited of [
      "address",
      "aggregateRating",
      "email",
      "employee",
      "founder",
      "legalName",
      "offers",
      "price",
      "review",
      "sameAs",
      "telephone",
    ]) {
      expect(serialized).not.toContain(`\"${prohibited}\"`);
    }
    expect(serialized).not.toContain("SearchAction");
  });

  it("creates structured breadcrumbs from the same visible items", () => {
    const items = createBreadcrumbItems("Tools", "/tools");
    const data = createBreadcrumbStructuredData(items);
    expect(data).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { item: "https://www.youtoola.com", name: "Home", position: 1 },
        { item: "https://www.youtoola.com/tools", name: "Tools", position: 2 },
      ],
    });
  });

  it("escapes script-breaking characters deterministically", () => {
    const serialized = serializeJsonLd({ value: "</script><script>alert(1)</script>" });
    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c/script>");
    expect(JSON.parse(serialized).value).toBe("</script><script>alert(1)</script>");
  });
});
