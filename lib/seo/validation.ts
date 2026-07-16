import { PLATFORM_PAGE_DEFINITIONS } from "@/data/seo/platform";
import { TRUST_PAGE_DEFINITIONS } from "@/data/seo/trust-pages";
import type { UtilityRegistryEntry } from "@/lib/registry/types";
import type { IndexablePageDefinition, UtilitySeoDefinition } from "@/lib/seo/types";

import { assertCanonicalPath, createCanonicalUrl } from "./canonical";

export interface MetadataAdvisory {
  field: "description" | "title";
  message: string;
  path: string;
}

export function getMetadataAdvisories(
  definition: Pick<IndexablePageDefinition, "canonicalPath" | "description" | "title">,
) {
  const advisories: MetadataAdvisory[] = [];
  if (definition.title.length > 60) {
    advisories.push({
      field: "title",
      message: "Title may be truncated in some search presentations.",
      path: definition.canonicalPath,
    });
  }
  if (definition.description.length < 70 || definition.description.length > 170) {
    advisories.push({
      field: "description",
      message: "Description length warrants editorial review.",
      path: definition.canonicalPath,
    });
  }
  return advisories;
}

const INDEXABLE_PAGE_DEFINITIONS = Object.freeze([
  PLATFORM_PAGE_DEFINITIONS.home,
  PLATFORM_PAGE_DEFINITIONS.tools,
  ...TRUST_PAGE_DEFINITIONS,
]);

export function validateIndexablePageDefinitions(
  definitions: readonly IndexablePageDefinition[] = INDEXABLE_PAGE_DEFINITIONS,
) {
  const errors: string[] = [];
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const canonicals = new Set<string>();

  for (const page of definitions) {
    try {
      assertCanonicalPath(page.canonicalPath);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    const canonical = createCanonicalUrl(page.canonicalPath);
    if (titles.has(page.title)) errors.push(`Duplicate page title: ${page.title}.`);
    if (descriptions.has(page.description)) {
      errors.push(`Duplicate page description: ${page.description}.`);
    }
    if (canonicals.has(canonical)) errors.push(`Duplicate canonical URL: ${canonical}.`);
    if (!page.title.trim()) errors.push(`Missing title for ${page.canonicalPath}.`);
    if (!page.description.trim()) errors.push(`Missing description for ${page.canonicalPath}.`);

    titles.add(page.title);
    descriptions.add(page.description);
    canonicals.add(canonical);
  }

  return errors;
}

export function validateUtilitySeoDefinitions(
  definitions: readonly UtilitySeoDefinition[],
  registry: readonly UtilityRegistryEntry[],
) {
  const errors: string[] = [];
  const utilityIds = new Set<string>();

  for (const definition of definitions) {
    const tool = registry.find((entry) => entry.utilityId === definition.utilityId);
    if (!tool) errors.push(`Unknown utility SEO definition: ${definition.utilityId}.`);
    if (tool?.status !== "released") {
      errors.push(`Utility SEO definition ${definition.utilityId} is not released.`);
    }
    if (definition.indexable !== definition.sitemapEligible) {
      errors.push(`Utility SEO definition ${definition.utilityId} has conflicting indexability.`);
    }
    if (tool && definition.canonicalPath !== `/${tool.slug}`) {
      errors.push(`Utility SEO definition ${definition.utilityId} has a mismatched canonical path.`);
    }
    if (tool && definition.methodologyVersion !== tool.methodologyVersion) {
      errors.push(`Utility SEO definition ${definition.utilityId} has a mismatched methodology version.`);
    }
    if (utilityIds.has(definition.utilityId)) {
      errors.push(`Duplicate utility SEO definition: ${definition.utilityId}.`);
    }
    utilityIds.add(definition.utilityId);
  }

  return errors;
}
