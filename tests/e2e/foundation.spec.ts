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
      "</urlset>\n",
  );
});
