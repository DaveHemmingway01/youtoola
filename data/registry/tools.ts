import type { UtilityRegistryEntry } from "@/lib/registry/types";

export const tools: readonly UtilityRegistryEntry[] = [
  {
    utilityId: "fuel-trip-calculator",
    entityId: "utility:fuel-trip-calculator",
    name: "Fuel Trip Calculator",
    aliases: [],
    slug: "fuel-trip-calculator",
    canonicalUrl: "https://www.youtoola.com/fuel-trip-calculator",
    categoryId: "travel-mobility",
    description: "Calculate fuel, tolls, return journeys and cost per passenger.",
    status: "idea",
    priority: "Tier 1",
    monetisationTypes: ["affiliate"],
    relationships: [],
    source: {
      spreadsheetId: "1BJtHQKH6MxAySfQ0C-mGrCgXdAD1efM2vIf5iDwqzpU",
      tabName: "Travel & Mobility",
      visibleRow: 5,
      sourceUtilityId: "21",
      reviewedDate: "2026-07-13",
      contentHash: "sha256:88b614a6c8ca091012fc4b996389fd6aff3f2f8769d3e2567ec17bf4aba6d0de",
      categoryMapping: "approved-tab-context",
    },
    lastReviewedDate: "2026-07-13",
  },
] satisfies readonly UtilityRegistryEntry[];
