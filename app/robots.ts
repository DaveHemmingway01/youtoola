import type { MetadataRoute } from "next";

import { createCrawlerPolicy } from "@/lib/crawler-policy";
import { resolveRuntimeEnvironment } from "@/lib/environment";

export default function robots(): MetadataRoute.Robots {
  return createCrawlerPolicy(resolveRuntimeEnvironment());
}
