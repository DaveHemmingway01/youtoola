import { expect, test } from "@playwright/test";

test("keeps Local and Preview provider-free across client navigation", async ({ page }) => {
  const providerRequests: string[] = [];
  page.on("request", (request) => {
    if (/googletagmanager|google-analytics/i.test(request.url())) providerRequests.push(request.url());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Optional analytics" })).toHaveCount(0);
  await page.getByRole("link", { name: "Browse the tool directory" }).click();
  await expect(page).toHaveURL(/\/tools$/);
  expect(providerRequests).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).not.toContain("youtoola_consent");
});

test("keeps Production-only analytics variables out of the Preview client", async ({ page }) => {
  await page.goto("/");
  const html = await page.content();
  expect(html).not.toMatch(/G-[A-Z0-9]{4,20}/);
  expect(html).not.toMatch(/googletagmanager|google-analytics/i);
});
