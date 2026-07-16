import { KNOWLEDGE_SCHEMA_VERSION } from "@/lib/knowledge/schema-version";
import type { FormulaFamilyEntity } from "@/lib/knowledge/types";

export const formulaFamilies: readonly FormulaFamilyEntity[] = [
  {
    knowledgeSchemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    entityId: "formula-family:trip-cost",
    name: "Trip Cost",
    purpose: "Classify future calculations that estimate one or more approved components of trip cost.",
    relatedConceptIds: [
      "concept:distance",
      "concept:fuel-consumption",
      "concept:fuel-price",
      "concept:total-trip-cost",
    ],
    compatibleUnitFamilyIds: ["distance", "fuel-efficiency", "volume"],
    status: "active",
    reviewedDate: "2026-07-16",
    sourceIds: ["source:google-sheet-youtoola-map"],
  },
];
