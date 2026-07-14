import type { MetadataRoute } from "next";

import { createPublicSitemap } from "@/lib/seo/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  return createPublicSitemap();
}
