import type { RegistryStatus } from "./types";

export type TransitionActor = "owner" | "operator" | "automation";

const OWNER_CONTROLLED = new Set<RegistryStatus>([
  "approved",
  "building",
  "preview",
  "released",
  "paused",
  "retired",
]);

const ALLOWED_TRANSITIONS: Record<RegistryStatus, readonly RegistryStatus[]> = {
  idea: ["research", "paused"],
  research: ["idea", "planned", "paused"],
  planned: ["research", "approved", "paused"],
  approved: ["planned", "building", "paused"],
  building: ["approved", "preview", "paused"],
  preview: ["building", "released", "paused"],
  released: ["paused", "retired"],
  paused: ["idea", "research", "planned", "approved", "building", "preview", "released", "retired"],
  retired: [],
};

export function canTransitionStatus(
  from: RegistryStatus,
  to: RegistryStatus,
  actor: TransitionActor,
) {
  if (actor === "automation") return false;
  if (!ALLOWED_TRANSITIONS[from].includes(to)) return false;
  if ((OWNER_CONTROLLED.has(from) || OWNER_CONTROLLED.has(to)) && actor !== "owner") {
    return false;
  }
  return true;
}

export function assertStatusTransition(
  from: RegistryStatus,
  to: RegistryStatus,
  actor: TransitionActor,
) {
  if (!canTransitionStatus(from, to, actor)) {
    throw new Error(`Status transition ${from} -> ${to} is not permitted for ${actor}.`);
  }
}
