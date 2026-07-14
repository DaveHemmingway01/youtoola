import { describe, expect, it } from "vitest";

import { fromMinorUnits, roundToDecimalPlaces, toMinorUnits } from "@/lib/calculations/rounding";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/formatting/numbers";
import { convertDistance } from "@/lib/units/distance";

describe("calculation primitives", () => {
  it("rounds only at an explicit boundary", () => {
    expect(roundToDecimalPlaces(1.005, 2)).toBe(1.01);
    expect(roundToDecimalPlaces(-1.005, 2)).toBe(-1.01);
    expect(() => roundToDecimalPlaces(1, -1)).toThrow();
  });

  it("uses safe integer minor units for exact currency operations", () => {
    expect(toMinorUnits(10.25)).toBe(1025);
    expect(fromMinorUnits(1025)).toBe(10.25);
    expect(() => toMinorUnits(Number.MAX_SAFE_INTEGER)).toThrow();
  });

  it("converts distance through canonical metres", () => {
    expect(convertDistance(1, "mile", "kilometre")).toBeCloseTo(1.609344, 8);
    expect(convertDistance(5, "kilometre", "metre")).toBe(5000);
  });

  it("formats values using an explicit locale only after calculation", () => {
    expect(formatNumber(1234.5, { locale: "en-GB", minimumFractionDigits: 1 })).toBe("1,234.5");
    expect(formatCurrency(12.5, "GBP", "en-GB")).toBe("£12.50");
    expect(formatPercentage(0.125, "en-GB")).toBe("12.5%");
  });

  it("keeps ordinary synchronous primitives below the calculation budget", () => {
    const started = performance.now();
    for (let index = 0; index < 10_000; index += 1) {
      roundToDecimalPlaces(convertDistance(index, "mile", "kilometre"), 2);
    }
    expect(performance.now() - started).toBeLessThan(50);
  });
});
