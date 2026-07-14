import { PLATFORM_SEO } from "@/data/seo/platform";
import type { JsonLdObject, JsonValue, SeoBreadcrumbItem } from "@/lib/seo/types";

import { createCanonicalUrl } from "./canonical";

export function createHomeStructuredData(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": PLATFORM_SEO.organizationId,
        "@type": "Organization",
        description: PLATFORM_SEO.conciseDescription,
        logo: {
          "@type": "ImageObject",
          contentUrl: PLATFORM_SEO.organizationLogo.url,
          height: PLATFORM_SEO.organizationLogo.height,
          url: PLATFORM_SEO.organizationLogo.url,
          width: PLATFORM_SEO.organizationLogo.width,
        },
        name: PLATFORM_SEO.siteName,
        url: createCanonicalUrl("/"),
      },
      {
        "@id": PLATFORM_SEO.websiteId,
        "@type": "WebSite",
        description: PLATFORM_SEO.conciseDescription,
        inLanguage: PLATFORM_SEO.language,
        name: PLATFORM_SEO.siteName,
        publisher: { "@id": PLATFORM_SEO.organizationId },
        url: createCanonicalUrl("/"),
      },
    ],
  };
}

export function createBreadcrumbItems(
  label: string,
  path: `/${string}`,
): readonly SeoBreadcrumbItem[] {
  return Object.freeze([
    Object.freeze({ href: "/", label: "Home" }),
    Object.freeze({ href: path, label }),
  ]);
}

export function createBreadcrumbStructuredData(
  items: readonly SeoBreadcrumbItem[],
): JsonLdObject {
  if (items.length < 2) throw new Error("Structured breadcrumbs require at least two items.");

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: createCanonicalUrl(item.href),
      name: item.label,
      position: index + 1,
    })),
  };
}

export function serializeJsonLd(data: JsonValue) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
