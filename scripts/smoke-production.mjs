import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const validationUrl = pathToFileURL(
  resolve(root, "lib/delivery/validation.ts"),
).href;
const { runProductionSmoke } = await import(validationUrl);

function valueFor(name) {
  const equals = process.argv.find((argument) => argument.startsWith(`${name}=`));
  if (equals) return equals.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function fetchSmokeResponse(url, init = {}) {
  const response = await fetch(url, {
    redirect: init.redirect ?? "follow",
    signal: AbortSignal.timeout(15_000),
  });
  return {
    body: new Uint8Array(await response.arrayBuffer()),
    headers: Object.fromEntries(
      [...response.headers.entries()].map(([name, value]) => [
        name.toLowerCase(),
        value,
      ]),
    ),
    status: response.status,
    url: response.url,
  };
}

function renderHuman(report) {
  return [
    `Youtoola Production smoke: ${report.passed ? "PASS" : "FAIL"}`,
    `Origin: ${report.origin}`,
    ...report.checks.map(
      ({ detail, id, passed }) =>
        `${passed ? "PASS" : "FAIL"} ${id}: ${detail}`,
    ),
  ].join("\n");
}

try {
  const report = await runProductionSmoke(
    fetchSmokeResponse,
    valueFor("--origin") ?? "https://www.youtoola.com",
  );
  console.log(
    process.argv.includes("--json")
      ? JSON.stringify(report, null, 2)
      : renderHuman(report),
  );
  if (!report.passed) process.exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
