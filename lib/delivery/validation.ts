import { createHash } from "node:crypto";

import {
  APPROVED_BRANCH_FAMILIES,
  APPROVED_PRODUCTION_ORIGINS,
  EXPECTED_PUBLIC_PATHS,
  EXPECTED_SECURITY_HEADERS,
  EXPECTED_SITEMAP_URLS,
  EXPECTED_UNAVAILABLE_PATHS,
  FROZEN_BRAND_HASHES,
  classifyEnvironmentVariable,
  type ApprovedBranchFamily,
  // @ts-expect-error Node's strip-types execution requires the runtime extension.
} from "./contracts.ts";

const branchScope = "[a-z0-9]+(?:-[a-z0-9]+)*";
const approvedBranchPattern = new RegExp(
  `^(${APPROVED_BRANCH_FAMILIES.join("|")})/(${branchScope})$`,
);

export interface BranchValidationResult {
  family: ApprovedBranchFamily | null;
  issues: readonly string[];
  scope: string | null;
}

export function validateBranchName(branch: string): BranchValidationResult {
  if (branch === "main") {
    return { family: null, issues: [], scope: null };
  }

  const match = approvedBranchPattern.exec(branch);
  if (!match) {
    return { family: null, issues: ["branch:name"], scope: null };
  }

  return {
    family: match[1] as ApprovedBranchFamily,
    issues: [],
    scope: match[2],
  };
}

export function validateBranchPolicy(input: {
  branch: string;
  releaseKind?: "documentation-only" | "hotfix" | "normal";
  sourceBranch: string;
  sourceCommit: string;
}): string[] {
  const issues = [...validateBranchName(input.branch).issues];
  if (input.sourceBranch !== "origin/main") issues.push("branch:source");
  if (!/^[a-f0-9]{40}$/.test(input.sourceCommit)) {
    issues.push("branch:source-commit");
  }
  if (input.branch === "main") issues.push("branch:direct-main");
  if (input.releaseKind === "documentation-only" && !input.branch.startsWith("docs/")) {
    issues.push("branch:documentation-prefix");
  }
  if (input.releaseKind === "hotfix" && !input.branch.startsWith("hotfix/")) {
    issues.push("branch:hotfix-prefix");
  }
  if (input.branch.startsWith("hotfix/") && input.releaseKind !== "hotfix") {
    issues.push("branch:hotfix-kind");
  }
  return [...new Set(issues)].sort();
}

const releaseRecordCompletionPaths = [
  /^CHANGELOG\.md$/,
  /^docs\/operations\/release-validation\.md$/,
  /^docs\/releases\/[^/]+\.json$/,
  /^lib\/release\/[^/]+\.ts$/,
  /^scripts\/validate-release\.mjs$/,
  /^tests\/release\/[^/]+\.test\.ts$/,
] as const;

export function isReleaseRecordCompletionChange(
  branch: string,
  paths: readonly string[],
) {
  return (
    /^docs\/(?=[a-z0-9-]*release-record)[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      branch,
    ) &&
    paths.length > 0 &&
    paths.every((path) =>
      releaseRecordCompletionPaths.some((pattern) => pattern.test(path)),
    )
  );
}

export function validateEnvironmentVariableName(name: string): string[] {
  const classification = classifyEnvironmentVariable(name);
  if (classification === "unapproved") return ["environment-variable:name"];
  if (
    name.startsWith("NEXT_PUBLIC_") &&
    /(?:^|_)(?:SECRET|TOKEN|KEY)$/.test(name)
  ) {
    return ["environment-variable:public-secret"];
  }
  return [];
}

export interface SmokeResponse {
  body: Uint8Array;
  headers: Readonly<Record<string, string>>;
  status: number;
  url: string;
}

export type SmokeFetcher = (
  url: string,
  init?: Readonly<{ redirect?: "manual" }>,
) => Promise<SmokeResponse>;

export interface SmokeCheck {
  detail: string;
  id: string;
  passed: boolean;
}

export interface ProductionSmokeReport {
  checks: readonly SmokeCheck[];
  origin: string;
  passed: boolean;
  schemaVersion: 1;
}

function header(response: SmokeResponse, name: string) {
  return response.headers[name.toLowerCase()] ?? "";
}

function text(response: SmokeResponse) {
  return new TextDecoder().decode(response.body);
}

function canonicalFromHtml(html: string) {
  const match = html.match(
    /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
  );
  return match?.[1] ?? null;
}

