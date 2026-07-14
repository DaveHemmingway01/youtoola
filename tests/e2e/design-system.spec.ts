import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const sizes = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

test("review route is available, noindexed, and excluded from the sitemap", async ({
  page,
  request,
}) => {
  const response = await page.goto("/design-system-review");

  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, nofollow/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.youtoola.com",
  );

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("design-system-review");
});

test("skip link reaches the main landmark", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("mobile disclosure closes with Escape and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/design-system-review");

  const trigger = page.getByRole("button", { name: "Menu" });
  await trigger.click();
  const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(navigation).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(navigation).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("form errors are associated and the summary receives focus", async ({ page }) => {
  await page.goto("/design-system-review");
  await page.getByRole("button", { name: "Calculate example" }).click();

  const summary = page.locator(".error-summary");
  await expect(summary).toBeFocused();
  await expect(page.getByLabel("Distance")).toHaveAttribute(
    "aria-describedby",
    "review-distance-error",
  );
  await expect(page.getByLabel("Distance")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Distance").fill("125");
  await page.getByRole("button", { name: "Calculate example" }).click();
  await expect(page.getByText(/125 km ready for calculation/)).toBeVisible();
});

test("interactive targets meet the 44 CSS-pixel minimum", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/design-system-review");

  const undersizedTargets = await page.evaluate(() => {
    const selector = [
      "a",
      "button",
      'input[type="text"]',
      'input[type="number"]',
      "select",
      "label.choice",
      "label.toggle",
      "summary",
    ].join(",");

    return [...document.querySelectorAll<HTMLElement>(selector)]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden";
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          height: rect.height,
          label: element.getAttribute("aria-label") ?? element.textContent?.trim(),
          width: rect.width,
        };
      })
      .filter(({ height, width }) => height < 44 || width < 44);
  });

  expect(undersizedTargets).toEqual([]);
});

for (const size of sizes) {
  test(`has no horizontal overflow at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/design-system-review");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
}

test("supports large text and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/design-system-review");
  await expect(page.getByRole("heading", { name: "Youtoola design system" })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  await expect(page.getByRole("heading", { name: "Youtoola design system" })).toBeVisible();
});

test("has no serious or critical axe violations", async ({ page }) => {
  await page.goto("/design-system-review");
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(({ impact }) =>
    impact === "serious" || impact === "critical",
  );
  expect(blocking).toEqual([]);
});
