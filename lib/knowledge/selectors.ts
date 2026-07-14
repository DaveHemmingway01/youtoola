import { concepts } from "@/data/entities/concepts";
import { formulaFamilies } from "@/data/entities/formula-families";
import { intentClusters } from "@/data/entities/intent-clusters";
import { platforms } from "@/data/entities/platform";
import { sources } from "@/data/entities/sources";
import { units } from "@/data/entities/units";
import { categories } from "@/data/registry/categories";
import { journeys } from "@/data/registry/journeys";
import { tools } from "@/data/registry/tools";
import { utilityRelationships } from "@/data/relationships/utility-relationships";
import type { CategoryRecord, UtilityRegistryEntry } from "@/lib/registry/types";

import { getEntityType } from "./entity-ids";
import {
  PUBLIC_CANDIDATE_RELATIONSHIP_TYPES,
  RELATIONSHIP_SEMANTICS,
} from "./relationship-semantics";
import type {
  EntityId,
  EntityType,
  JourneyEntity,
  KnowledgeEntity,
  RelationshipView,
  StoredUtilityRelationship,
  UtilityEntityId,
} from "./types";

type IndexedEntity = KnowledgeEntity | CategoryRecord | UtilityRegistryEntry;

function byEntityId<T extends { entityId: string }>(left: T, right: T) {
  return left.entityId.localeCompare(right.entityId);
}

function allEntities(): readonly IndexedEntity[] {
  return [
    ...platforms,
    ...tools,
    ...categories,
    ...journeys,
    ...intentClusters,
    ...concepts,
    ...formulaFamilies,
    ...units,
    ...sources,
  ].toSorted(byEntityId);
}

function storedView(relationship: StoredUtilityRelationship): RelationshipView {
  return { ...relationship, derived: false };
}

export function deriveInverseRelationship(
  relationship: StoredUtilityRelationship,
): RelationshipView | undefined {
  if (RELATIONSHIP_SEMANTICS[relationship.type].direction === "symmetric") {
    return {
      ...relationship,
      sourceEntityId: relationship.targetEntityId,
      targetEntityId: relationship.sourceEntityId,
      derived: true,
    };
  }
  if (relationship.type === "next-step") {
    return {
      ...relationship,
      sourceEntityId: relationship.targetEntityId,
      targetEntityId: relationship.sourceEntityId,
      type: "previous-step",
      derived: true,
    };
  }
  if (relationship.type === "input-provider") {
    return {
      ...relationship,
      sourceEntityId: relationship.targetEntityId,
      targetEntityId: relationship.sourceEntityId,
      type: "output-consumer",
      derived: true,
    };
  }
  return undefined;
}

function deriveSharedReferenceRelationships(): RelationshipView[] {
  const result: RelationshipView[] = [];
  const addPair = (
    type: "same-journey" | "same-formula-family" | "same-intent-cluster",
    left: UtilityRegistryEntry,
    right: UtilityRegistryEntry,
    rationale: string,
    reviewedDate: string,
  ) => {
    for (const [source, target] of [[left, right], [right, left]] as const) {
      result.push({
        sourceEntityId: source.entityId,
        targetEntityId: target.entityId,
        type,
        rationale,
        rationaleAuthorship: "system-derived",
        status: "proposed",
        visibility: "internal",
        reviewedDate,
        derived: true,
      });
    }
  };

  for (let leftIndex = 0; leftIndex < tools.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < tools.length; rightIndex += 1) {
      const left = tools[leftIndex];
      const right = tools[rightIndex];
      const sharedFormula = (left.formulaFamilyIds ?? []).find((id) =>
        (right.formulaFamilyIds ?? []).includes(id),
      );
      if (sharedFormula) {
        addPair(
          "same-formula-family",
          left,
          right,
          `System-derived because both utilities reference ${sharedFormula}.`,
          [left.lastReviewedDate, right.lastReviewedDate].filter(Boolean).sort().at(-1) ?? "1970-01-01",
        );
      }
      const sharedIntent = (left.intentClusterIds ?? []).find((id) =>
        (right.intentClusterIds ?? []).includes(id),
      );
      if (sharedIntent) {
        addPair(
          "same-intent-cluster",
          left,
          right,
          `System-derived because both utilities reference ${sharedIntent}.`,
          [left.lastReviewedDate, right.lastReviewedDate].filter(Boolean).sort().at(-1) ?? "1970-01-01",
        );
      }
      const sharedJourney = journeys.find((journey) => {
        const members = journey.stages.flatMap((stage) => stage.utilityEntityIds);
        return members.includes(left.entityId) && members.includes(right.entityId);
      });
      if (sharedJourney) {
        addPair(
          "same-journey",
          left,
          right,
          `System-derived because both utilities are internal members of ${sharedJourney.entityId}.`,
          sharedJourney.reviewedDate,
        );
      }
    }
  }
  return result;
}

function relationshipViews(): readonly RelationshipView[] {
  return utilityRelationships
    .flatMap((relationship) => {
      const inverseOrMirror = deriveInverseRelationship(relationship);
      return inverseOrMirror
        ? [storedView(relationship), inverseOrMirror]
        : [storedView(relationship)];
    })
    .concat(deriveSharedReferenceRelationships())
    .toSorted((left, right) =>
      `${left.sourceEntityId}:${left.type}:${left.targetEntityId}`.localeCompare(
        `${right.sourceEntityId}:${right.type}:${right.targetEntityId}`,
      ),
    );
}

function getUtilityByEntityId(entityId: UtilityEntityId) {
  return tools.find((tool) => tool.entityId === entityId);
}

