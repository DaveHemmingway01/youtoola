import { describe, expect, it } from "vitest";

import type { UtilityRegistryEntry } from "@/lib/registry/types";
import { validateUtilityDefinition } from "@/lib/utilities/definition-validation";
import { fuelTripFrameworkFixture } from "@/tests/fixtures/utilities/fuel-trip-framework";

describe("utility definition validation", () => {
  it("accepts the unclassified idea-stage framework fixture", () => {
    expect(validateUtilityDefinition(fuelTripFrameworkFixture)).toEqual([]);
  });

  it("rejects unknown registry references", () => {
    const unknown = { ...fuelTripFrameworkFixture, utilityId: "missing-utility" };
    expect(validateUtilityDefinition(unknown).map((issue) => issue.code)).toContain(
      "unknown-registry-reference",
    );
  });

  it("rejects unclassified public releases", () => {
    const releasedLookup = () => ({
      status: "released",
    }) as UtilityRegistryEntry;
    expect(
      validateUtilityDefinition(fuelTripFrameworkFixture, releasedLookup).map(
        (issue) => issue.code,
      ),
    ).toContain("unclassified-release");
  });

  it("rejects invalid versions, duplicate inputs and contradictory ranges", () => {
    const broken = {
      ...fuelTripFrameworkFixture,
      calculationVersion: 0,
      inputs: [
        { ...fuelTripFrameworkFixture.inputs[0], max: 1, min: 2 },
        fuelTripFrameworkFixture.inputs[0],
      ],
    };
    expect(validateUtilityDefinition(broken).map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["invalid-version", "calculation-version-mismatch", "invalid-input-range", "duplicate-input-id"]),
    );
  });
});
