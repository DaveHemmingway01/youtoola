import { describe, expect, it } from "vitest";

import { assertStatusTransition, canTransitionStatus } from "@/lib/registry/transitions";

describe("Registry transition authority", () => {
  it("never lets automation advance status", () => {
    expect(canTransitionStatus("idea", "research", "automation")).toBe(false);
  });

  it("allows operator research work but reserves controlled states for the owner", () => {
    expect(canTransitionStatus("idea", "research", "operator")).toBe(true);
    expect(canTransitionStatus("planned", "approved", "operator")).toBe(false);
    expect(canTransitionStatus("planned", "approved", "owner")).toBe(true);
    expect(canTransitionStatus("released", "paused", "operator")).toBe(false);
    expect(canTransitionStatus("released", "paused", "owner")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(() => assertStatusTransition("idea", "released", "owner")).toThrow(
      "Status transition idea -> released is not permitted for owner.",
    );
  });
});
