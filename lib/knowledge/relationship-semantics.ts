import type { RelationshipType, StoredRelationshipType } from "./types";

export interface RelationshipSemantics {
  stored: boolean;
  direction: "directed" | "symmetric" | "derived";
  publicCandidate: boolean;
  inverseType?: RelationshipType;
  cyclesAllowed: boolean;
}

export const RELATIONSHIP_SEMANTICS: Record<RelationshipType, RelationshipSemantics> = {
  related: {
    stored: true,
    direction: "symmetric",
    publicCandidate: true,
    cyclesAllowed: true,
  },
  "next-step": {
    stored: true,
    direction: "directed",
    publicCandidate: true,
    inverseType: "previous-step",
    cyclesAllowed: false,
  },
  "previous-step": {
    stored: false,
    direction: "derived",
    publicCandidate: true,
    inverseType: "next-step",
    cyclesAllowed: false,
  },
  alternative: {
    stored: true,
    direction: "symmetric",
    publicCandidate: true,
    cyclesAllowed: true,
  },
  comparison: {
    stored: true,
    direction: "symmetric",
    publicCandidate: true,
    cyclesAllowed: true,
  },
  prerequisite: {
    stored: true,
    direction: "directed",
    publicCandidate: true,
    cyclesAllowed: false,
  },
  "input-provider": {
    stored: true,
    direction: "directed",
    publicCandidate: false,
    inverseType: "output-consumer",
    cyclesAllowed: false,
  },
  "output-consumer": {
    stored: false,
    direction: "derived",
    publicCandidate: false,
    inverseType: "input-provider",
    cyclesAllowed: false,
  },
  "same-journey": {
    stored: false,
    direction: "derived",
    publicCandidate: false,
    cyclesAllowed: true,
  },
  "same-formula-family": {
    stored: false,
    direction: "derived",
    publicCandidate: false,
    cyclesAllowed: true,
  },
  "same-intent-cluster": {
    stored: false,
    direction: "derived",
    publicCandidate: false,
    cyclesAllowed: true,
  },
};

export const STORED_RELATIONSHIP_TYPES = new Set<StoredRelationshipType>([
  "related",
  "next-step",
  "alternative",
  "comparison",
  "prerequisite",
  "input-provider",
]);

export const PUBLIC_CANDIDATE_RELATIONSHIP_TYPES = new Set<RelationshipType>(
  Object.entries(RELATIONSHIP_SEMANTICS)
    .filter(([, semantics]) => semantics.publicCandidate)
    .map(([type]) => type as RelationshipType),
);
