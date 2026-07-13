import type { CategoryRecord } from "@/lib/registry/types";

export const categories = [
  {
    id: "travel-mobility",
    name: "Travel & Mobility",
    aliases: [],
    description: "Travel-cost, vehicle and trip-planning utilities.",
    displayOrder: 1,
    active: true,
    reviewedDate: "2026-07-13",
  },
] satisfies readonly CategoryRecord[];
