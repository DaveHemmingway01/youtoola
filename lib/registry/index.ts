import { categories } from "@/data/registry/categories";
import { journeys } from "@/data/registry/journeys";
import { tools } from "@/data/registry/tools";
import { utilityRelationships } from "@/data/relationships/utility-relationships";
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
  const targetEntityIds = new Set(
    utilityRelationships
      .filter(
        (relationship) =>
          relationship.type === "related" &&
          (relationship.sourceEntityId === tool.entityId ||
            relationship.targetEntityId === tool.entityId),
      )
      .map((relationship) =>
        relationship.sourceEntityId === tool.entityId
          ? relationship.targetEntityId
          : relationship.sourceEntityId,
      ),
  );
  return tools.filter(
    (candidate) =>
      targetEntityIds.has(candidate.entityId) && (!releasedOnly || candidate.status === "released"),
  );
}

export function getReleasedTools() {
  return tools.filter((tool) => tool.status === "released");
}

export const registry = { tools, categories, journeys } as const;
