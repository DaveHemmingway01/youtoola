import { readFileSync } from "node:fs";
import { join } from "node:path";

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
  validateReleaseRecordCompletionChange,
} from "@/lib/delivery/validation";

const phase10RecordPath = "docs/releases/2026-07-15-phase-10.json";

function factualPhase10Record(): Record<string, unknown> {
  return JSON.parse(
    readFileSync(join(process.cwd(), phase10RecordPath), "utf8"),
  ) as Record<string, unknown>;
}

describe("delivery contracts", () => {
  it("skips only strict evidence checks for utility pull requests", () => {
    const workflow = readFileSync(
      join(process.cwd(), ".github/workflows/foundation-ci.yml"),
      "utf8",
    );
    const rapidCondition = "if: ${{ !startsWith(github.head_ref, 'utility/') }}";

    expect(workflow.split(rapidCondition)).toHaveLength(3);
    expect(workflow).toContain("- name: Validate release contracts and evidence\n        " + rapidCondition);
    expect(workflow).toContain("- name: Validate delivery and environment operations\n        " + rapidCondition);
    expect(workflow).toContain("push:\n    branches:\n      - main");
    expect(workflow).not.toContain("if: ${{ startsWith(github.head_ref, 'platform/') }}");
    expect(workflow).not.toContain("if: ${{ startsWith(github.head_ref, 'hotfix/') }}");
  });

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

  it("accepts a factual completion without a recursive candidate record", () => {
    const changedPaths = [
      phase10RecordPath,
      "docs/operations/release-validation.md",
      "lib/delivery/validation.ts",
      "lib/release/validation.ts",
      "scripts/validate-delivery.mjs",
      "tests/delivery/contracts.test.ts",
      "tests/release/validation.test.ts",
    ];
    expect(
      isReleaseRecordCompletionChange(
        "docs/phase-10-release-record",
        changedPaths,
      ),
    ).toBe(true);
    expect(
      validateReleaseRecordCompletionChange({
        branch: "docs/phase-10-release-record",
        changedRecordPath: phase10RecordPath,
        completedRecord: factualPhase10Record(),
        now: new Date("2026-07-15T12:00:00Z"),
      }),
    ).toEqual([]);
  });

  it.each([
    "app/page.tsx",
    "components/card.tsx",
    "lib/environment.ts",
    ".env.example",
    "next.config.ts",
    "vercel.json",
    "public/brand/youtoola-logo.png",
    "package.json",
    "package-lock.json",
    "registry/utility-registry.ts",
    "knowledge/entities.ts",
    "lib/discovery/search.ts",
    "lib/seo/metadata.ts",
    "lib/analytics/runtime.ts",
    "lib/monetisation/runtime.ts",
    "lib/crawler-policy.ts",
    "app/sitemap.ts",
    "utilities/example/definition.ts",
  ])("rejects release-record exemption when %s changes", (unsafePath) => {
    expect(
      isReleaseRecordCompletionChange("docs/phase-10-release-record", [
        phase10RecordPath,
        unsafePath,
      ]),
    ).toBe(false);
  });

  it("requires exactly one completed record for the matching source release", () => {
    expect(
      isReleaseRecordCompletionChange("docs/phase-10-release-record", [
        "scripts/validate-release.mjs",
      ]),
    ).toBe(false);
    expect(
      isReleaseRecordCompletionChange("docs/phase-10-release-record", [
        phase10RecordPath,
        "docs/releases/2026-07-14-phase-9.json",
      ]),
    ).toBe(false);

    const malformed = factualPhase10Record();
    malformed.status = "candidate";
    expect(
      validateReleaseRecordCompletionChange({
        branch: "docs/phase-10-release-record",
        changedRecordPath: phase10RecordPath,
        completedRecord: malformed,
      }),
    ).toContain("release-completion:record-status");

    const mismatched = factualPhase10Record();
    mismatched.recordId = "2026-07-15-phase-9";
    expect(
      validateReleaseRecordCompletionChange({
        branch: "docs/phase-10-release-record",
        changedRecordPath: phase10RecordPath,
        completedRecord: mismatched,
      }),
    ).toContain("release-completion:source-release");
  });

  it("fails completion context for mismatched PR, rollback, or future review evidence", () => {
    const mismatchedPr = factualPhase10Record();
    (mismatchedPr.provenance as Record<string, unknown>).pullRequest =
      "https://github.com/DaveHemmingway01/youtoola/pull/999";
    expect(
      validateReleaseRecordCompletionChange({
        branch: "docs/phase-10-release-record",
        changedRecordPath: phase10RecordPath,
        completedRecord: mismatchedPr,
      }),
    ).toContain("release-completion:pull-request");

    const fabricatedRollback = factualPhase10Record();
    (fabricatedRollback.production as Record<string, unknown>).rollbackDeployment =
      "dpl_fabricated";
    expect(
      validateReleaseRecordCompletionChange({
        branch: "docs/phase-10-release-record",
        changedRecordPath: phase10RecordPath,
        completedRecord: fabricatedRollback,
      }),
    ).toContain("release-completion:rollback");

    const inventedReview = factualPhase10Record();
    const followUps = inventedReview.followUpReviews as Record<
      string,
      Record<string, unknown>
    >;
    followUps["24-hour"] = {
      ...followUps["24-hour"],
      completedDate: "2026-07-16",
      evidence: ["Invented future result."],
      status: "complete",
    };
    expect(
      validateReleaseRecordCompletionChange({
        branch: "docs/phase-10-release-record",
        changedRecordPath: phase10RecordPath,
        completedRecord: inventedReview,
        now: new Date("2026-07-15T12:00:00Z"),
      }),
    ).toContain("release-completion:future-follow-up:24-hour");
  });

  it("does not exempt an ordinary implementation branch without a candidate record", () => {
    expect(
      isReleaseRecordCompletionChange("platform/delivery-operations", [
        phase10RecordPath,
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
