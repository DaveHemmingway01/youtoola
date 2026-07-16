import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { categories } from "@/data/registry/categories";
import { journeys } from "@/data/registry/journeys";
import { tools } from "@/data/registry/tools";
import {
  buildPublicDiscoveryModel,
  getHomepageTools,
  getPublicCategories,
  getPublicCategoryBySlug,
  getPublicDiscoveryTools,
  getPublicDiscoveryUrls,
  getPublicJourneyBySlug,
  getPublicJourneys,
  selectHomepageTools,
} from "@/lib/discovery";
import type { UtilityRegistryEntry } from "@/lib/registry/types";

function releasedTool(
  utilityId: string,
  name: string,
  releaseDate: string,
  status: UtilityRegistryEntry["status"] = "released",
): UtilityRegistryEntry {
  return {
    ...tools[0],
    canonicalUrl: `https://www.youtoola.com/${utilityId}`,
    description: `${name} description.`,
    entityId: `utility:${utilityId}`,
    name,
    releaseDate,
    slug: utilityId,
    specificationPath: `docs/utilities/${utilityId}.md`,
    status,
    utilityId,
  };
}

const alphaTool = releasedTool("alpha-tool", "Alpha Tool", "2026-07-10");
const betaTool = releasedTool("beta-tool", "Beta Tool", "2026-07-12");

function model(toolFixtures: readonly UtilityRegistryEntry[] = []) {
  return buildPublicDiscoveryModel({
    categories,
    journeys: [],
    tools: toolFixtures,
  });
}

describe("public discovery model", () => {
  it("publishes exactly the released calculator while thresholds stay closed", () => {
    expect(getPublicDiscoveryTools()).toEqual([
      expect.objectContaining({
        categoryName: "Travel & Mobility",
        slug: "fuel-trip-calculator",
        utilityId: "fuel-trip-calculator",
      }),
    ]);
    expect(getPublicCategories()).toEqual([]);
    expect(getPublicJourneys()).toEqual([]);
    expect(getHomepageTools()).toEqual(getPublicDiscoveryTools());
    expect(getPublicCategoryBySlug("travel-mobility")).toBeUndefined();
    expect(getPublicJourneyBySlug("road-trip-planning")).toBeUndefined();
    expect(getPublicDiscoveryUrls()).toEqual([
      "https://www.youtoola.com",
      "https://www.youtoola.com/tools",
      "https://www.youtoola.com/fuel-trip-calculator",
    ]);
    expect(Object.isFrozen(getPublicDiscoveryUrls())).toBe(true);
  });

  it("filters idea, paused, retired, malformed and incomplete utilities", () => {
    const result = model([
      { ...tools[0], releaseDate: undefined, status: "idea" },
      releasedTool("paused-tool", "Paused Tool", "2026-07-11", "paused"),
      releasedTool("retired-tool", "Retired Tool", "2026-07-11", "retired"),
      { ...alphaTool, releaseDate: undefined },
      { ...betaTool, canonicalUrl: "https://www.youtoola.com/wrong-route" },
    ]);

    expect(result.tools).toEqual([]);
  });

  it("lists released utilities alphabetically and keeps internal fields private", () => {
    const result = model([betaTool, alphaTool]);

    expect(result.tools.map((tool) => tool.name)).toEqual(["Alpha Tool", "Beta Tool"]);
    expect(result.tools[0]).not.toHaveProperty("source");
    expect(result.tools[0]).not.toHaveProperty("monetisationTypes");
    expect(JSON.stringify(result)).not.toContain("fuel-trip-calculator");
  });

  it("uses release date then name for the two-tool homepage state", () => {
    const publicTools = model([alphaTool, betaTool]).tools;
    expect(selectHomepageTools(publicTools).map((tool) => tool.name)).toEqual([
      "Beta Tool",
      "Alpha Tool",
    ]);
  });

  it("publishes a category only at two tools with approved original copy", () => {
    const approvedContent = [
      {
        categoryId: "travel-mobility",
        introduction: "Original owner-approved category introduction.",
        ownerApproved: true as const,
      },
    ];

    const zero = buildPublicDiscoveryModel({
      approvedCategoryContent: approvedContent,
      categories,
      journeys: [],
      tools: [],
    });
    const one = buildPublicDiscoveryModel({
      approvedCategoryContent: approvedContent,
      categories,
      journeys: [],
      tools: [alphaTool],
    });
    const twoWithoutCopy = model([alphaTool, betaTool]);
    const two = buildPublicDiscoveryModel({
      approvedCategoryContent: approvedContent,
      categories,
      journeys: [],
      tools: [alphaTool, betaTool],
    });

    expect(zero.categories).toEqual([]);
    expect(one.categories).toEqual([]);
    expect(twoWithoutCopy.categories).toEqual([]);
    expect(two.categories).toHaveLength(1);
    expect(two.urls).toContain("https://www.youtoola.com/categories/travel-mobility");
  });

  it("publishes a journey only when two released tools fill two complete stages", () => {
    const completeJourney = {
      ...journeys[0],
      active: true,
      status: "active" as const,
      visibility: "public" as const,
      stages: [
        {
          ...journeys[0].stages[0],
          utilityEntityIds: [alphaTool.entityId],
          futureSlots: [],
        },
        {
          ...journeys[0].stages[1],
          utilityEntityIds: [betaTool.entityId],
          futureSlots: [],
        },
      ],
    };
    const approvedContent = [
      {
        guidance: "Original owner-approved journey guidance.",
        journeyId: completeJourney.id,
        ownerApproved: true as const,
      },
    ];

    const complete = buildPublicDiscoveryModel({
      approvedJourneyContent: approvedContent,
      categories,
      journeys: [completeJourney],
      tools: [alphaTool, betaTool],
    });
    const withFutureSlot = buildPublicDiscoveryModel({
      approvedJourneyContent: approvedContent,
      categories,
      journeys: [
        {
          ...completeJourney,
          stages: [
            ...completeJourney.stages.slice(0, 1),
            {
              ...completeJourney.stages[1],
              futureSlots: journeys[0].stages[1].futureSlots,
            },
          ],
        },
      ],
      tools: [alphaTool, betaTool],
    });

    expect(complete.journeys).toHaveLength(1);
    expect(complete.urls).toContain(
      "https://www.youtoola.com/journeys/road-trip-planning",
    );
    expect(withFutureSlot.journeys).toEqual([]);
  });

  it("generates deterministic public URLs without duplicates or internal routes", () => {
    const result = model([betaTool, alphaTool]);
    expect(result.urls).toEqual([
      "https://www.youtoola.com",
      "https://www.youtoola.com/tools",
      "https://www.youtoola.com/alpha-tool",
      "https://www.youtoola.com/beta-tool",
    ]);
    expect(result.urls.join(" ")).not.toContain("search");
    expect(result.urls.join(" ")).not.toContain("future");
  });

  it("emits no public link to an unavailable repository route", () => {
    for (const url of getPublicDiscoveryUrls()) {
      const pathname = new URL(url).pathname;
      const pagePath =
        pathname === "/"
          ? resolve(process.cwd(), "app/page.tsx")
          : resolve(process.cwd(), "app", pathname.slice(1), "page.tsx");
      expect(existsSync(pagePath), `${pathname} must have an App Router page`).toBe(true);
    }
  });
});
