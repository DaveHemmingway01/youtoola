import { describe, expect, it } from "vitest";

import {
  findHeaderRow,
  normalizeHeader,
  normalizeSourceRow,
  normalizeWhitespace,
} from "../../lib/sheets/normalization.mjs";

describe("Sheet header and row normalization", () => {
  it("normalizes Unicode, punctuation, whitespace and aliases", () => {
    expect(normalizeWhitespace("  Fuel\u00a0  Trip  ")).toBe("Fuel Trip");
    expect(normalizeHeader("  PRIORITY—TIER ")).toBe("priority tier");

    const result = normalizeSourceRow(
      ["Utility ID", "Utility Name", "Core purpose", "Monetization", "New Column"],
      ["21", "Fuel Trip Calculator", "Plan a trip", "Affiliates", "Keep me"],
    );

    expect(result.normalized).toMatchObject({
      sourceUtilityId: "21",
      utilityName: "Fuel Trip Calculator",
      coreUse: "Plan a trip",
      monetisationRoute: "Affiliates",
    });
    expect(result.unknownFields).toEqual({ "New Column": "Keep me" });
    expect(result.rawFields["New Column"]).toBe("Keep me");
  });

  it("finds the last valid header row without using column positions", () => {
    expect(
      findHeaderRow([
        ["Travel & Mobility"],
        ["ID", "Utility idea", "Core use"],
      ]),
    ).toEqual(["ID", "Utility idea", "Core use"]);
  });

  it.each([
    {
      name: "duplicate normalized headers",
      headers: ["ID", "Utility ID", "Utility idea"],
      values: ["21", "21", "Fuel Trip Calculator"],
      code: "DUPLICATE_HEADER",
    },
    {
      name: "missing utility name header",
      headers: ["ID", "Core use"],
      values: ["21", "Plan a trip"],
      code: "MISSING_REQUIRED_HEADER",
    },
    {
      name: "malformed utility ID",
      headers: ["ID", "Utility idea"],
      values: ["twenty-one", "Fuel Trip Calculator"],
      code: "MALFORMED_UTILITY_ID",
    },
    {
      name: "formula errors",
      headers: ["ID", "Utility idea", "Core use"],
      values: ["21", "Fuel Trip Calculator", "#REF!"],
      code: "FORMULA_ERROR",
    },
    {
      name: "empty rows",
      headers: ["ID", "Utility idea"],
      values: ["", ""],
      code: "EMPTY_ROW",
    },
  ])("rejects $name", ({ headers, values, code }) => {
    expect(() => normalizeSourceRow(headers, values)).toThrowError(
      expect.objectContaining({ code }),
    );
  });
});
