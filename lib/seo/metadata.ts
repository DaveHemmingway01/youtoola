import type { Metadata } from "next";

import { PLATFORM_SEO } from "@/data/seo/platform";
import type { IndexablePageDefinition } from "@/lib/seo/types";

import { createCanonicalUrl } from "./canonical";

interface MetadataOptions {
  absoluteTitle?: boolean;
}

export function createPageMetadata(
  definition: Pick<IndexablePageDefinition, "canonicalPath" | "description" | "title">,
  { absoluteTitle = false }: MetadataOptions = {},
): Metadata {
  const canonical = createCanonicalUrl(definition.canonicalPath);
  const socialTitle = absoluteTitle
    ? definition.title
    : `${definition.title} | ${PLATFORM_SEO.siteName}`;

  return {
    title: absoluteTitle ? { absolute: definition.title } : definition.title,
    description: definition.description,
    alternates: { canonical },
    openGraph: {
      description: definition.description,
      locale: PLATFORM_SEO.locale,
      siteName: PLATFORM_SEO.siteName,
      title: socialTitle,
      type: "website",
      url: canonical,
    },
    twitter: {
      card: "summary",
      description: definition.description,
      title: socialTitle,
    },
  };
}
