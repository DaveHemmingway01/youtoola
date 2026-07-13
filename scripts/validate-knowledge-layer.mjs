#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

// Run the dedicated TypeScript tests without adding a TypeScript runtime dependency.
const vitestBin = resolve(process.cwd(), "node_modules/vitest/vitest.mjs");
const result = spawnSync(
  process.execPath,
  [vitestBin, "run", "tests/knowledge"],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
