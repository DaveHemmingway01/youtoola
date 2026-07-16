export type FuelTripType = "one-way" | "return";

export interface FuelTripCalculationInput {
  distanceKm: number;
  fuelConsumptionLitresPer100Km: number;
  fuelPricePerLitre: number;
  passengerCount: number;
  tollCost: number;
  tripType: FuelTripType;
}

export interface FuelTripCalculation {
  costPerPassenger: number;
  fuelCost: number;
  fuelRequiredLitres: number;
  journeyDistanceKm: number;
  totalTripCost: number;
}

export type FuelTripCalculationOutcome =
  | Readonly<{ ok: true; value: Readonly<FuelTripCalculation> }>
  | Readonly<{ code: FuelTripCalculationErrorCode; message: string; ok: false }>;

export type FuelTripCalculationErrorCode =
  | "invalid-distance"
  | "invalid-consumption"
  | "invalid-price"
  | "invalid-tolls"
  | "invalid-passengers"
  | "invalid-trip-type"
  | "non-finite-result";

function finite(value: number) {
  return Number.isFinite(value);
}

function failure(code: FuelTripCalculationErrorCode, message: string): FuelTripCalculationOutcome {
  return Object.freeze({ code, message, ok: false });
}

export function calculateFuelTrip(input: FuelTripCalculationInput): FuelTripCalculationOutcome {
  if (!finite(input.distanceKm) || input.distanceKm <= 0) {
    return failure("invalid-distance", "Distance must be a finite number greater than zero.");
  }
  if (!finite(input.fuelConsumptionLitresPer100Km) || input.fuelConsumptionLitresPer100Km <= 0) {
    return failure("invalid-consumption", "Fuel consumption must be a finite number greater than zero.");
  }
  if (!finite(input.fuelPricePerLitre) || input.fuelPricePerLitre < 0) {
    return failure("invalid-price", "Fuel price must be a finite number that is zero or greater.");
  }
  if (!finite(input.tollCost) || input.tollCost < 0) {
    return failure("invalid-tolls", "Toll cost must be a finite number that is zero or greater.");
  }
  if (!Number.isSafeInteger(input.passengerCount) || input.passengerCount < 1) {
    return failure("invalid-passengers", "Passenger count must be a positive whole number.");
  }
  if (input.tripType !== "one-way" && input.tripType !== "return") {
    return failure("invalid-trip-type", "Journey type must be one-way or return.");
  }

  const multiplier = input.tripType === "return" ? 2 : 1;
  const journeyDistanceKm = input.distanceKm * multiplier;
  const fuelRequiredLitres = (journeyDistanceKm * input.fuelConsumptionLitresPer100Km) / 100;
  const fuelCost = fuelRequiredLitres * input.fuelPricePerLitre;
  const totalTripCost = fuelCost + input.tollCost;
  const costPerPassenger = totalTripCost / input.passengerCount;
  const values = [journeyDistanceKm, fuelRequiredLitres, fuelCost, totalTripCost, costPerPassenger];

  if (values.some((value) => !finite(value))) {
    return failure("non-finite-result", "The entered values produce a result that is too large.");
  }

  return Object.freeze({
    ok: true,
    value: Object.freeze({
      costPerPassenger,
      fuelCost,
      fuelRequiredLitres,
      journeyDistanceKm,
      totalTripCost,
    }),
  });
}
