import { chromium } from "@playwright/test";

const origin = process.env.YOUTOOLA_GROWTH_SMOKE_ORIGIN ?? "https://www.youtoola.com";
const activeVerification = process.env.YOUTOOLA_GROWTH_SMOKE_ACTIVE === "true";
const providerPattern = /googletagmanager\.com|google-analytics\.com/i;

function assertion(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const providerRequests = [];
    page.on("request", (request) => {
      if (providerPattern.test(request.url())) providerRequests.push(request.url());
    });

    await page.goto(origin, { waitUntil: "networkidle" });
    assertion(providerRequests.length === 0, "A provider request occurred before consent.");
    assertion((await context.cookies()).every((cookie) => !cookie.name.startsWith("_ga")), "A GA cookie existed before consent.");

    if (!activeVerification) {
      assertion(await page.getByRole("heading", { name: "Optional analytics" }).count() === 0, "Dormant analytics unexpectedly exposed a consent notice.");
      console.log(JSON.stringify({ checks: ["pre-consent-silence", "dormant-provider-free"], origin, passed: true }, null, 2));
      return;
    }

    assertion(origin === "https://www.youtoola.com", "Active verification is restricted to the canonical Production origin.");
    await page.getByRole("button", { name: "Reject" }).click();
    assertion(providerRequests.length === 0, "Reject triggered a provider request.");
    assertion(
      (await context.cookies()).some(
        (cookie) => cookie.name === "youtoola_consent" &&
          (cookie.value === "v1%3Adenied" || cookie.value === "v1:denied"),
      ),
      "Reject did not persist the denied preference.",
    );

    await context.clearCookies();
    await page.reload({ waitUntil: "networkidle" });
    const providerLoad = page.waitForRequest((request) => /googletagmanager\.com\/gtag\/js/.test(request.url()));
    await page.getByRole("button", { name: "Accept analytics" }).click();
    await providerLoad;
    assertion(providerRequests.filter((url) => /googletagmanager\.com\/gtag\/js/.test(url)).length === 1, "The provider script did not load exactly once.");
    assertion(providerRequests.every((url) => !/[?#].*(?:raw|input|result|referrer)=/i.test(url)), "A prohibited value appeared in provider requests.");

    console.log(JSON.stringify({ checks: ["pre-consent-silence", "reject-silence", "single-provider-load", "approved-request-shape"], origin, passed: true }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
