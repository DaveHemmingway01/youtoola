import { KNOWLEDGE_SCHEMA_VERSION } from "@/lib/knowledge/schema-version";
import type { IntentClusterEntity } from "@/lib/knowledge/types";

export const intentClusters: readonly IntentClusterEntity[] = [
  {
    knowledgeSchemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    entityId: "intent:trip-cost",
    name: "Trip Cost",
    aliases: ["journey cost", "travel cost"],
    definition: "Questions about estimating, understanding or sharing the cost of a trip.",
    userJob: "Understand the likely monetary cost of a journey before or during planning.",
    status: "provisional",
    reviewedDate: "2026-07-13",
    sourceIds: ["source:google-sheet-youtoola-map"],
  },
];
