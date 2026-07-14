import { describe, expect, it } from "vitest";

import type { UtilityInputDefinition } from "@/lib/utilities/contracts";
import { parseNumberField, sortValidationIssues } from "@/lib/validation/utility-validation";

const input: UtilityInputDefinition = {
  errorMessages: {
    invalid: "Enter a number.",
    max: "Use 10 or less.",
    min: "Use 1 or more.",
    required: "Enter the value.",
  },
  id: "quantity",
  label: "Quantity",
  max: 10,
  min: 1,
  required: true,
  type: "number",
};

describe("utility validation", () => {
  it("parses finite values and rejects empty, malformed and out-of-range values", () => {
    expect(parseNumberField(input, "4.5")).toEqual({ ok: true, value: 4.5 });
    expect(parseNumberField(input, "")).toMatchObject({ ok: false, issue: { code: "required" } });
    expect(parseNumberField(input, "four")).toMatchObject({ ok: false, issue: { code: "invalid-number" } });
    expect(parseNumberField(input, "0")).toMatchObject({ ok: false, issue: { code: "minimum" } });
    expect(parseNumberField(input, "11")).toMatchObject({ ok: false, issue: { code: "maximum" } });
  });

  it("sorts field and cross-field issues deterministically", () => {
    const issues = sortValidationIssues(
      [
        { code: "form", message: "Form error" },
        { code: "second", fieldId: "second", message: "Second" },
        { code: "first", fieldId: "first", message: "First" },
      ],
      ["first", "second"],
    );
    expect(issues.map((issue) => issue.code)).toEqual(["first", "second", "form"]);
  });
});
