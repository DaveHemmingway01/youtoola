function validateDecimalPlaces(decimalPlaces: number) {
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 12) {
    throw new Error("Decimal places must be an integer between 0 and 12.");
  }
}

function roundScaledValue(value: number, decimalPlaces: number) {
  if (!Number.isFinite(value)) throw new Error("Value must be finite.");
  validateDecimalPlaces(decimalPlaces);
  const factor = 10 ** decimalPlaces;
  const scaled = value * factor;
  if (!Number.isFinite(scaled)) throw new Error("Scaled value must be finite.");
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(scaled)) * 4;
  return Math.sign(value || 1) * Math.round(Math.abs(scaled) + tolerance);
}

export function roundToDecimalPlaces(value: number, decimalPlaces: number) {
  return roundScaledValue(value, decimalPlaces) / 10 ** decimalPlaces;
}

export function toMinorUnits(value: number, decimalPlaces = 2) {
  const minorUnits = roundScaledValue(value, decimalPlaces);
  if (!Number.isSafeInteger(minorUnits)) throw new Error("Minor-unit value is not a safe integer.");
  return minorUnits;
}

export function fromMinorUnits(value: number, decimalPlaces = 2) {
  validateDecimalPlaces(decimalPlaces);
  if (!Number.isSafeInteger(value)) throw new Error("Minor-unit value must be a safe integer.");
  return value / 10 ** decimalPlaces;
}
