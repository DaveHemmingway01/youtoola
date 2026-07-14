import type { MetadataRoute } from "next";

import { getPublicDiscoveryUrls } from "@/lib/discovery";

export default function sitemap(): MetadataRoute.Sitemap {
  return getPublicDiscoveryUrls().map((url) => ({ url }));
}
