import type { CategoryRecord, UtilityRegistryEntry } from "@/lib/registry/types";

import { ENTITY_ID_PATTERN, getEntityType } from "./entity-ids";
import {
  PUBLIC_CANDIDATE_RELATIONSHIP_TYPES,
  RELATIONSHIP_SEMANTICS,
} from "./relationship-semantics";
import { KNOWLEDGE_SCHEMA_VERSION } from "./schema-version";
import type {
  ConceptEntity,
  FormulaFamilyEntity,
  IntentClusterEntity,
  JourneyEntity,
  PlatformEntity,
  SourceEntity,
  StoredUtilityRelationship,
  UnitEntity,
} from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NON_UTILITY_STATUSES = new Set(["provisional", "active", "inactive", "retired"]);
const SOURCE_AUTHORITY_CLASSES = new Set(["provenance", "authoritative", "commercial"]);
const RELATIONSHIP_STATUSES = new Set(["proposed", "approved", "retired"]);
const RELATIONSHIP_VISIBILITIES = new Set(["internal", "public-candidate"]);
const JOURNEY_VISIBILITIES = new Set(["internal", "public"]);
const FUTURE_SLOT_STATUSES = new Set(["future", "unapproved"]);
const GENERIC_RATIONALES = new Set(["related", "related tool", "similar", "similar tool"]);
const FUTURE_SLOT_KEYS = new Set([
  "workingLabel",
  "purpose",
  "stagePosition",
  "rationale",
  "expectedCapability",
  "status",
]);
const FORMULA_FAMILY_KEYS = new Set([
  "knowledgeSchemaVersion",
  "entityId",
  "name",
  "purpose",
  "relatedConceptIds",
  "compatibleUnitFamilyIds",
  "status",
  "reviewedDate",
  "sourceIds",
]);

export interface KnowledgeLayerData {
  knowledgeSchemaVersion: number;
  tools: readonly UtilityRegistryEntry[];
  categories: readonly CategoryRecord[];
  journeys: readonly JourneyEntity[];
  platforms: readonly PlatformEntity[];
  intentClusters: readonly IntentClusterEntity[];
  concepts: readonly ConceptEntity[];
  formulaFamilies: readonly FormulaFamilyEntity[];
  units: readonly UnitEntity[];
  sources: readonly SourceEntity[];
  relationships: readonly StoredUtilityRelationship[];
}

