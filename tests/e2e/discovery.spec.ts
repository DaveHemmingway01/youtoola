import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const sizes = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

test("renders the honest zero-inventory homepage and links to the directory", async ({
  page,
}) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Useful tools. No account. No nonsense.",
    }),
  ).toBeVisible();
  await expect(page.getByText(/Our first tools are being prepared and reviewed/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse the tool directory" })).toHaveAttribute(
    "href",
    "/tools",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.youtoola.com",
  );
  await expect(page.getByText("Fuel Trip Calculator")).toHaveCount(0);
});

test("keeps the permanent tools directory useful and empty at zero releases", async ({
  page,
}) => {
  const response = await page.goto("/tools");

  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  await expect(page).toHaveTitle("Tools | Youtoola");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Practical tools, reviewed before release",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public tools are being prepared" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.youtoola.com/tools",
  );
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await expect(page.getByText("Fuel Trip Calculator")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Return to the homepage" })).toHaveAttribute(
    "href",
    "/",
  );
});

test("publishes only the approved discovery URLs in the sitemap", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();

  expect(sitemap.match(/<loc>/g)).toHaveLength(2);
  expect(sitemap).toContain("<loc>https://www.youtoola.com</loc>");
  expect(sitemap).toContain("<loc>https://www.youtoola.com/tools</loc>");
  expect(sitemap).not.toContain("fuel-trip-calculator");
  expect(sitemap).not.toContain("categories/");
  expect(sitemap).not.toContain("journeys/");
  expect(sitemap).not.toContain("search");
  expect(sitemap).not.toContain("design-system-review");
});

for (const path of [
  "/fuel-trip-calculator",
  "/categories/travel-mobility",
  "/journeys/road-trip-planning",
  "/search",
]) {
  test(`${path} remains unavailable`, async ({ request }) => {
    expect((await request.get(path)).status()).toBe(404);
  });
}

for (const size of sizes) {
  test(`homepage and tools have no overflow at ${size.width}x${size.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    for (const path of ["/", "/tools"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    }
  });
}

test("discovery pages remain usable at 200 percent text size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/tools"]) {
    await page.goto(path);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("discovery links are keyboard accessible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.getByRole("link", { name: "Browse the tool directory" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tools$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

for (const path of ["/", "/tools"]) {
  test(`${path} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(({ impact }) =>
      impact === "serious" || impact === "critical",
    );
    expect(blocking).toEqual([]);
  });
}
