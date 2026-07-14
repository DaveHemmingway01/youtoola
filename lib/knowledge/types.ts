import type { KnowledgeSchemaVersion } from "./schema-version";

export type EntityType =
  | "platform"
  | "utility"
  | "category"
  | "journey"
  | "intent"
  | "concept"
  | "formula-family"
  | "unit"
  | "source"
  | "jurisdiction";

export type NonUtilityEntityStatus = "provisional" | "active" | "inactive" | "retired";
export type KnowledgeVisibility = "internal" | "public";
export type SourceAuthorityClass = "provenance" | "authoritative" | "commercial";

export type PlatformEntityId = `platform:${string}`;
export type UtilityEntityId = `utility:${string}`;
export type CategoryEntityId = `category:${string}`;
export type JourneyEntityId = `journey:${string}`;
export type IntentEntityId = `intent:${string}`;
export type ConceptEntityId = `concept:${string}`;
export type FormulaFamilyEntityId = `formula-family:${string}`;
export type UnitEntityId = `unit:${string}`;
export type SourceEntityId = `source:${string}`;
export type JurisdictionEntityId = `jurisdiction:${string}`;

export type EntityId =
  | PlatformEntityId
  | UtilityEntityId
  | CategoryEntityId
  | JourneyEntityId
  | IntentEntityId
  | ConceptEntityId
  | FormulaFamilyEntityId
  | UnitEntityId
  | SourceEntityId
  | JurisdictionEntityId;

export interface ExternalReference {
  label: string;
  url: `https://${string}`;
}

interface EntityBase<TId extends EntityId> {
  knowledgeSchemaVersion: KnowledgeSchemaVersion;
  entityId: TId;
  name: string;
  aliases: readonly string[];
  definition: string;
  status: NonUtilityEntityStatus;
  reviewedDate: string;
  sourceIds: readonly SourceEntityId[];
  externalReferences?: readonly ExternalReference[];
}

export interface PlatformEntity extends EntityBase<PlatformEntityId> {
  canonicalUrl: "https://www.youtoola.com";
}

export interface IntentClusterEntity extends EntityBase<IntentEntityId> {
  userJob: string;
}

export interface ConceptEntity extends EntityBase<ConceptEntityId> {
  unitIds: readonly UnitEntityId[];
  relatedConceptIds: readonly ConceptEntityId[];
}

export type UnitFamilyId = "distance" | "fuel-efficiency" | "volume";

export interface FormulaFamilyEntity {
  knowledgeSchemaVersion: KnowledgeSchemaVersion;
  entityId: FormulaFamilyEntityId;
  name: string;
  purpose: string;
  relatedConceptIds: readonly ConceptEntityId[];
  compatibleUnitFamilyIds: readonly UnitFamilyId[];
  status: NonUtilityEntityStatus;
  reviewedDate: string;
  sourceIds: readonly SourceEntityId[];
}

export interface UnitEntity extends EntityBase<UnitEntityId> {
  symbol: string;
  quantityType: "distance" | "fuel-efficiency" | "volume";
  unitFamilyId: UnitFamilyId;
  regionalVariant?: "international" | "uk" | "us";
}

export interface SourceEntity extends EntityBase<SourceEntityId> {
  title: string;
  publisher: string;
  url: `https://${string}`;
  authorityClass: SourceAuthorityClass;
  sourceType: string;
  freshnessExpectation: string;
}

// Contract only. Phase 4 intentionally contains no jurisdiction data.
export interface JurisdictionEntity extends EntityBase<JurisdictionEntityId> {
  jurisdictionCode: string;
}

export interface FutureJourneySlot {
  workingLabel: string;
  purpose: string;
  stagePosition: number;
  rationale: string;
  expectedCapability?: string;
  status: "future" | "unapproved";
}

export interface JourneyStage {
  stageId: string;
  position: number;
  name: string;
  purpose: string;
  utilityEntityIds: readonly UtilityEntityId[];
  futureSlots: readonly FutureJourneySlot[];
}

export interface JourneyEntity extends EntityBase<JourneyEntityId> {
  id: string;
  objective: string;
  targetAudience: string;
  entryQuestions: readonly string[];
  stages: readonly JourneyStage[];
  categoryEntityIds: readonly CategoryEntityId[];
  commercialOpportunityTypes: readonly string[];
  owner: "Youtoola owner";
  active: boolean;
  visibility: KnowledgeVisibility;
  displayOrder: number;
}

export type StoredRelationshipType =
  | "related"
  | "next-step"
  | "alternative"
  | "comparison"
  | "prerequisite"
  | "input-provider";

export type DerivedRelationshipType =
  | "previous-step"
  | "output-consumer"
  | "same-journey"
  | "same-formula-family"
  | "same-intent-cluster";

export type RelationshipType = StoredRelationshipType | DerivedRelationshipType;
export type RelationshipStatus = "proposed" | "approved" | "retired";
export type RelationshipVisibility = "internal" | "public-candidate";

export interface StoredUtilityRelationship {
  knowledgeSchemaVersion: KnowledgeSchemaVersion;
  sourceEntityId: UtilityEntityId;
  targetEntityId: UtilityEntityId;
  type: StoredRelationshipType;
  rationale: string;
  rationaleAuthorship: "human";
  status: RelationshipStatus;
  visibility: RelationshipVisibility;
  reviewedDate: string;
  contextJourneyEntityId?: JourneyEntityId;
  displayOrder?: number;
  evidenceSourceIds?: readonly SourceEntityId[];
}

export interface RelationshipView {
  sourceEntityId: UtilityEntityId;
  targetEntityId: UtilityEntityId;
  type: RelationshipType;
  rationale: string;
  rationaleAuthorship: "human" | "system-derived";
  status: RelationshipStatus;
  visibility: RelationshipVisibility;
  reviewedDate: string;
  derived: boolean;
  contextJourneyEntityId?: JourneyEntityId;
  displayOrder?: number;
  evidenceSourceIds?: readonly SourceEntityId[];
}

export type KnowledgeEntity =
  | PlatformEntity
  | IntentClusterEntity
  | ConceptEntity
  | FormulaFamilyEntity
  | UnitEntity
  | SourceEntity
  | JourneyEntity;
