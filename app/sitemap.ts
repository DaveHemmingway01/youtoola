import type { MetadataRoute } from "next";

import { CANONICAL_ORIGIN } from "@/lib/environment";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: CANONICAL_ORIGIN }];
}
