import { describe, expect, it } from "vitest";

import {
  ENVIRONMENT_POLICIES,
  FROZEN_BRAND_HASHES,
  INFORMATIONAL_CHECKS,
  REQUIRED_CHECKS,
  classifyEnvironmentVariable,
} from "@/lib/delivery/contracts";
import {
  isReleaseRecordCompletionChange,
  validateBranchName,
  validateBranchPolicy,
  validateEnvironmentVariableName,
} from "@/lib/delivery/validation";

describe("delivery contracts", () => {
  it.each([
    "platform/delivery-operations",
    "utility/fuel-trip-calculator",
    "docs/phase-10-release-record",
    "hotfix/canonical-loop",
  ])("accepts approved branch %s", (branch) => {
    expect(validateBranchName(branch).issues).toEqual([]);
  });

  it.each([
    "feature/example",
    "brand/foundation-assets",
    "fix/canonical-loop",
    "platform/Delivery-Operations",
    "platform/delivery_operations",
    "platform/delivery operations",
    "platform/-delivery",
    "utility/Fuel-Trip-Calculator",
    "hotfix/",
  ])("rejects invalid branch %s", (branch) => {
    expect(validateBranchName(branch).issues).toContain("branch:name");
  });

  it("requires origin/main and aligns documentation and hotfix kinds", () => {
    expect(
      validateBranchPolicy({
        branch: "docs/release-record",
        releaseKind: "documentation-only",
        sourceBranch: "origin/main",
        sourceCommit: "a".repeat(40),
      }),
    ).toEqual([]);
    expect(
      validateBranchPolicy({
        branch: "platform/release-record",
        releaseKind: "documentation-only",
        sourceBranch: "platform/release-gates",
        sourceCommit: "bad",
      }),
    ).toEqual(
      expect.arrayContaining([
        "branch:documentation-prefix",
        "branch:source",
        "branch:source-commit",
      ]),
    );
  });

  it("keeps the three deployment checks required and Preview Comments informational", () => {
    expect(REQUIRED_CHECKS).toEqual(["Quality", "End-to-end", "Vercel"]);
    expect(INFORMATIONAL_CHECKS).toEqual(["Vercel Preview Comments"]);
  });

  it("limits candidate-record exemption to narrow release-record completion branches", () => {
    expect(
      isReleaseRecordCompletionChange("docs/phase-10-release-record", [
        "docs/releases/2026-07-15-phase-10.json",
        "CHANGELOG.md",
      ]),
    ).toBe(true);
    expect(
      isReleaseRecordCompletionChange("docs/phase-10-release-record", [
        "docs/releases/2026-07-15-phase-10.json",
        "app/page.tsx",
      ]),
    ).toBe(false);
    expect(
      isReleaseRecordCompletionChange("platform/delivery-operations", [
        "docs/releases/2026-07-15-phase-10.json",
      ]),
    ).toBe(false);
  });

  it("fails Preview closed and permits providers only in Production", () => {
    expect(ENVIRONMENT_POLICIES.preview).toEqual({
      indexing: false,
      productionProviders: false,
      reviewRoutes: true,
    });
    expect(ENVIRONMENT_POLICIES.production).toEqual({
      indexing: true,
      productionProviders: true,
      reviewRoutes: false,
    });
  });

  it("classifies server, public and secret variable names without public secrets", () => {
    expect(classifyEnvironmentVariable("YOUTOOLA_FEATURE_MODE")).toBe("server-only");
    expect(classifyEnvironmentVariable("YOUTOOLA_PROVIDER_TOKEN")).toBe("secret");
    expect(classifyEnvironmentVariable("NEXT_PUBLIC_YOUTOOLA_SAFE_LABEL")).toBe("browser-safe-public");
    expect(classifyEnvironmentVariable("NEXT_PUBLIC_YOUTOOLA_API_KEY")).toBe("unapproved");
    expect(validateEnvironmentVariableName("NEXT_PUBLIC_YOUTOOLA_API_KEY")).toContain("environment-variable:name");
    expect(validateEnvironmentVariableName("PUBLIC_VENDOR_ID")).toContain("environment-variable:name");
  });

  it("contains exactly the 14 frozen Production brand assets", () => {
    expect(Object.keys(FROZEN_BRAND_HASHES)).toHaveLength(14);
  });
});
