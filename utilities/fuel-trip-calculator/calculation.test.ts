import { describe, expect, it } from "vitest";

import { calculateFuelTrip, type FuelTripCalculationInput } from "./calculation";

const validInput: FuelTripCalculationInput = {
  distanceKm: 200,
  fuelConsumptionLitresPer100Km: 6,
  fuelPricePerLitre: 1.5,
  passengerCount: 3,
  tollCost: 12,
  tripType: "return",
};

describe("Fuel Trip Calculator", () => {
  it("calculates a return trip, keeps tolls whole-journey, and splits the total", () => {
    expect(calculateFuelTrip(validInput)).toEqual({
      ok: true,
      value: {
        costPerPassenger: 16,
        fuelCost: 36,
        fuelRequiredLitres: 24,
        journeyDistanceKm: 400,
        totalTripCost: 48,
      },
    });
  });

  it("does not double one-way distance or the entered toll amount", () => {
    expect(calculateFuelTrip({ ...validInput, tripType: "one-way" })).toEqual({
      ok: true,
      value: {
        costPerPassenger: 10,
        fuelCost: 18,
        fuelRequiredLitres: 12,
        journeyDistanceKm: 200,
        totalTripCost: 30,
      },
    });
  });

  it("accepts zero consumption, price, and toll without inventing a cost", () => {
    expect(calculateFuelTrip({
      ...validInput,
      fuelConsumptionLitresPer100Km: 0,
      fuelPricePerLitre: 0,
      passengerCount: 1,
      tollCost: 0,
      tripType: "one-way",
    })).toMatchObject({
      ok: true,
      value: { costPerPassenger: 0, fuelCost: 0, fuelRequiredLitres: 0, totalTripCost: 0 },
    });
  });

  it.each([
    [{ ...validInput, distanceKm: 0 }, "invalid-distance"],
    [{ ...validInput, distanceKm: Number.NaN }, "invalid-distance"],
    [{ ...validInput, fuelConsumptionLitresPer100Km: -1 }, "invalid-consumption"],
    [{ ...validInput, fuelPricePerLitre: -0.01 }, "invalid-price"],
    [{ ...validInput, tollCost: -0.01 }, "invalid-tolls"],
    [{ ...validInput, passengerCount: 0 }, "invalid-passengers"],
    [{ ...validInput, passengerCount: 1.5 }, "invalid-passengers"],
  ] as const)("rejects invalid bounded input with %s", (input, code) => {
    expect(calculateFuelTrip(input)).toMatchObject({ code, ok: false });
  });

  it("fails explicitly when finite inputs overflow the derived result", () => {
    expect(calculateFuelTrip({
      ...validInput,
      distanceKm: Number.MAX_VALUE,
      fuelConsumptionLitresPer100Km: 2,
      tripType: "return",
    })).toMatchObject({ code: "non-finite-result", ok: false });
  });
});
