import type { Metadata } from "next";

import { PLATFORM_SEO } from "@/data/seo/platform";
import type { IndexablePageDefinition } from "@/lib/seo/types";

import { createCanonicalUrl } from "./canonical";

export const DEFAULT_SOCIAL_IMAGE = Object.freeze({
  alt: "Youtoola — Useful tools. No account. No nonsense.",
  height: 630,
  type: "image/png",
  url: "https://www.youtoola.com/brand/og-default.png",
  width: 1200,
} as const);

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
      images: [DEFAULT_SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      description: definition.description,
      images: [DEFAULT_SOCIAL_IMAGE.url],
      title: socialTitle,
    },
  };
}
