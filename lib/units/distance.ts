export type DistanceUnit = "kilometre" | "metre" | "mile";

const METRES_PER_MILE = 1609.344;
const METRES_PER_KILOMETRE = 1000;

export function distanceToMetres(value: number, unit: DistanceUnit) {
  if (!Number.isFinite(value)) throw new Error("Distance must be finite.");
  if (unit === "metre") return value;
  if (unit === "kilometre") return value * METRES_PER_KILOMETRE;
  return value * METRES_PER_MILE;
}

export function metresToDistance(value: number, unit: DistanceUnit) {
  if (!Number.isFinite(value)) throw new Error("Distance must be finite.");
  if (unit === "metre") return value;
  if (unit === "kilometre") return value / METRES_PER_KILOMETRE;
  return value / METRES_PER_MILE;
}

export function convertDistance(value: number, from: DistanceUnit, to: DistanceUnit) {
  return metresToDistance(distanceToMetres(value, from), to);
}
