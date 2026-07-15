import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const clientRoots = ["app", "components"];
const forbiddenClientTokens = [
  "VERCEL_ENV",
  "YOUTOOLA_ENV",
  "YOUTOOLA_PROVIDER_TOKEN",
  "PRIVATE KEY-----",
] as const;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx", ".js", ".jsx"].includes(extname(path)) ? [path] : [];
  });
}

describe("client output boundary", () => {
  it("keeps representative server-only configuration and secret signatures out of client modules", () => {
    const violations = clientRoots
      .flatMap((directory) => sourceFiles(join(root, directory)))
      .flatMap((path) => {
        const source = readFileSync(path, "utf8");
        if (!/^\s*["']use client["'];/m.test(source)) return [];
        return forbiddenClientTokens
          .filter((token) => source.includes(token))
          .map((token) => `${relative(root, path)}:${token}`);
      });

    expect(violations).toEqual([]);
  });
});
