import { createHash } from "node:crypto";

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortValue(child)]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}

export function createSourceHash({ schemaVersion, source, rawFields, normalized, unknownFields }) {
  const hashInput = {
    schemaVersion,
    source: {
      spreadsheetId: source.spreadsheetId,
      tabName: source.tabName,
      visibleRow: source.visibleRow,
    },
    rawFields,
    normalized,
    unknownFields,
  };

  return `sha256:${createHash("sha256").update(canonicalJson(hashInput), "utf8").digest("hex")}`;
}
