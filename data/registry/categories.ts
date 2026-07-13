import type { CategoryRecord } from "@/lib/registry/types";
import { KNOWLEDGE_SCHEMA_VERSION } from "@/lib/knowledge/schema-version";

export const categories: readonly CategoryRecord[] = [
  {
    knowledgeSchemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    id: "travel-mobility",
    entityId: "category:travel-mobility",
    name: "Travel & Mobility",
    aliases: [],
    description: "Travel-cost, vehicle and trip-planning utilities.",
    userIntent: "Plan journeys, compare travel choices and understand mobility costs.",
    displayOrder: 1,
    status: "active",
    reviewedDate: "2026-07-13",
    sourceIds: ["source:google-sheet-youtoola-map"],
  },
];
