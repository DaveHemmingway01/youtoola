import { KNOWLEDGE_SCHEMA_VERSION } from "@/lib/knowledge/schema-version";
import type { PlatformEntity } from "@/lib/knowledge/types";

export const platforms: readonly PlatformEntity[] = [
  {
    knowledgeSchemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    entityId: "platform:youtoola",
    name: "Youtoola",
    aliases: [],
    definition:
      "Youtoola is a collection of free, practical online tools for everyday calculations, decisions and tasks, without requiring an account.",
    status: "active",
    reviewedDate: "2026-07-14",
    sourceIds: [],
    canonicalUrl: "https://www.youtoola.com",
  },
];
