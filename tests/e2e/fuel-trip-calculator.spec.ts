import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const reviewPath = "/design-system-review/fuel-trip-calculator";
const publicPath = "/fuel-trip-calculator";

test("calculates privately without network, persistence or URL state", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const response = await page.goto(reviewPath);
  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  const requestCount = requests.length;
  const initialUrl = page.url();
  const initialStorage = await page.evaluate(() => ({
    cookie: document.cookie,
    local: localStorage.length,
    session: sessionStorage.length,
  }));

  await page.getByLabel("One-way trip distance").fill("200");
  await page.getByLabel("Fuel consumption").fill("6");
  await page.getByLabel("Fuel price per litre").fill("1.5");
  await page.getByLabel("Return").check();
  await page.getByLabel("Total toll cost").fill("12");
  await page.getByLabel("People sharing the cost").fill("3");
  await page.getByRole("button", { name: "Calculate trip cost" }).click();

  await expect(page.getByText("48.00", { exact: true })).toBeVisible();
  await expect(page.getByText("24 L", { exact: true })).toBeVisible();
  await expect(page.getByText("16.00", { exact: true })).toBeVisible();
  expect(requests).toHaveLength(requestCount);
  expect(page.url()).toBe(initialUrl);
  expect(await page.evaluate(() => ({
    cookie: document.cookie,
    local: localStorage.length,
    session: sessionStorage.length,
  }))).toEqual(initialStorage);
});

test("links invalid submission to the fields", async ({ page }) => {
  await page.goto(reviewPath);
  await page.getByRole("button", { name: "Calculate trip cost" }).click();
  const summary = page.locator(".error-summary");
  await expect(summary).toBeFocused();
  await summary.getByRole("link", { name: "Enter the one-way trip distance." }).click();
  await expect(page.getByLabel("One-way trip distance")).toBeFocused();
});

for (const size of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  test(`has no horizontal overflow at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto(publicPath);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  });
}

test("has no serious accessibility violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(publicPath);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
});

test("supports 200 percent text without overflow or serious accessibility violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(publicPath);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });

  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
});

test("publishes the canonical route in the sitemap while Preview stays noindexed", async ({ request }) => {
  const response = await request.get("/fuel-trip-calculator");
  expect(response.status()).toBe(200);
  expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://www.youtoola.com/fuel-trip-calculator");
});

test("public calculator remains browser-local and exposes no commercial capability", async ({ page }) => {
  const thirdPartyRequests: string[] = [];
  await page.goto("/fuel-trip-calculator");
  const origin = new URL(page.url()).origin;
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== origin) {
      thirdPartyRequests.push(request.url());
    }
  });
  await expect(page.getByRole("heading", { level: 1, name: "Fuel Trip Calculator" })).toBeVisible();
  await expect(page.getByText("Related tools")).toHaveCount(0);
  await expect(page.getByText(/affiliate|premium|advertisement/i)).toHaveCount(0);
  await expect(page.locator('script[src*="googletagmanager"], script[src*="google-analytics"]')).toHaveCount(0);
  expect(thirdPartyRequests).toEqual([]);
});