function sitemapLocations(xml: string) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function check(
  checks: SmokeCheck[],
  id: string,
  passed: boolean,
  detail: string,
) {
  checks.push({ detail, id, passed });
}

export function assertApprovedSmokeOrigin(origin: string) {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error("Smoke origin must be a valid URL.");
  }

  if (
    !APPROVED_PRODUCTION_ORIGINS.includes(
      parsed.origin as (typeof APPROVED_PRODUCTION_ORIGINS)[number],
    ) ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(`Smoke origin is not approved: ${origin}`);
  }
  return parsed.origin;
}

export async function runProductionSmoke(
  fetcher: SmokeFetcher,
  requestedOrigin = "https://www.youtoola.com",
): Promise<ProductionSmokeReport> {
  const origin = assertApprovedSmokeOrigin(requestedOrigin);
  const canonicalOrigin = "https://www.youtoola.com";
  const checks: SmokeCheck[] = [];

  for (const path of EXPECTED_PUBLIC_PATHS) {
    const response = await fetcher(`${canonicalOrigin}${path}`);
    check(checks, `status:${path}`, response.status === 200, `HTTP ${response.status}`);
    const expectedCanonical =
      path === "/" ? canonicalOrigin : `${canonicalOrigin}${path}`;
    const actualCanonical = canonicalFromHtml(text(response));
    check(
      checks,
      `canonical:${path}`,
      actualCanonical === expectedCanonical,
      actualCanonical ?? "missing",
    );
    check(
      checks,
      `indexing:${path}`,
      !header(response, "x-robots-tag").toLowerCase().includes("noindex"),
      header(response, "x-robots-tag") || "absent",
    );
    if (path === "/") {
      for (const [name, expected] of Object.entries(EXPECTED_SECURITY_HEADERS)) {
        check(
          checks,
          `header:${name}`,
          header(response, name) === expected,
          header(response, name) || "missing",
        );
      }
      check(
        checks,
        "header:strict-transport-security",
        /^max-age=\d+/.test(header(response, "strict-transport-security")),
        header(response, "strict-transport-security") || "missing",
      );
    }
  }

  for (const path of EXPECTED_UNAVAILABLE_PATHS) {
    const response = await fetcher(`${canonicalOrigin}${path}`);
    check(checks, `unavailable:${path}`, response.status === 404, `HTTP ${response.status}`);
  }

  const apex = await fetcher("https://youtoola.com", { redirect: "manual" });
  const apexLocation = header(apex, "location");
  check(checks, "apex:status", apex.status === 308, `HTTP ${apex.status}`);
  check(
    checks,
    "apex:location",
    apexLocation === "https://www.youtoola.com/",
    apexLocation || "missing",
  );
  check(
    checks,
    "redirect:no-loop",
    apexLocation !== "https://youtoola.com/" && apexLocation !== "https://youtoola.com",
    apexLocation || "missing",
  );

  const robots = await fetcher(`${canonicalOrigin}/robots.txt`);
  const robotsText = text(robots);
  check(checks, "robots:status", robots.status === 200, `HTTP ${robots.status}`);
  for (const [id, expected] of [
    ["ordinary", "User-Agent: *\nAllow: /"],
    ["oai-search", "User-Agent: OAI-SearchBot\nAllow: /"],
    ["gptbot", "User-Agent: GPTBot\nDisallow: /"],
    ["sitemap", "Sitemap: https://www.youtoola.com/sitemap.xml"],
  ] as const) {
    check(checks, `robots:${id}`, robotsText.includes(expected), expected);
  }

  const sitemap = await fetcher(`${canonicalOrigin}/sitemap.xml`);
  const locations = sitemapLocations(text(sitemap));
  check(checks, "sitemap:status", sitemap.status === 200, `HTTP ${sitemap.status}`);
  check(
    checks,
    "sitemap:membership",
    JSON.stringify(locations) === JSON.stringify(EXPECTED_SITEMAP_URLS),
    JSON.stringify(locations),
  );

  for (const [path, expectedHash] of Object.entries(FROZEN_BRAND_HASHES)) {
    const response = await fetcher(`${canonicalOrigin}${path}`);
    const actualHash = createHash("sha256").update(response.body).digest("hex");
    check(checks, `brand-status:${path}`, response.status === 200, `HTTP ${response.status}`);
    check(checks, `brand-hash:${path}`, actualHash === expectedHash, actualHash);
  }

  return {
    checks,
    origin,
    passed: checks.every(({ passed }) => passed),
    schemaVersion: 1,
  };
}
