const HEADER_ALIASES = new Map([
  ["id", "sourceUtilityId"],
  ["utility id", "sourceUtilityId"],
  ["utility idea", "utilityName"],
  ["utility name", "utilityName"],
  ["name", "utilityName"],
  ["core use", "coreUse"],
  ["core purpose", "coreUse"],
  ["category", "category"],
  ["search intent", "searchIntent"],
  ["monetisation", "monetisationRoute"],
  ["monetization", "monetisationRoute"],
  ["monetisation route", "monetisationRoute"],
  ["monetization route", "monetisationRoute"],
  ["premium opportunity", "premiumOpportunity"],
  ["complexity", "complexity"],
  ["build complexity", "complexity"],
  ["priority", "priority"],
  ["priority tier", "priority"],
]);

const OPTIONAL_FIELDS = [
  "category",
  "searchIntent",
  "premiumOpportunity",
  "complexity",
];

const FORMULA_ERROR = /^#(?:REF!|VALUE!|N\/A|NAME\?|DIV\/0!|NUM!|NULL!)$/i;

export class SourceValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SourceValidationError";
    this.code = code;
  }
}

export function normalizeWhitespace(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ");
}

export function normalizeHeader(value) {
  return normalizeWhitespace(value)
    .toLocaleLowerCase("en")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveHeader(value) {
  return HEADER_ALIASES.get(normalizeHeader(value));
}

export function findHeaderRow(rows) {
  const candidates = rows.filter((row) => {
    const resolved = new Set(row.map(resolveHeader).filter(Boolean));
    return resolved.has("sourceUtilityId") && resolved.has("utilityName");
  });

  if (candidates.length === 0) {
    throw new SourceValidationError(
      "MISSING_REQUIRED_HEADERS",
      "No header row contains both a utility ID and utility name.",
    );
  }

  return candidates.at(-1);
}

export function normalizeSourceRow(headers, values) {
  if (!Array.isArray(headers) || headers.length === 0) {
    throw new SourceValidationError("MISSING_HEADERS", "The header row is empty.");
  }

  if (!Array.isArray(values) || values.every((value) => normalizeWhitespace(value) === "")) {
    throw new SourceValidationError("EMPTY_ROW", "The requested visible row is empty.");
  }

  const rawFields = {};
  const unknownFields = {};
  const normalized = {};
  const seen = new Map();
  const seenStable = new Map();

  headers.forEach((originalHeader, index) => {
    const heading = normalizeWhitespace(originalHeader);
    if (!heading) return;

    const normalizedHeading = normalizeHeader(heading);
    if (seen.has(normalizedHeading)) {
      throw new SourceValidationError(
        "DUPLICATE_HEADER",
        `Headers "${seen.get(normalizedHeading)}" and "${heading}" normalize to the same value.`,
      );
    }
    seen.set(normalizedHeading, heading);

    const value = normalizeWhitespace(values[index] ?? "");
    rawFields[heading] = value;

    if (FORMULA_ERROR.test(value)) {
      throw new SourceValidationError(
        "FORMULA_ERROR",
        `Field "${heading}" contains the formula error ${value}.`,
      );
    }

    const stableName = resolveHeader(heading);
    if (stableName) {
      if (seenStable.has(stableName)) {
        throw new SourceValidationError(
          "DUPLICATE_HEADER",
          `Headers "${seenStable.get(stableName)}" and "${heading}" map to "${stableName}".`,
        );
      }
      seenStable.set(stableName, heading);
      normalized[stableName] = value;
    } else {
      unknownFields[heading] = value;
    }
  });

  for (const required of ["sourceUtilityId", "utilityName"]) {
    if (!Object.hasOwn(normalized, required)) {
      throw new SourceValidationError(
        "MISSING_REQUIRED_HEADER",
        `The required normalized header "${required}" is missing.`,
      );
    }
    if (!normalized[required]) {
      throw new SourceValidationError(
        "MISSING_REQUIRED_VALUE",
        `The required value "${required}" is empty.`,
      );
    }
  }

  if (!/^[1-9]\d*$/.test(normalized.sourceUtilityId)) {
    throw new SourceValidationError(
      "MALFORMED_UTILITY_ID",
      `Utility ID "${normalized.sourceUtilityId}" must be a positive integer.`,
    );
  }

  const missingFields = OPTIONAL_FIELDS.filter(
    (field) => !Object.hasOwn(normalized, field) || normalized[field] === "",
  );

  return { rawFields, normalized, unknownFields, missingFields };
}
