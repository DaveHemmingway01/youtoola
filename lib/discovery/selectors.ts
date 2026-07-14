import type { CategoryRecord, UtilityRegistryEntry } from "@/lib/registry/types";
import type { JourneyEntity } from "@/lib/knowledge/types";
import {
  getEntityById,
  getPublicEligibleJourneys,
  getPublicEligibleUtilities,
} from "@/lib/knowledge";
import { CANONICAL_ORIGIN } from "@/lib/environment";

import {
  categoryMeetsPublicationPolicy,
  journeyMeetsPublicationPolicy,
  PUBLIC_DISCOVERY_ROUTES,
  PUBLICATION_THRESHOLDS,
  utilityMeetsDiscoveryPolicy,
  type ApprovedCategoryContent,
  type ApprovedJourneyContent,
} from "./publication-policy";

export interface PublicDiscoveryTool {
  canonicalUrl: string;
  categoryId: string;
  categoryName: string;
  description: string;
  name: string;
  releaseDate: string;
  slug: string;
  utilityId: string;
}

export interface PublicDiscoveryCategory {
  canonicalUrl: string;
  introduction: string;
  name: string;
  slug: string;
  tools: readonly PublicDiscoveryTool[];
  userIntent: string;
}

export interface PublicDiscoveryJourney {
  canonicalUrl: string;
  guidance: string;
  name: string;
  objective: string;
  slug: string;
  toolEntityIds: readonly string[];
}

export interface PublicDiscoveryModel {
  categories: readonly PublicDiscoveryCategory[];
  journeys: readonly PublicDiscoveryJourney[];
  tools: readonly PublicDiscoveryTool[];
  urls: readonly string[];
}

export interface DiscoveryModelInput {
  approvedCategoryContent?: readonly ApprovedCategoryContent[];
  approvedJourneyContent?: readonly ApprovedJourneyContent[];
  categories: readonly CategoryRecord[];
  journeys: readonly JourneyEntity[];
  tools: readonly UtilityRegistryEntry[];
}

const approvedCategoryContent: readonly ApprovedCategoryContent[] = [];
const approvedJourneyContent: readonly ApprovedJourneyContent[] = [];

function alphabeticallyByName<T extends { name: string }>(left: T, right: T) {
  return left.name.localeCompare(right.name, "en");
}

function freezeList<T>(items: T[]) {
  return Object.freeze(items);
}

export function buildPublicDiscoveryModel({
  approvedCategoryContent: categoryContent = [],
  approvedJourneyContent: journeyContent = [],
  categories,
  journeys,
  tools,
}: DiscoveryModelInput): PublicDiscoveryModel {
  const activeCategoryIds = new Set(
    categories
      .filter((category) => category.status === "active")
      .map((category) => category.id),
  );
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const eligibleTools = tools
    .filter((tool) => utilityMeetsDiscoveryPolicy(tool, activeCategoryIds))
    .toSorted(alphabeticallyByName);
  const publicTools = freezeList(
    eligibleTools.map((tool) =>
      Object.freeze({
        canonicalUrl: tool.canonicalUrl,
        categoryId: tool.categoryId,
        categoryName: categoryNames.get(tool.categoryId) ?? "",
        description: tool.description!,
        name: tool.name,
        releaseDate: tool.releaseDate!,
        slug: tool.slug,
        utilityId: tool.utilityId,
      }),
    ),
  );

  const publicCategories = freezeList(
    categories
      .filter((category) =>
        categoryMeetsPublicationPolicy(
          category,
          eligibleTools,
          categoryContent.find((content) => content.categoryId === category.id),
        ),
      )
      .toSorted((left, right) =>
        left.displayOrder - right.displayOrder || alphabeticallyByName(left, right),
      )
      .map((category) => {
        const content = categoryContent.find((item) => item.categoryId === category.id)!;
        return Object.freeze({
          canonicalUrl: `${CANONICAL_ORIGIN}/categories/${category.id}`,
          introduction: content.introduction,
          name: category.name,
          slug: category.id,
          tools: freezeList(publicTools.filter((tool) => tool.categoryId === category.id)),
          userIntent: category.userIntent,
        });
      }),
  );

  const releasedToolEntityIds = new Set(eligibleTools.map((tool) => tool.entityId));
  const publicJourneys = freezeList(
    journeys
      .filter((journey) =>
        journeyMeetsPublicationPolicy(
          journey,
          releasedToolEntityIds,
          journeyContent.find((content) => content.journeyId === journey.id),
        ),
      )
      .toSorted((left, right) =>
        left.displayOrder - right.displayOrder || alphabeticallyByName(left, right),
      )
      .map((journey) => {
        const content = journeyContent.find((item) => item.journeyId === journey.id)!;
        return Object.freeze({
          canonicalUrl: `${CANONICAL_ORIGIN}/journeys/${journey.id}`,
          guidance: content.guidance,
          name: journey.name,
          objective: journey.objective,
          slug: journey.id,
          toolEntityIds: freezeList([
            ...new Set(journey.stages.flatMap((stage) => stage.utilityEntityIds)),
          ]),
        });
      }),
  );

  const urls = freezeList([
    `${CANONICAL_ORIGIN}${PUBLIC_DISCOVERY_ROUTES.home}`.replace(/\/$/, ""),
    `${CANONICAL_ORIGIN}${PUBLIC_DISCOVERY_ROUTES.tools}`,
    ...publicTools.map((tool) => tool.canonicalUrl),
    ...publicCategories.map((category) => category.canonicalUrl),
    ...publicJourneys.map((journey) => journey.canonicalUrl),
  ]);

  return Object.freeze({
    categories: publicCategories,
    journeys: publicJourneys,
    tools: publicTools,
    urls,
  });
}

function getRepositoryDiscoveryInput(): DiscoveryModelInput {
  const tools = getPublicEligibleUtilities();
  const categoryIds = [...new Set(tools.map((tool) => tool.categoryId))];
  const categories = categoryIds
    .map((categoryId) => getEntityById(`category:${categoryId}`))
    .filter((entity): entity is CategoryRecord => Boolean(entity && "id" in entity));

  return {
    approvedCategoryContent,
    approvedJourneyContent,
    categories,
    journeys: getPublicEligibleJourneys(),
    tools,
  };
}

const publicDiscoveryModel = buildPublicDiscoveryModel(getRepositoryDiscoveryInput());

export function getPublicDiscoveryTools() {
  return publicDiscoveryModel.tools;
}

export function getPublicCategories() {
  return publicDiscoveryModel.categories;
}

export function getPublicCategoryBySlug(slug: string) {
  return publicDiscoveryModel.categories.find((category) => category.slug === slug);
}

export function getPublicJourneys() {
  return publicDiscoveryModel.journeys;
}

export function getPublicJourneyBySlug(slug: string) {
  return publicDiscoveryModel.journeys.find((journey) => journey.slug === slug);
}

export function selectHomepageTools(tools: readonly PublicDiscoveryTool[]) {
  if (tools.length < PUBLICATION_THRESHOLDS.latestUtilityCount) {
    return freezeList([...tools]);
  }
  return freezeList(
    [...tools].toSorted(
      (left, right) =>
        right.releaseDate.localeCompare(left.releaseDate) || alphabeticallyByName(left, right),
    ),
  );
}

export function getHomepageTools() {
  return selectHomepageTools(publicDiscoveryModel.tools);
}

export function getPublicDiscoveryUrls() {
  return publicDiscoveryModel.urls;
}
