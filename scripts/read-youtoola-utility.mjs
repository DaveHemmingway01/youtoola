#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

import { SheetReadError, readYoutoolaOpportunity } from "../lib/sheets/retrieval.mjs";

function parseArguments(argumentsList) {
  const options = {};
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (!argument.startsWith("--")) {
      throw new SheetReadError("UNKNOWN_ARGUMENT", 2, `Unknown argument "${argument}".`);
    }
    const key = argument.slice(2);
    const value = argumentsList[index + 1];
    if (!value || value.startsWith("--")) {
      throw new SheetReadError("MISSING_ARGUMENT_VALUE", 2, `--${key} requires a value.`);
    }
    options[key] = value;
    index += 1;
  }
  return options;
}

async function main() {
  const argumentsMap = parseArguments(process.argv.slice(2));
  const row = Number(argumentsMap.row);
  const result = await readYoutoolaOpportunity({
    tab: argumentsMap.tab,
    row,
    expectName: argumentsMap["expect-name"],
    transport: argumentsMap.transport ?? "auto",
  });
  const json = `${JSON.stringify(result, null, 2)}\n`;

  if (argumentsMap.out) {
    try {
      await writeFile(argumentsMap.out, json, { encoding: "utf8", flag: "wx" });
      process.stderr.write(`Wrote ${argumentsMap.out}\n`);
    } catch (error) {
      throw new SheetReadError(
        "OUTPUT_WRITE_FAILURE",
        9,
        `Could not write --out file "${argumentsMap.out}" without overwriting an existing file.`,
        error,
      );
    }
  }

  process.stdout.write(json);
}

main().catch((error) => {
  const known = error instanceof SheetReadError;
  const code = known ? error.code : "UNEXPECTED_FAILURE";
  const exitCode = known ? error.exitCode : 1;
  const message = known ? error.message : "Unexpected retrieval failure.";
  process.stderr.write(`[${code}] ${message}\n`);
  process.exitCode = exitCode;
});
