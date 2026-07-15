import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import foundation from "../data/growth/foundation.json" with { type: "json" };
import dashboard from "../data/growth/dashboard.json" with { type: "json" };
import monitoring from "../data/growth/monitoring.json" with { type: "json" };
import {
  validateDashboardDefinitions,
  validateGrowthFoundationRecord,
  validateGrowthMonitoring,
} from "../lib/growth/validation.ts";
import { resolveGa4Configuration } from "../lib/analytics/ga4-configuration.ts";

const root = resolve(import.meta.dirname, "..");

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  });
}

const issues = [
  ...validateGrowthFoundationRecord(foundation),
  ...validateDashboardDefinitions(dashboard),
  ...validateGrowthMonitoring(monitoring),
];

const runtimeFiles = ["app", "components", "lib"].flatMap((directory) =>
  sourceFiles(join(root, directory)).filter((path) => /\.(ts|tsx)$/.test(path)),
);
for (const path of runtimeFiles) {
  if (path.endsWith("lib/analytics/ga4-adapter.ts")) continue;
  const source = readFileSync(path, "utf8");
  if (/window\.(?:gtag|dataLayer)|googletagmanager\.com/.test(source)) {
    issues.push(`provider-boundary:${path.slice(root.length + 1)}`);
  }
}

const currentConfiguration = resolveGa4Configuration(process.env);
for (const warning of currentConfiguration.warnings) console.warn(`Growth validation warning: ${warning}`);

if (issues.length > 0) {
  console.error(`Growth validation failed:\n  - ${issues.join("\n  - ")}`);
  process.exitCode = 1;
} else {
  console.log("Growth validation: PASS (dormant configuration, dashboard and monitoring definitions)");
}
