import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { RESERVED_ROOT_SLUGS } from "./reserved-routes";
import type {
  CategoryRecord,
  JourneyRecord,
  UtilityRegistryEntry,
} from "./types";

const CANONICAL_ORIGIN = "https://www.youtoola.com";
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface RegistryData {
  tools: readonly UtilityRegistryEntry[];
  categories: readonly CategoryRecord[];
  journeys: readonly JourneyRecord[];
}

function duplicateValues(values: readonly string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return [...duplicates];
}

function isSorted(values: readonly string[]) {
  return values.every((value, index) => index === 0 || values[index - 1].localeCompare(value) <= 0);
}

export function validateRegistry(
  registry: RegistryData,
  repositoryRoot = process.cwd(),
) {
  const errors: string[] = [];
  const utilityIds = registry.tools.map((tool) => tool.utilityId);
  const entityIds = registry.tools.map((tool) => tool.entityId);
  const slugs = registry.tools.map((tool) => tool.slug);
  const categoryIds = registry.categories.map((category) => category.id);
  const journeyIds = registry.journeys.map((journey) => journey.id);

  for (const [label, values] of [
    ["utility ID", utilityIds],
    ["entity ID", entityIds],
    ["slug", slugs],
    ["category ID", categoryIds],
    ["journey ID", journeyIds],
  ] as const) {
    duplicateValues(values).forEach((value) => errors.push(`Duplicate ${label}: ${value}.`));
  }

  if (!isSorted(utilityIds)) errors.push("Tools must be ordered by utilityId.");
  if (!isSorted(categoryIds)) errors.push("Categories must be ordered by category ID.");
  if (!isSorted(journeyIds)) errors.push("Journeys must be ordered by journey ID.");

  const categoryIdSet = new Set(categoryIds);

  for (const tool of registry.tools) {
    if (!SLUG_PATTERN.test(tool.slug)) errors.push(`Invalid slug: ${tool.slug}.`);
    if (RESERVED_ROOT_SLUGS.has(tool.slug)) errors.push(`Reserved route collision: ${tool.slug}.`);
    if (tool.canonicalUrl !== `${CANONICAL_ORIGIN}/${tool.slug}`) {
      errors.push(`Canonical URL does not match approved host and slug for ${tool.utilityId}.`);
    }
    if (!categoryIdSet.has(tool.categoryId)) {
      errors.push(`Unknown category ${tool.categoryId} for ${tool.utilityId}.`);
    }
    if (!Number.isSafeInteger(tool.source.visibleRow) || tool.source.visibleRow < 1) {
      errors.push(`Invalid source visible row for ${tool.utilityId}.`);
    }
    if (!tool.source.spreadsheetId || !tool.source.tabName || !tool.source.sourceUtilityId) {
      errors.push(`Incomplete source coordinates for ${tool.utilityId}.`);
    }
    if (!HASH_PATTERN.test(tool.source.contentHash)) {
      errors.push(`Invalid source hash for ${tool.utilityId}.`);
    }
    if (!DATE_PATTERN.test(tool.source.reviewedDate)) {
      errors.push(`Invalid source reviewed date for ${tool.utilityId}.`);
    }
    if (tool.specificationPath && !existsSync(resolve(repositoryRoot, tool.specificationPath))) {
      errors.push(`Missing specification path for ${tool.utilityId}: ${tool.specificationPath}.`);
    }
    if (tool.status === "released") {
      if (!tool.releaseDate || !DATE_PATTERN.test(tool.releaseDate)) {
        errors.push(`Released tool ${tool.utilityId} requires a valid release date.`);
      }
      if (!tool.specificationPath) {
        errors.push(`Released tool ${tool.utilityId} requires a specification path.`);
      }
    } else if (tool.releaseDate) {
      errors.push(`Unreleased tool ${tool.utilityId} must not have a release date.`);
    }

  }

  return errors;
}

export function assertValidRegistry(registry: RegistryData, repositoryRoot = process.cwd()) {
  const errors = validateRegistry(registry, repositoryRoot);
  if (errors.length > 0) {
    throw new Error(`Registry validation failed:\n- ${errors.join("\n- ")}`);
  }
}
