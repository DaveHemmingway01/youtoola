import type { KnowledgeSchemaVersion } from "@/lib/knowledge/schema-version";
import type {
  CategoryEntityId,
  ConceptEntityId,
  FormulaFamilyEntityId,
  IntentEntityId,
  JourneyEntity,
  NonUtilityEntityStatus,
  SourceEntityId,
  UnitEntityId,
  UtilityEntityId,
} from "@/lib/knowledge/types";

export type RegistryStatus =
  | "idea"
  | "research"
  | "planned"
  | "approved"
  | "building"
  | "preview"
  | "released"
  | "paused"
  | "retired";

export interface CategoryRecord {
  knowledgeSchemaVersion: KnowledgeSchemaVersion;
  id: string;
  entityId: CategoryEntityId;
  name: string;
  aliases: readonly string[];
  description: string;
  userIntent: string;
  displayOrder: number;
  status: NonUtilityEntityStatus;
  reviewedDate: string;
  sourceIds: readonly SourceEntityId[];
}

export type JourneyRecord = JourneyEntity;

export interface UtilityRegistryEntry {
  knowledgeSchemaVersion: KnowledgeSchemaVersion;
  utilityId: string;
  entityId: UtilityEntityId;
  name: string;
  aliases: readonly string[];
  slug: string;
  canonicalUrl: `https://www.youtoola.com/${string}`;
  categoryId: string;
  description?: string;
  userProblem?: string;
  jobToBeDone?: string;
  primarySearchIntent?: string;
  secondarySearchIntents?: readonly string[];
  status: RegistryStatus;
  priority?: string;
  complexity?: string;
  riskProfile?: string;
  monetisationTypes?: readonly string[];
  premiumOpportunity?: string;
  conceptIds?: readonly ConceptEntityId[];
  unitIds?: readonly UnitEntityId[];
  formulaFamilyIds?: readonly FormulaFamilyEntityId[];
  intentClusterIds?: readonly IntentEntityId[];
  sourceEntityIds?: readonly SourceEntityId[];
  source: {
    spreadsheetId: string;
    tabName: string;
    visibleRow: number;
    sourceUtilityId: string;
    reviewedDate: string;
    contentHash: `sha256:${string}`;
    categoryMapping: "approved-tab-context" | "explicit-row-field";
  };
  specificationPath?: string;
  releaseDate?: string;
  lastReviewedDate?: string;
}
