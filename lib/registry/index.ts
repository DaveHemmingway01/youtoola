import { categories } from "@/data/registry/categories";
import { journeys } from "@/data/registry/journeys";
import { tools } from "@/data/registry/tools";
import type { UtilityRegistryEntry } from "./types";

export function getAllTools(): readonly UtilityRegistryEntry[] {
  return tools;
}

export function getToolById(utilityId: string) {
  return tools.find((tool) => tool.utilityId === utilityId);
}

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(categoryId: string) {
  return tools.filter((tool) => tool.categoryId === categoryId);
}

export function getRelatedTools(utilityId: string, releasedOnly = false) {
  const tool = getToolById(utilityId);
  if (!tool) return [];
  const targetIds = new Set(tool.relationships.map((relationship) => relationship.targetUtilityId));
  return tools.filter(
    (candidate) =>
      targetIds.has(candidate.utilityId) && (!releasedOnly || candidate.status === "released"),
  );
}

export function getReleasedTools() {
  return tools.filter((tool) => tool.status === "released");
}

export const registry = { tools, categories, journeys } as const;
