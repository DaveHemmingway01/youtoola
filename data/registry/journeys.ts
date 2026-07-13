import type { JourneyRecord } from "@/lib/registry/types";
import { KNOWLEDGE_SCHEMA_VERSION } from "@/lib/knowledge/schema-version";

export const journeys: readonly JourneyRecord[] = [
  {
    knowledgeSchemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    id: "road-trip-planning",
    entityId: "journey:road-trip-planning",
    name: "Road Trip Planning",
    aliases: ["car trip planning"],
    definition: "An internal planning journey for understanding practical road-trip decisions and costs.",
    objective: "Help a traveller plan and understand the practical costs of a road trip.",
    targetAudience: "People considering or planning travel by road.",
    entryQuestions: [
      "How far is the trip?",
      "What might the journey cost?",
      "Which additional road-trip costs should be considered?",
    ],
    stages: [
      {
        stageId: "route",
        position: 1,
        name: "Establish the route",
        purpose: "Understand the route distance before evaluating travel costs.",
        utilityEntityIds: [],
        futureSlots: [
          {
            workingLabel: "Route distance",
            purpose: "Establish the distance of the planned route.",
            stagePosition: 1,
            rationale: "Trip-cost planning depends on understanding the journey distance.",
            expectedCapability: "Determine or accept a route distance.",
            status: "future",
          },
        ],
      },
      {
        stageId: "trip-cost",
        position: 2,
        name: "Estimate trip cost",
        purpose: "Consider approved cost components for the planned road trip.",
        utilityEntityIds: ["utility:fuel-trip-calculator"],
        futureSlots: [
          {
            workingLabel: "Toll cost",
            purpose: "Consider toll charges separately where needed.",
            stagePosition: 2,
            rationale: "Tolls are an approved component of the Fuel Trip Calculator source description.",
            expectedCapability: "Estimate toll charges without implying live toll data exists.",
            status: "future",
          },
          {
            workingLabel: "EV charging cost",
            purpose: "Plan charging costs for an electric-vehicle journey.",
            stagePosition: 2,
            rationale: "Electric-vehicle travel may require a distinct cost path in a future approved utility.",
            expectedCapability: "Estimate charging cost using separately approved inputs.",
            status: "unapproved",
          },
          {
            workingLabel: "Vehicle running cost",
            purpose: "Consider broader vehicle costs beyond the immediate trip inputs.",
            stagePosition: 2,
            rationale: "A broader running-cost view may support a later road-travel decision.",
            expectedCapability: "Estimate approved vehicle operating costs.",
            status: "unapproved",
          },
        ],
      },
      {
        stageId: "impact",
        position: 3,
        name: "Review trip impact",
        purpose: "Support optional future review of non-price trip impacts.",
        utilityEntityIds: [],
        futureSlots: [
          {
            workingLabel: "Trip carbon estimation",
            purpose: "Estimate trip emissions using a separately approved methodology.",
            stagePosition: 3,
            rationale: "Some travellers may want to compare environmental impact after planning cost.",
            expectedCapability: "Estimate emissions only from approved sources and methodology.",
            status: "unapproved",
          },
        ],
      },
    ],
    categoryEntityIds: ["category:travel-mobility"],
    commercialOpportunityTypes: [
      "fuel affiliates",
      "rental-car affiliates",
      "travel affiliates",
    ],
    owner: "Youtoola owner",
    status: "provisional",
    active: false,
    visibility: "internal",
    displayOrder: 1,
    reviewedDate: "2026-07-13",
    sourceIds: ["source:google-sheet-youtoola-map"],
  },
];
