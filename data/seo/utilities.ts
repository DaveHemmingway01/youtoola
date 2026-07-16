import type { UtilitySeoDefinition } from "@/lib/seo/types";

export const UTILITY_SEO_DEFINITIONS = Object.freeze([
  Object.freeze({
    canonicalPath: "/fuel-trip-calculator",
    conciseUserProblem: "Estimate fuel and toll costs for a one-way or return road trip.",
    description:
      "Calculate fuel required, fuel cost, tolls, return journeys and cost per passenger for a road trip.",
    indexable: true,
    methodologyVersion: 1,
    primaryIntent: "fuel trip calculator",
    reviewedDate: "2026-07-16",
    sitemapEligible: true,
    socialDescription:
      "Calculate fuel required, fuel cost, tolls, return journeys and cost per passenger for a road trip.",
    socialTitle: "Fuel Trip Calculator | Youtoola",
    title: "Fuel Trip Calculator",
    utilityId: "fuel-trip-calculator",
  }),
] satisfies readonly UtilitySeoDefinition[]);

export function getUtilitySeoDefinition(utilityId: string) {
  return UTILITY_SEO_DEFINITIONS.find((definition) => definition.utilityId === utilityId);
}
