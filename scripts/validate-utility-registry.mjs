#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

// Registry validation is executed through Vitest/TypeScript in CI. This wrapper
// runs the dedicated test file without adding a TypeScript runtime dependency.
const vitestBin = resolve(process.cwd(), "node_modules/vitest/vitest.mjs");
const result = spawnSync(
  process.execPath,
  [vitestBin, "run", "tests/registry/registry.test.ts"],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
