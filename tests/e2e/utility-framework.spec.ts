import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const sizes = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

test("runs the neutral framework example without network or persistence", async ({ page }) => {
  await page.addInitScript(() => {
    let cumulativeLayoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
          cumulativeLayoutShift += (entry as PerformanceEntry & { value: number }).value;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
    Object.defineProperty(globalThis, "__readYoutoolaCls", {
      value: () => cumulativeLayoutShift,
    });
  });
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/design-system-review");
  const requestCount = requests.length;
  const initialUrl = page.url();
  const initialStorage = await page.evaluate(() => ({
    cookie: document.cookie,
    local: localStorage.length,
    session: sessionStorage.length,
  }));

  await page.getByLabel("Example quantity").fill("8");
  const interactionDuration = await page.getByRole("button", { name: "Calculate fictional estimate" }).evaluate(async (button: HTMLButtonElement) => {
    const started = performance.now();
    button.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    return performance.now() - started;
  });
  await expect(page.getByText("10 units", { exact: true })).toBeVisible();
  expect(interactionDuration).toBeLessThan(100);
  expect(requests).toHaveLength(requestCount);
  expect(page.url()).toBe(initialUrl);
  expect(await page.evaluate(() => ({
    cookie: document.cookie,
    local: localStorage.length,
    session: sessionStorage.length,
  }))).toEqual(initialStorage);
  expect(await page.evaluate(() => (globalThis as typeof globalThis & { __readYoutoolaCls: () => number }).__readYoutoolaCls())).toBeLessThanOrEqual(0.05);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Example quantity")).toBeFocused();
  await expect(page.getByText("10 units")).toHaveCount(0);
});

test("links the error summary to the invalid field", async ({ page }) => {
  await page.goto("/design-system-review");
  await page.getByRole("button", { name: "Calculate fictional estimate" }).click();
  const summary = page.locator(".error-summary").last();
  await expect(summary).toBeFocused();
  await summary.getByRole("link", { name: "Enter a quantity." }).click();
  await expect(page.getByLabel("Example quantity")).toBeFocused();
});

test("supports keyboard-only calculation completion", async ({ page }) => {
  await page.goto("/design-system-review");
  const input = page.getByLabel("Example quantity");
  await input.focus();
  await input.fill("4");
  await input.press("Enter");
  await expect(page.getByText("5 units", { exact: true })).toBeVisible();
});

for (const size of sizes) {
  test(`framework has no overflow at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/design-system-review");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  });
}

test("supports 200 percent text and has no serious accessibility violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/design-system-review");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
});

test("keeps the framework review private and Fuel Trip unavailable", async ({ page, request }) => {
  const response = await page.goto("/design-system-review");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  await expect(page.getByText("Fuel Trip Calculator")).toHaveCount(0);
  expect((await request.get("/fuel-trip-calculator")).status()).toBe(404);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap.match(/<loc>/g)).toHaveLength(2);
  expect(sitemap).not.toContain("fuel-trip-calculator");
});
