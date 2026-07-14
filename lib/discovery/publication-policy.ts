import type { CategoryRecord, UtilityRegistryEntry } from "@/lib/registry/types";
import type { JourneyEntity } from "@/lib/knowledge/types";
import { CANONICAL_ORIGIN } from "@/lib/environment";

export const PUBLICATION_THRESHOLDS = Object.freeze({
  categoryUtilityCount: 2,
  featuredUtilityCount: 3,
  journeyStageCount: 2,
  journeyUtilityCount: 2,
  latestUtilityCount: 2,
  popularUtilityCount: 3,
  searchUtilityCount: 3,
});

export const PUBLIC_DISCOVERY_ROUTES = Object.freeze({
  home: "/",
  tools: "/tools",
});

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface ApprovedCategoryContent {
  categoryId: string;
  introduction: string;
  ownerApproved: true;
}

export interface ApprovedJourneyContent {
  guidance: string;
  journeyId: string;
  ownerApproved: true;
}

function hasValidDate(value: string | undefined) {
  if (!value || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

export function utilityMeetsDiscoveryPolicy(
  tool: UtilityRegistryEntry,
  activeCategoryIds: ReadonlySet<string>,
) {
  return (
    tool.status === "released" &&
    SLUG_PATTERN.test(tool.slug) &&
    tool.canonicalUrl === `${CANONICAL_ORIGIN}/${tool.slug}` &&
    hasValidDate(tool.releaseDate) &&
    Boolean(tool.description?.trim()) &&
    activeCategoryIds.has(tool.categoryId)
  );
}

export function categoryMeetsPublicationPolicy(
  category: CategoryRecord,
  tools: readonly UtilityRegistryEntry[],
  content: ApprovedCategoryContent | undefined,
) {
  return (
    category.status === "active" &&
    SLUG_PATTERN.test(category.id) &&
    Boolean(category.userIntent.trim()) &&
    Boolean(content?.ownerApproved && content.introduction.trim()) &&
    tools.filter((tool) => tool.categoryId === category.id).length >=
      PUBLICATION_THRESHOLDS.categoryUtilityCount
  );
}

export function journeyMeetsPublicationPolicy(
  journey: JourneyEntity,
  releasedToolEntityIds: ReadonlySet<string>,
  content: ApprovedJourneyContent | undefined,
) {
  const utilityIds = new Set(
    journey.stages.flatMap((stage) => stage.utilityEntityIds),
  );
  const occupiedStages = journey.stages.filter((stage) =>
    stage.utilityEntityIds.some((utilityId) => releasedToolEntityIds.has(utilityId)),
  );

  return (
    journey.status === "active" &&
    journey.active &&
    journey.visibility === "public" &&
    SLUG_PATTERN.test(journey.id) &&
    Boolean(journey.objective.trim()) &&
    Boolean(journey.targetAudience.trim()) &&
    Boolean(content?.ownerApproved && content.guidance.trim()) &&
    utilityIds.size >= PUBLICATION_THRESHOLDS.journeyUtilityCount &&
    [...utilityIds].every((utilityId) => releasedToolEntityIds.has(utilityId)) &&
    occupiedStages.length >= PUBLICATION_THRESHOLDS.journeyStageCount &&
    journey.stages.every((stage) => stage.futureSlots.length === 0)
  );
}