function referencesAreActive(tool: UtilityRegistryEntry) {
  const category = categories.find((candidate) => candidate.id === tool.categoryId);
  if (!category || category.status !== "active") return false;

  const referenced = [
    ...(tool.conceptIds ?? []),
    ...(tool.formulaFamilyIds ?? []),
    ...(tool.intentClusterIds ?? []),
    ...(tool.unitIds ?? []),
    ...(tool.sourceEntityIds ?? []),
  ];
  return referenced.every((entityId) => {
    const entity = getEntityById(entityId);
    return entity && "status" in entity && entity.status === "active";
  });
}

function utilityIsPublic(tool: UtilityRegistryEntry | undefined) {
  return Boolean(tool && tool.status === "released" && referencesAreActive(tool));
}

function journeyIsPublic(journey: JourneyEntity) {
  const utilityIds = [...new Set(journey.stages.flatMap((stage) => stage.utilityEntityIds))];
  const occupiedStages = journey.stages.filter((stage) => stage.utilityEntityIds.length > 0);
  return (
    journey.status === "active" &&
    journey.active &&
    journey.visibility === "public" &&
    utilityIds.length >= 2 &&
    occupiedStages.length >= 2 &&
    journey.objective.trim().length > 0 &&
    journey.targetAudience.trim().length > 0 &&
    journey.stages.every((stage) => stage.futureSlots.length === 0) &&
    utilityIds.every((entityId) => utilityIsPublic(getUtilityByEntityId(entityId)))
  );
}

export function getPublicEligibleUtilities() {
  return tools.filter(utilityIsPublic);
}

export function getPublicEligibleJourneys() {
  return journeys.filter(journeyIsPublic);
}

export function getEntityById(entityId: string): IndexedEntity | undefined {
  return allEntities().find((entity) => entity.entityId === entityId);
}

export function getEntitiesByType(entityType: EntityType): readonly IndexedEntity[] {
  return allEntities().filter((entity) => getEntityType(entity.entityId) === entityType);
}

export function getRelationshipsFrom(entityId: UtilityEntityId) {
  return relationshipViews().filter((relationship) => relationship.sourceEntityId === entityId);
}

export function getRelationshipsTo(entityId: UtilityEntityId) {
  return relationshipViews().filter((relationship) => relationship.targetEntityId === entityId);
}

export function getJourneysForUtility(utilityId: string) {
  const tool = tools.find((candidate) => candidate.utilityId === utilityId);
  if (!tool) return [];
  return journeys.filter((journey) =>
    journey.stages.some((stage) => stage.utilityEntityIds.includes(tool.entityId)),
  );
}

export function getUtilitiesForJourney(journeyId: string) {
  const journey = journeys.find(
    (candidate) => candidate.id === journeyId || candidate.entityId === journeyId,
  );
  if (!journey) return [];
  const entityIds = new Set(journey.stages.flatMap((stage) => stage.utilityEntityIds));
  return tools.filter((tool) => entityIds.has(tool.entityId));
}

export function getIntentClustersForUtility(utilityId: string) {
  const tool = tools.find((candidate) => candidate.utilityId === utilityId);
  if (!tool) return [];
  return intentClusters.filter((intent) => tool.intentClusterIds?.includes(intent.entityId));
}

export function getConceptsForUtility(utilityId: string) {
  const tool = tools.find((candidate) => candidate.utilityId === utilityId);
  if (!tool) return [];
  return concepts.filter((concept) => tool.conceptIds?.includes(concept.entityId));
}

export function getFormulaFamiliesForUtility(utilityId: string) {
  const tool = tools.find((candidate) => candidate.utilityId === utilityId);
  if (!tool) return [];
  return formulaFamilies.filter((family) => tool.formulaFamilyIds?.includes(family.entityId));
}

export function getUnitsForConcept(conceptEntityId: string) {
  const concept = concepts.find((candidate) => candidate.entityId === conceptEntityId);
  if (!concept) return [];
  return units.filter((unit) => concept.unitIds.includes(unit.entityId));
}

export function getPublicRelationshipsForUtility(utilityId: string) {
  const tool = tools.find((candidate) => candidate.utilityId === utilityId);
  if (!utilityIsPublic(tool)) return [];
  return getRelationshipsFrom(tool!.entityId).filter((relationship) => {
    const target = getUtilityByEntityId(relationship.targetEntityId);
    const context = relationship.contextJourneyEntityId
      ? journeys.find((journey) => journey.entityId === relationship.contextJourneyEntityId)
      : undefined;
    return (
      PUBLIC_CANDIDATE_RELATIONSHIP_TYPES.has(relationship.type) &&
      relationship.status === "approved" &&
      relationship.visibility === "public-candidate" &&
      relationship.rationaleAuthorship === "human" &&
      relationship.rationale.trim().length > 0 &&
      utilityIsPublic(target) &&
      (!relationship.contextJourneyEntityId || Boolean(context && journeyIsPublic(context)))
    );
  });
}

export function getPublicJourneysForUtility(utilityId: string) {
  return getJourneysForUtility(utilityId).filter(journeyIsPublic);
}

export function getPublicUtilitiesForJourney(journeyId: string) {
  const journey = journeys.find(
    (candidate) => candidate.id === journeyId || candidate.entityId === journeyId,
  );
  if (!journey || !journeyIsPublic(journey)) return [];
  return getUtilitiesForJourney(journeyId).filter(utilityIsPublic);
}

export function getAllEntityIds(): readonly EntityId[] {
  return allEntities().map((entity) => entity.entityId as EntityId);
}
