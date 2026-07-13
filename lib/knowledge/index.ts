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

import { KNOWLEDGE_SCHEMA_VERSION } from "./schema-version";
import type { KnowledgeLayerData } from "./validation";

export const knowledgeLayer = {
  knowledgeSchemaVersion: KNOWLEDGE_SCHEMA_VERSION,
  tools,
  categories,
  journeys,
  platforms,
  intentClusters,
  concepts,
  formulaFamilies,
  units,
  sources,
  relationships: utilityRelationships,
} satisfies KnowledgeLayerData;

export { KNOWLEDGE_SCHEMA_VERSION } from "./schema-version";
export { RELATIONSHIP_SEMANTICS } from "./relationship-semantics";
export {
  getAllEntityIds,
  getConceptsForUtility,
  deriveInverseRelationship,
  getEntitiesByType,
  getEntityById,
  getFormulaFamiliesForUtility,
  getIntentClustersForUtility,
  getJourneysForUtility,
  getPublicJourneysForUtility,
  getPublicRelationshipsForUtility,
  getPublicUtilitiesForJourney,
  getRelationshipsFrom,
  getRelationshipsTo,
  getUnitsForConcept,
  getUtilitiesForJourney,
} from "./selectors";
export type * from "./types";
export { assertValidKnowledgeLayer, validateKnowledgeLayer } from "./validation";
