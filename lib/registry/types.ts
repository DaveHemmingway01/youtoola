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

export type RelationshipType =
  | "related"
  | "previous-step"
  | "next-step"
  | "alternative"
  | "comparison"
  | "prerequisite"
  | "input-provider"
  | "output-consumer"
  | "same-journey"
  | "same-formula-family"
  | "same-intent-cluster";

export interface UtilityRelationship {
  type: RelationshipType;
  targetUtilityId: string;
  reason: string;
  displayOrder?: number;
}

export interface CategoryRecord {
  id: string;
  name: string;
  aliases: readonly string[];
  description: string;
  displayOrder: number;
  active: boolean;
  reviewedDate: string;
}

export interface JourneyRecord {
  id: string;
  name: string;
  aliases: readonly string[];
  description: string;
  displayOrder: number;
  active: boolean;
  reviewedDate: string;
}

export interface UtilityRegistryEntry {
  utilityId: string;
  entityId: string;
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
  concepts?: readonly string[];
  units?: readonly string[];
  formulaFamily?: string;
  journeyIds?: readonly string[];
  intentClusters?: readonly string[];
  relationships: readonly UtilityRelationship[];
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
