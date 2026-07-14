import { expect, test } from "@playwright/test";

test("renders the Youtoola foundation with safe Preview metadata", async ({
  page,
}) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Useful tools. No account. No nonsense.",
    }),
  ).toBeVisible();

  await expect(page).toHaveTitle(/Youtoola/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.youtoola.com",
  );
  await expect(page.locator('link[rel="icon"][href="/brand/favicon.ico"]')).toHaveCount(1);
  await expect(
    page.locator('link[rel="apple-touch-icon"][href="/brand/apple-touch-icon.png"]'),
  ).toHaveAttribute("sizes", "180x180");
});

test("returns the custom not-found page with a 404 status", async ({ page }) => {
  const response = await page.goto("/missing-foundation-route");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "That page does not exist." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to the homepage" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  const robotsDirectives = await page
    .locator('meta[name="robots"]')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("content")));
  expect(robotsDirectives).not.toHaveLength(0);
  expect(robotsDirectives.every((directive) => directive?.includes("noindex"))).toBe(true);
  await expect(page.locator('script[type="application/ld\+json"]')).toHaveCount(0);
  const recoveryLinkSize = await page
    .getByRole("link", { name: "Go to the homepage" })
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { height: rect.height, width: rect.width };
    });
  expect(recoveryLinkSize.height).toBeGreaterThanOrEqual(44);
  expect(recoveryLinkSize.width).toBeGreaterThanOrEqual(44);
});

test("serves non-production crawler controls and the minimal sitemap", async ({
  request,
}) => {
  const robotsResponse = await request.get("/robots.txt");

  expect(robotsResponse.status()).toBe(200);
  expect(robotsResponse.headers()["content-type"]).toContain("text/plain");
  expect(robotsResponse.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(await robotsResponse.text()).toBe("User-Agent: *\nDisallow: /\n\n");

  const sitemapResponse = await request.get("/sitemap.xml");

  expect(sitemapResponse.status()).toBe(200);
  expect(sitemapResponse.headers()["content-type"]).toContain("application/xml");
  expect(sitemapResponse.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(await sitemapResponse.text()).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      "<url>\n" +
      "<loc>https://www.youtoola.com</loc>\n" +
      "</url>\n" +
      "<url>\n" +
      "<loc>https://www.youtoola.com/tools</loc>\n" +
      "</url>\n" +
      "<url>\n" +
      "<loc>https://www.youtoola.com/about</loc>\n" +
      "</url>\n" +
      "<url>\n" +
      "<loc>https://www.youtoola.com/methodology</loc>\n" +
      "</url>\n" +
      "<url>\n" +
      "<loc>https://www.youtoola.com/privacy</loc>\n" +
      "</url>\n" +
      "</urlset>\n",
  );
});

test("keeps the Phase 8 inspector local, ephemeral, and provider-free", async ({ page }) => {
  const providerRequests: string[] = [];
  page.on("request", (request) => {
    if (/google-analytics|googletagmanager|clarity|collect\?/i.test(request.url())) providerRequests.push(request.url());
  });
  const response = await page.goto("/design-system-review");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  const storageBefore = await page.evaluate(() => ({
    cookie: document.cookie,
    local: JSON.stringify(localStorage),
    session: JSON.stringify(sessionStorage),
  }));

  await page.getByRole("button", { name: "Inspect valid event" }).click();
  await expect(page.getByText(/Valid event: accepted/)).toBeVisible();
  await page.getByRole("button", { name: "Inspect sensitive payload" }).click();
  await expect(page.getByText(/Sensitive payload: dropped: prohibited-field/)).toBeVisible();
  await page.getByRole("button", { name: "Inspect unknown parameter" }).click();
  await expect(page.getByText(/Unknown parameter: dropped: unknown-field/)).toBeVisible();
  await page.getByRole("button", { name: "Clear in-memory list" }).click();
  await expect(page.getByText("No inspection results.")).toBeVisible();

  await expect(page.getByRole("link", { name: /commission/i })).toHaveCount(0);
  await expect(page.locator("form").filter({ hasText: "Optional lead position" })).toHaveCount(0);
  expect(await page.evaluate(() => ({
    cookie: document.cookie,
    local: JSON.stringify(localStorage),
    session: JSON.stringify(sessionStorage),
  }))).toEqual(storageBefore);
  expect(providerRequests).toEqual([]);
});
