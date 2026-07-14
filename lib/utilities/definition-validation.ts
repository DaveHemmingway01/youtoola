import { getToolById } from "@/lib/registry";
import type { UtilityRegistryEntry } from "@/lib/registry/types";

import type { UtilityDefinition } from "./contracts";

export interface DefinitionIssue {
  code: string;
  message: string;
  path: string;
}

type RegistryLookup = (utilityId: string) => UtilityRegistryEntry | undefined;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function positiveInteger(value: number) {
  return Number.isInteger(value) && value > 0;
}

export function validateUtilityDefinition(
  definition: UtilityDefinition,
  lookup: RegistryLookup = getToolById,
): readonly DefinitionIssue[] {
  const issues: DefinitionIssue[] = [];
  const registryEntry = lookup(definition.utilityId);

  if (!registryEntry) {
    issues.push({
      code: "unknown-registry-reference",
      message: `Unknown utility registry reference: ${definition.utilityId}.`,
      path: "utilityId",
    });
  }

  for (const [key, value] of [
    ["calculationVersion", definition.calculationVersion],
    ["methodologyVersion", definition.methodologyVersion],
    ["contentVersion", definition.contentVersion],
  ] as const) {
    if (!positiveInteger(value)) {
      issues.push({
        code: "invalid-version",
        message: `${key} must be a positive integer.`,
        path: key,
      });
    }
  }

  if (!DATE_PATTERN.test(definition.reviewedDate)) {
    issues.push({
      code: "invalid-reviewed-date",
      message: "reviewedDate must use YYYY-MM-DD.",
      path: "reviewedDate",
    });
  }

  if (definition.methodologyVersion !== definition.methodology.methodologyVersion) {
    issues.push({
      code: "methodology-version-mismatch",
      message: "Definition and methodology versions must match.",
      path: "methodologyVersion",
    });
  }

  if (definition.calculationVersion !== definition.methodology.calculationVersion) {
    issues.push({
      code: "calculation-version-mismatch",
      message: "Definition and methodology calculation versions must match.",
      path: "calculationVersion",
    });
  }

  const ids = new Set<string>();
  definition.inputs.forEach((input, index) => {
    if (ids.has(input.id)) {
      issues.push({
        code: "duplicate-input-id",
        message: `Duplicate input ID: ${input.id}.`,
        path: `inputs.${index}.id`,
      });
    }
    ids.add(input.id);
    if (input.min !== undefined && input.max !== undefined && input.min > input.max) {
      issues.push({
        code: "invalid-input-range",
        message: `${input.id} has a minimum greater than its maximum.`,
        path: `inputs.${index}`,
      });
    }
  });

  if (registryEntry?.status === "released" && definition.riskProfile === "unclassified") {
    issues.push({
      code: "unclassified-release",
      message: "A released utility cannot use the unclassified risk profile.",
      path: "riskProfile",
    });
  }

  if (registryEntry?.status === "released" && definition.reviewAuthority !== "Youtoola owner") {
    issues.push({
      code: "unsafe-review-authority",
      message: "A released utility requires Youtoola owner approval.",
      path: "reviewAuthority",
    });
  }

  return Object.freeze(issues);
}
