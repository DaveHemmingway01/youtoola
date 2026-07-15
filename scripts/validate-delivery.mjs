import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const deliveryUrl = pathToFileURL(
  join(root, "lib/delivery/validation.ts"),
).href;
const releaseUrl = pathToFileURL(join(root, "lib/release/validation.ts")).href;
const {
  isReleaseRecordCompletionChange,
  validateBranchPolicy,
  validateReleaseRecordCompletionChange,
} = await import(deliveryUrl);
const {
  getOverdueFollowUpReviews,
  validateCorrectionReferences,
  validateReleaseProvenanceHistory,
  validateReleaseRecord,
} = await import(releaseUrl);

function git(args, options = {}) {
  const output = execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.ignore ? "ignore" : ["ignore", "pipe", "pipe"],
  });
  return typeof output === "string" ? output.trim() : "";
}

function gitSucceeds(args) {
  try {
    git(args, { ignore: true });
    return true;
  } catch {
    return false;
  }
}

function releaseRecords() {
  const directory = join(root, "docs/releases");
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => ({
      path: join(directory, name),
      value: JSON.parse(readFileSync(join(directory, name), "utf8")),
    }));
}

function currentBranch() {
  return process.env.GITHUB_HEAD_REF || git(["branch", "--show-current"]);
}

const records = releaseRecords();
const issues = [];
const warnings = [];

const branch = currentBranch();
const changedPaths = branch === "main"
  ? []
  : [...new Set([
      git(["diff", "--name-only", "origin/main...HEAD"]),
      git(["diff", "--name-only"]),
      git(["diff", "--cached", "--name-only"]),
    ].flatMap((output) => output.split("\n").filter(Boolean)))];
const releaseRecordCompletion = isReleaseRecordCompletionChange(branch, changedPaths);
const phaseRecord = records.find(
  ({ value }) => value.status === "candidate" && value.delivery?.branch === branch,
);
if (branch !== "main") {
  if (phaseRecord) {
    issues.push(
      ...validateBranchPolicy({
        branch,
        releaseKind: phaseRecord.value.delivery.releaseKind,
        sourceBranch: phaseRecord.value.provenance.sourceBranch,
        sourceCommit: phaseRecord.value.provenance.sourceCommit,
      }),
    );
  } else if (releaseRecordCompletion) {
    const changedRecordPath = changedPaths.find((path) =>
      /^docs\/releases\/[^/]+\.json$/.test(path),
    );
    const completedRecord = records.find(
      ({ path }) => relative(root, path) === changedRecordPath,
    )?.value;
    const provenance =
      completedRecord &&
      completedRecord.provenance &&
      typeof completedRecord.provenance === "object" &&
      !Array.isArray(completedRecord.provenance)
        ? completedRecord.provenance
        : {};
    issues.push(
      ...validateBranchPolicy({
        branch,
        releaseKind: "documentation-only",
        sourceBranch: provenance.sourceBranch ?? "",
        sourceCommit: provenance.sourceCommit ?? "",
      }),
      ...validateReleaseRecordCompletionChange({
        branch,
        changedRecordPath: changedRecordPath ?? null,
        completedRecord,
      }),
    );
  } else {
    issues.push(`delivery:candidate-record-missing:${branch}`);
  }
}

for (const { path, value } of records) {
  for (const issue of validateReleaseRecord(value)) issues.push(`${path}:${issue}`);
  for (const issue of validateReleaseProvenanceHistory(value, {
    commitExists: (commit) => gitSucceeds(["cat-file", "-e", `${commit}^{commit}`]),
    isAncestor: (commit, ref) =>
      gitSucceeds(["merge-base", "--is-ancestor", commit, ref]),
    refExists: (ref) => gitSucceeds(["show-ref", "--verify", "--quiet", ref]),
  })) issues.push(`${path}:${issue}`);
  for (const review of getOverdueFollowUpReviews(value)) {
    warnings.push(`${path}:follow-up-overdue:${review}`);
  }
}

issues.push(...validateCorrectionReferences(records.map(({ value }) => value)));

if (process.argv.includes("--ship") && warnings.length > 0) {
  issues.push(...warnings.map((warning) => `ship-blocked:${warning}`));
}

if (warnings.length > 0) {
  console.warn(`Delivery warnings:\n  - ${warnings.join("\n  - ")}`);
}
if (issues.length > 0) {
  console.error(`Delivery validation failed:\n  - ${[...new Set(issues)].sort().join("\n  - ")}`);
  process.exitCode = 1;
} else {
  console.log(
    `Delivery validation: PASS (${records.length} release record${records.length === 1 ? "" : "s"}; branch ${branch})`,
  );
}
