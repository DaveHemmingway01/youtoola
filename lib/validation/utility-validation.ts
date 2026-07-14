import type { UtilityInputDefinition } from "@/lib/utilities/contracts";

export type RawUtilityValue = boolean | string;
export type RawUtilityValues = Readonly<Record<string, RawUtilityValue>>;

export interface UtilityValidationIssue {
  code: string;
  fieldId?: string;
  message: string;
}

export type CrossFieldValidator<T> = (values: T) => readonly UtilityValidationIssue[];

export type ParsedField<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ issue: UtilityValidationIssue; ok: false }>;

export function parseNumberField(
  input: UtilityInputDefinition,
  rawValue: RawUtilityValue | undefined,
): ParsedField<number | undefined> {
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    if (input.required) {
      return {
        issue: {
          code: "required",
          fieldId: input.id,
          message: input.errorMessages.required ?? `${input.label} is required.`,
        },
        ok: false,
      };
    }
    return { ok: true, value: undefined };
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    return {
      issue: {
        code: "invalid-number",
        fieldId: input.id,
        message: input.errorMessages.invalid,
      },
      ok: false,
    };
  }
  if (input.min !== undefined && value < input.min) {
    return {
      issue: {
        code: "minimum",
        fieldId: input.id,
        message: input.errorMessages.min ?? `${input.label} is too small.`,
      },
      ok: false,
    };
  }
  if (input.max !== undefined && value > input.max) {
    return {
      issue: {
        code: "maximum",
        fieldId: input.id,
        message: input.errorMessages.max ?? `${input.label} is too large.`,
      },
      ok: false,
    };
  }
  return { ok: true, value };
}

export function sortValidationIssues(
  issues: readonly UtilityValidationIssue[],
  inputOrder: readonly string[],
) {
  const positions = new Map(inputOrder.map((id, index) => [id, index]));
  return [...issues].toSorted((left, right) => {
    const leftPosition = left.fieldId === undefined ? inputOrder.length : positions.get(left.fieldId);
    const rightPosition = right.fieldId === undefined ? inputOrder.length : positions.get(right.fieldId);
    return (leftPosition ?? inputOrder.length) - (rightPosition ?? inputOrder.length);
  });
}
