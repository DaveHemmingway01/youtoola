export function roundToDecimalPlaces(value: number, decimalPlaces: number) {
  if (!Number.isFinite(value)) throw new Error("Value must be finite.");
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 12) {
    throw new Error("Decimal places must be an integer between 0 and 12.");
  }
  const factor = 10 ** decimalPlaces;
  const adjusted = value + Math.sign(value || 1) * Number.EPSILON;
  return Math.round(adjusted * factor) / factor;
}

export function toMinorUnits(value: number, decimalPlaces = 2) {
  const factor = 10 ** decimalPlaces;
  const minorUnits = Math.round((value + Math.sign(value || 1) * Number.EPSILON) * factor);
  if (!Number.isSafeInteger(minorUnits)) throw new Error("Minor-unit value is not a safe integer.");
  return minorUnits;
}

export function fromMinorUnits(value: number, decimalPlaces = 2) {
  if (!Number.isSafeInteger(value)) throw new Error("Minor-unit value must be a safe integer.");
  return value / 10 ** decimalPlaces;
}
