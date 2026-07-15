import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const validationUrl = pathToFileURL(join(root, "lib/release/validation.ts")).href;
const { getOverdueFollowUpReviews, validateCorrectionReferences, validateGoldenVectorDocument, validateReleaseProvenanceHistory, validateReleaseRecord } = await import(validationUrl);

function valueFor(name) {
  const equals = process.argv.find((argument) => argument.startsWith(`${name}=`));
  if (equals) return equals.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function releaseRecordPaths() {
  const selected = valueFor("--record");
  if (selected) return [resolve(root, selected)];
  const directory = join(root, "docs/releases");
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(directory, name))
    .sort();
}

function validateRecords() {
  const paths = releaseRecordPaths();
  if (valueFor("--record") && paths.some((path) => !existsSync(path))) throw new Error(`Release record not found: ${paths.find((path) => !existsSync(path))}`);
  const failures = [];
  const records = [];
  const warnings = [];
  for (const path of paths) {
    const record = readJson(path);
    records.push(record);
    const issues = validateReleaseRecord(record);
    for (const period of getOverdueFollowUpReviews(record)) {
      warnings.push(`${path}: follow-up overdue: ${period}`);
    }
    issues.push(...validateReleaseProvenanceHistory(record, {
      commitExists: (commit) => gitSucceeds(["cat-file", "-e", `${commit}^{commit}`]),
      isAncestor: (commit, ref) => gitSucceeds(["merge-base", "--is-ancestor", commit, ref]),
      refExists: (ref) => gitSucceeds(["show-ref", "--verify", "--quiet", ref]),
    }));
    if (issues.length) failures.push(`${path}:\n  - ${issues.join("\n  - ")}`);
  }
  const correctionIssues = validateCorrectionReferences(records);
  if (correctionIssues.length) failures.push(`Release correction references:\n  - ${correctionIssues.join("\n  - ")}`);
  if (failures.length) throw new Error(failures.join("\n"));
  return `${paths.length} release record${paths.length === 1 ? "" : "s"}${warnings.length ? `; warnings: ${warnings.join(" | ")}` : ""}`;
}

function gitSucceeds(args) {
  try {
    execFileSync("git", args, { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function validateUtility() {
  const slug = valueFor("--slug");
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("validate:utility requires --slug=<lowercase-kebab-case-slug>.");
  const definition = join(root, "utilities", slug, "definition.ts");
  const specification = join(root, "docs/utilities", `${slug}.md`);
  const vectors = join(root, "tests/fixtures/utilities", slug, "golden-vectors.json");
  for (const path of [definition, specification, vectors]) if (!existsSync(path)) throw new Error(`Required utility release file is missing: ${path}`);
  const issues = validateGoldenVectorDocument(readJson(vectors));
  if (issues.length) throw new Error(`${vectors}:\n  - ${issues.join("\n  - ")}`);
  return `utility ${slug}`;
}

const secretPatterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Stripe live secret", /\bsk_live_[0-9A-Za-z]{16,}\b/],
  ["Production measurement ID", /\bG-[A-Z0-9]{8,}\b/],
];

function scanSecrets() {
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean);
  const issues = [];
  const ignoredExtensions = new Set([".png", ".jpg", ".jpeg", ".ico", ".woff", ".woff2", ".pdf"]);
  for (const relative of tracked) {
    if (/^\.env(?:\.|$)/.test(relative) && relative !== ".env.example") issues.push(`${relative}: tracked environment file`);
    if (ignoredExtensions.has(extname(relative).toLowerCase())) continue;
    const path = join(root, relative);
    const source = readFileSync(path, "utf8");
    for (const [label, pattern] of secretPatterns) if (pattern.test(source)) issues.push(`${relative}: ${label}`);
  }
  if (issues.length) throw new Error(`Secret scan failed:\n  - ${issues.join("\n  - ")}`);
  return `${tracked.length} tracked files scanned`;
}

const summaries = [];
try {
  if (process.argv.includes("--secret-scan")) summaries.push(`Secret scan: PASS (${scanSecrets()})`);
  else if (process.argv.includes("--utility")) summaries.push(`Utility validation: PASS (${validateUtility()})`);
  else summaries.push(`Release validation: PASS (${validateRecords()})`);
  const output = summaries.join("\n");
  console.log(output);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Youtoola release evidence\n\n${output}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