function duplicateValues(values: readonly string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function normalizeLabel(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
}

function isSorted(values: readonly string[]) {
  return values.every((value, index) => index === 0 || values[index - 1].localeCompare(value) <= 0);
}

function hasDirectedCycle(relationships: readonly StoredUtilityRelationship[], type: string) {
  const edges = relationships.filter((relationship) => relationship.type === type);
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const key = type === "next-step"
      ? `${edge.contextJourneyEntityId ?? "missing"}:${edge.sourceEntityId}`
      : edge.sourceEntityId;
    const target = type === "next-step"
      ? `${edge.contextJourneyEntityId ?? "missing"}:${edge.targetEntityId}`
      : edge.targetEntityId;
    adjacency.set(key, [...(adjacency.get(key) ?? []), target]);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (node: string): boolean => {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const target of adjacency.get(node) ?? []) {
      if (visit(target)) return true;
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  };
  return [...adjacency.keys()].some(visit);
}

export function validateKnowledgeLayer(data: KnowledgeLayerData) {
  const errors: string[] = [];
  if (data.knowledgeSchemaVersion !== KNOWLEDGE_SCHEMA_VERSION) {
    errors.push(`Knowledge schema version must be ${KNOWLEDGE_SCHEMA_VERSION}.`);
  }

  const collections = [
    ["platform", data.platforms],
    ["utility", data.tools],
    ["category", data.categories],
    ["journey", data.journeys],
    ["intent", data.intentClusters],
    ["concept", data.concepts],
    ["formula-family", data.formulaFamilies],
    ["unit", data.units],
    ["source", data.sources],
  ] as const;
  const allEntities = collections.flatMap(([, records]) => [...records]);
  const entityIds = allEntities.map((entity) => entity.entityId);
  const entityIdSet = new Set(entityIds);
  const utilityEntityIds = new Set(data.tools.map((tool) => tool.entityId));
  const categoryEntityIds = new Set(data.categories.map((category) => category.entityId));
  const journeyEntityIds = new Set(data.journeys.map((journey) => journey.entityId));
  const conceptEntityIds = new Set(data.concepts.map((concept) => concept.entityId));
  const intentEntityIds = new Set(data.intentClusters.map((intent) => intent.entityId));
  const formulaFamilyEntityIds = new Set(data.formulaFamilies.map((family) => family.entityId));
  const unitEntityIds = new Set(data.units.map((unit) => unit.entityId));
  const unitFamilyIds = new Set(data.units.map((unit) => unit.unitFamilyId));
  const sourceEntityIds = new Set(data.sources.map((source) => source.entityId));

  const utilityReferencesAreActive = (tool: UtilityRegistryEntry | undefined) => {
    if (!tool) return false;
    const category = data.categories.find((candidate) => candidate.id === tool.categoryId);
    if (!category || category.status !== "active") return false;
    const referencedEntityIds = [
      ...(tool.conceptIds ?? []),
      ...(tool.formulaFamilyIds ?? []),
      ...(tool.intentClusterIds ?? []),
      ...(tool.sourceEntityIds ?? []),
      ...(tool.unitIds ?? []),
    ];
    return referencedEntityIds.every((entityId) => {
      const entity = allEntities.find((candidate) => candidate.entityId === entityId);
      return entity && entity.status === "active";
    });
  };

  duplicateValues(entityIds).forEach((id) => errors.push(`Duplicate global entity ID: ${id}.`));
  if (entityIds.some((id) => id.startsWith("jurisdiction:"))) {
    errors.push("Phase 4 must not contain jurisdiction data.");
  }

  for (const [expectedType, records] of collections) {
    const ids = records.map((record) => record.entityId);
    if (!isSorted(ids)) errors.push(`${expectedType} entities must be ordered by entity ID.`);
    for (const record of records) {
      if (!ENTITY_ID_PATTERN.test(record.entityId)) {
        errors.push(`Invalid entity ID: ${record.entityId}.`);
      } else if (getEntityType(record.entityId) !== expectedType) {
        errors.push(`Entity ${record.entityId} is in the wrong ${expectedType} collection.`);
      }
      if (record.knowledgeSchemaVersion !== KNOWLEDGE_SCHEMA_VERSION) {
        errors.push(`Invalid knowledge schema version on ${record.entityId}.`);
      }
      const reviewedDate = "reviewedDate" in record
        ? record.reviewedDate
        : record.lastReviewedDate ?? record.source.reviewedDate;
      if (!DATE_PATTERN.test(reviewedDate)) {
        errors.push(`Invalid reviewed date on ${record.entityId}.`);
      }
      if (expectedType !== "utility" && !NON_UTILITY_STATUSES.has(record.status)) {
        errors.push(`Invalid entity lifecycle status on ${record.entityId}.`);
      }
    }
  }

  for (const [expectedType, records] of collections) {
    const labels = new Map<string, string>();
    for (const record of records) {
      const aliases = "aliases" in record ? record.aliases : [];
      for (const label of [record.name, ...aliases]) {
        const normalized = normalizeLabel(label);
        const existing = labels.get(normalized);
        if (existing && existing !== record.entityId) {
          errors.push(`Alias collision in ${expectedType}: "${label}" is shared by ${existing} and ${record.entityId}.`);
        } else if (existing === record.entityId) {
          errors.push(`Duplicate name or alias on ${record.entityId}: "${label}".`);
        }
        labels.set(normalized, record.entityId);
      }
    }
  }

  const validateSourceIds = (owner: string, sourceIds: readonly string[]) => {
    for (const sourceId of sourceIds) {
      if (!sourceEntityIds.has(sourceId as never)) {
        errors.push(`Unknown source reference ${sourceId} on ${owner}.`);
      }
    }
  };
  for (const entity of allEntities) {
    if ("sourceIds" in entity) validateSourceIds(entity.entityId, entity.sourceIds);
  }

  for (const category of data.categories) {
    if (["parentId", "parentCategoryId", "childIds", "children"].some((key) => key in category)) {
      errors.push(`Category hierarchy is prohibited in Phase 4: ${category.entityId}.`);
    }
  }

  for (const tool of data.tools) {
    const expectedEntityId = `utility:${tool.utilityId}`;
    if (tool.entityId !== expectedEntityId) {
      errors.push(`Utility entity ID does not match utility ID for ${tool.utilityId}.`);
    }
    const category = data.categories.find((candidate) => candidate.id === tool.categoryId);
    if (!category) errors.push(`Unknown category ${tool.categoryId} for ${tool.utilityId}.`);
    for (const id of tool.conceptIds ?? []) {
      if (!conceptEntityIds.has(id)) errors.push(`Unknown concept ${id} on ${tool.utilityId}.`);
    }
    for (const id of tool.intentClusterIds ?? []) {
      if (!intentEntityIds.has(id)) errors.push(`Unknown intent ${id} on ${tool.utilityId}.`);
    }
    for (const id of tool.formulaFamilyIds ?? []) {
      if (!formulaFamilyEntityIds.has(id)) errors.push(`Unknown formula family ${id} on ${tool.utilityId}.`);
    }
    for (const id of tool.unitIds ?? []) {
      if (!unitEntityIds.has(id)) errors.push(`Unknown unit ${id} on ${tool.utilityId}.`);
    }
    validateSourceIds(tool.entityId, tool.sourceEntityIds ?? []);
    for (const ids of [
      tool.conceptIds ?? [],
      tool.formulaFamilyIds ?? [],
      tool.intentClusterIds ?? [],
      tool.sourceEntityIds ?? [],
      tool.unitIds ?? [],
    ]) {
      if (!isSorted(ids)) errors.push(`Knowledge references must be ordered on ${tool.utilityId}.`);
    }
  }

  for (const concept of data.concepts) {
    for (const id of concept.unitIds) {
      if (!unitEntityIds.has(id)) errors.push(`Unknown unit ${id} on ${concept.entityId}.`);
    }
    for (const id of concept.relatedConceptIds) {
      if (!conceptEntityIds.has(id)) errors.push(`Unknown related concept ${id} on ${concept.entityId}.`);
      if (id === concept.entityId) errors.push(`Concept ${concept.entityId} must not relate to itself.`);
    }
    if (!isSorted(concept.unitIds)) errors.push(`Unit references must be ordered on ${concept.entityId}.`);
    if (!isSorted(concept.relatedConceptIds)) errors.push(`Concept references must be ordered on ${concept.entityId}.`);
  }

  for (const formulaFamily of data.formulaFamilies) {
    const unexpectedKeys = Object.keys(formulaFamily).filter((key) => !FORMULA_FAMILY_KEYS.has(key));
    if (unexpectedKeys.length > 0) {
      errors.push(`Formula family ${formulaFamily.entityId} contains prohibited fields: ${unexpectedKeys.join(", ")}.`);
    }
    if (!formulaFamily.entityId.startsWith("formula-family:")) {
      errors.push(`Invalid formula-family prefix on ${formulaFamily.entityId}.`);
    }
    for (const id of formulaFamily.relatedConceptIds) {
      if (!conceptEntityIds.has(id)) errors.push(`Unknown concept ${id} on ${formulaFamily.entityId}.`);
    }
    for (const id of formulaFamily.compatibleUnitFamilyIds) {
      if (!unitFamilyIds.has(id)) errors.push(`Unknown unit family ${id} on ${formulaFamily.entityId}.`);
    }
    if (!isSorted(formulaFamily.relatedConceptIds)) {
      errors.push(`Concept references must be ordered on ${formulaFamily.entityId}.`);
    }
    if (!isSorted(formulaFamily.compatibleUnitFamilyIds)) {
      errors.push(`Unit-family references must be ordered on ${formulaFamily.entityId}.`);
    }
  }

  for (const source of data.sources) {
    if (!SOURCE_AUTHORITY_CLASSES.has(source.authorityClass)) {
      errors.push(`Invalid source authority class on ${source.entityId}.`);
    }
    if (
      source.entityId === "source:google-sheet-youtoola-map" &&
      source.authorityClass !== "provenance"
    ) {
      errors.push("The Youtoola Utility Opportunity Map must be provenance only.");
    }
  }

  for (const journey of data.journeys) {
    if (!JOURNEY_VISIBILITIES.has(journey.visibility)) {
      errors.push(`Invalid journey visibility on ${journey.entityId}.`);
    }
    if (journey.status === "provisional" && journey.active) {
      errors.push(`Provisional journey ${journey.entityId} must remain inactive.`);
    }
    const positions = journey.stages.map((stage) => stage.position);
    const expectedPositions = journey.stages.map((_, index) => index + 1);
    if (positions.join(",") !== expectedPositions.join(",")) {
      errors.push(`Journey stages must use contiguous deterministic order on ${journey.entityId}.`);
    }
    duplicateValues(journey.stages.map((stage) => stage.stageId)).forEach((stageId) =>
      errors.push(`Duplicate journey stage ${stageId} on ${journey.entityId}.`),
    );
    for (const categoryId of journey.categoryEntityIds) {
      if (!categoryEntityIds.has(categoryId)) {
        errors.push(`Unknown category ${categoryId} on ${journey.entityId}.`);
      }
    }
    const memberIds = journey.stages.flatMap((stage) => stage.utilityEntityIds);
    duplicateValues(memberIds).forEach((id) =>
      errors.push(`Duplicate journey member ${id} on ${journey.entityId}.`),
    );
    for (const memberId of memberIds) {
      if (!utilityEntityIds.has(memberId)) errors.push(`Unknown utility ${memberId} on ${journey.entityId}.`);
    }
    const futureLabels: string[] = [];
    for (const stage of journey.stages) {
      for (const slot of stage.futureSlots) {
        const unexpectedKeys = Object.keys(slot).filter((key) => !FUTURE_SLOT_KEYS.has(key));
        if (unexpectedKeys.length > 0) {
          errors.push(`Future slot "${slot.workingLabel}" contains prohibited fields: ${unexpectedKeys.join(", ")}.`);
        }
        if (slot.stagePosition !== stage.position) {
          errors.push(`Future slot "${slot.workingLabel}" has the wrong stage position.`);
        }
        if (!slot.rationale.trim() || !slot.purpose.trim()) {
          errors.push(`Future slot "${slot.workingLabel}" requires purpose and rationale.`);
        }
        if (!FUTURE_SLOT_STATUSES.has(slot.status)) {
          errors.push(`Future slot "${slot.workingLabel}" has an invalid status.`);
        }
        futureLabels.push(normalizeLabel(slot.workingLabel));
      }
    }
    duplicateValues(futureLabels).forEach((label) =>
      errors.push(`Duplicate future slot "${label}" on ${journey.entityId}.`),
    );
    if (journey.visibility === "public" || journey.active) {
      const releasedMembers = memberIds.filter((memberId) => {
        const tool = data.tools.find((candidate) => candidate.entityId === memberId);
        return tool?.status === "released";
      });
      if (
        journey.status !== "active" ||
        !journey.active ||
        journey.visibility !== "public" ||
        new Set(releasedMembers).size < 2 ||
        journey.stages.some((stage) => stage.futureSlots.length > 0)
      ) {
        errors.push(`Public journey ${journey.entityId} does not meet minimum completeness.`);
      }
    }
  }

  const relationshipKeys: string[] = [];
  for (const relationship of data.relationships) {
    const sourceTool = data.tools.find(
      (tool) => tool.entityId === relationship.sourceEntityId,
    );
    const targetTool = data.tools.find(
      (tool) => tool.entityId === relationship.targetEntityId,
    );
    const contextJourney = relationship.contextJourneyEntityId
      ? data.journeys.find(
          (journey) => journey.entityId === relationship.contextJourneyEntityId,
        )
      : undefined;
    if (relationship.knowledgeSchemaVersion !== KNOWLEDGE_SCHEMA_VERSION) {
      errors.push(`Invalid knowledge schema version on relationship ${relationship.sourceEntityId} -> ${relationship.targetEntityId}.`);
    }
    if (!utilityEntityIds.has(relationship.sourceEntityId)) {
      errors.push(`Unknown relationship source ${relationship.sourceEntityId}.`);
    }
    if (!utilityEntityIds.has(relationship.targetEntityId)) {
      errors.push(`Unknown relationship target ${relationship.targetEntityId}.`);
    }
    if (relationship.sourceEntityId === relationship.targetEntityId) {
      errors.push(`Relationship self-link is prohibited on ${relationship.sourceEntityId}.`);
    }
    const semantics = RELATIONSHIP_SEMANTICS[relationship.type];
    if (!semantics?.stored) errors.push(`Relationship type ${relationship.type} must be derived, not stored.`);
    const normalizedRationale = normalizeLabel(relationship.rationale);
    if (
      relationship.rationaleAuthorship !== "human" ||
      normalizedRationale.length < 20 ||
      GENERIC_RATIONALES.has(normalizedRationale)
    ) {
      errors.push(`Relationship ${relationship.sourceEntityId} -> ${relationship.targetEntityId} requires a specific human-written rationale.`);
    }
    if (
      relationship.visibility === "public-candidate" &&
      (!PUBLIC_CANDIDATE_RELATIONSHIP_TYPES.has(relationship.type) ||
        relationship.status !== "approved" ||
        relationship.rationaleAuthorship !== "human" ||
        sourceTool?.status !== "released" ||
        targetTool?.status !== "released" ||
        !utilityReferencesAreActive(sourceTool) ||
        !utilityReferencesAreActive(targetTool) ||
        (relationship.contextJourneyEntityId !== undefined &&
          (!contextJourney ||
            contextJourney.status !== "active" ||
            !contextJourney.active ||
            contextJourney.visibility !== "public")))
    ) {
      errors.push(`Relationship ${relationship.sourceEntityId} -> ${relationship.targetEntityId} is not eligible as a public candidate.`);
    }
    if (!RELATIONSHIP_STATUSES.has(relationship.status)) {
      errors.push(`Invalid relationship status on ${relationship.sourceEntityId} -> ${relationship.targetEntityId}.`);
    }
    if (!RELATIONSHIP_VISIBILITIES.has(relationship.visibility)) {
      errors.push(`Invalid relationship visibility on ${relationship.sourceEntityId} -> ${relationship.targetEntityId}.`);
    }
    if (relationship.type === "input-provider" && relationship.visibility !== "internal") {
      errors.push("Input-provider relationships must remain internal in Phase 4.");
    }
    if (
      relationship.contextJourneyEntityId &&
      !journeyEntityIds.has(relationship.contextJourneyEntityId)
    ) {
      errors.push(`Unknown relationship journey context ${relationship.contextJourneyEntityId}.`);
    }
    if (relationship.type === "next-step") {
      if (!relationship.contextJourneyEntityId) {
        errors.push("Next-step relationships require a valid journey context.");
      }
    }
    if (!DATE_PATTERN.test(relationship.reviewedDate)) {
      errors.push(`Invalid relationship reviewed date for ${relationship.sourceEntityId} -> ${relationship.targetEntityId}.`);
    }
    for (const sourceId of relationship.evidenceSourceIds ?? []) {
      if (!sourceEntityIds.has(sourceId)) errors.push(`Unknown relationship evidence source ${sourceId}.`);
    }
    if (relationship.displayOrder !== undefined && (!Number.isSafeInteger(relationship.displayOrder) || relationship.displayOrder < 1)) {
      errors.push(`Invalid relationship display order on ${relationship.sourceEntityId} -> ${relationship.targetEntityId}.`);
    }
    const symmetric = semantics?.direction === "symmetric";
    if (symmetric && relationship.sourceEntityId.localeCompare(relationship.targetEntityId) >= 0) {
      errors.push(`Symmetric relationship ${relationship.type} must use canonical endpoint ordering.`);
    }
    const endpoints = symmetric
      ? [relationship.sourceEntityId, relationship.targetEntityId].toSorted().join(":")
      : `${relationship.sourceEntityId}:${relationship.targetEntityId}`;
    relationshipKeys.push(`${relationship.type}:${endpoints}:${relationship.contextJourneyEntityId ?? ""}`);
  }
  duplicateValues(relationshipKeys).forEach((key) => errors.push(`Duplicate semantic relationship: ${key}.`));
  if (!isSorted(relationshipKeys)) errors.push("Stored relationships must be deterministically ordered.");
  for (const type of ["next-step", "prerequisite", "input-provider"] as const) {
    if (hasDirectedCycle(data.relationships, type)) {
      errors.push(`Prohibited ${type} relationship cycle detected.`);
    }
  }

  if (!entityIdSet.has("utility:fuel-trip-calculator")) {
    errors.push("The approved Fuel Trip Calculator fixture is missing.");
  }

  return errors;
}

export function assertValidKnowledgeLayer(data: KnowledgeLayerData) {
  const errors = validateKnowledgeLayer(data);
  if (errors.length > 0) {
    throw new Error(`Repository Knowledge Layer validation failed:\n- ${errors.join("\n- ")}`);
  }
}
