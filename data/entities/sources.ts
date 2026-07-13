import { KNOWLEDGE_SCHEMA_VERSION } from "@/lib/knowledge/schema-version";
import type { SourceEntity } from "@/lib/knowledge/types";

export const sources: readonly SourceEntity[] = [
  {
    knowledgeSchemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    entityId: "source:google-sheet-youtoola-map",
    name: "Youtoola Utility Opportunity Map",
    aliases: [],
    definition: "The owner-maintained opportunity backlog and planning provenance for Youtoola utilities.",
    status: "active",
    reviewedDate: "2026-07-13",
    sourceIds: [],
    title: "Youtoola Utility Opportunity Map",
    publisher: "Youtoola",
    url: "https://docs.google.com/spreadsheets/d/1BJtHQKH6MxAySfQ0C-mGrCgXdAD1efM2vIf5iDwqzpU/edit?usp=drivesdk",
    authorityClass: "provenance",
    sourceType: "opportunity-backlog",
    freshnessExpectation: "Review the live row during every approved utility planning task.",
  },
];
