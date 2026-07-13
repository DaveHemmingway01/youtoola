import { KNOWLEDGE_SCHEMA_VERSION } from "@/lib/knowledge/schema-version";
import type { PlatformEntity } from "@/lib/knowledge/types";

export const platforms: readonly PlatformEntity[] = [
  {
    knowledgeSchemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    entityId: "platform:youtoola",
    name: "Youtoola",
    aliases: [],
    definition: "One connected platform for practical online utilities.",
    status: "active",
    reviewedDate: "2026-07-13",
    sourceIds: [],
    canonicalUrl: "https://www.youtoola.com",
  },
];
