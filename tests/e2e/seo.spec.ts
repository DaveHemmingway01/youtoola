import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pageExpectations = [
  {
    canonical: "https://www.youtoola.com",
    description:
      "Youtoola is a collection of free, practical online tools for everyday calculations, decisions and tasks, without requiring an account.",
    path: "/",
    title: "Youtoola — Useful tools. No account. No nonsense.",
  },
  {
    canonical: "https://www.youtoola.com/tools",
    description:
      "Browse Youtoola’s practical online tools as they complete review and become available for public use.",
    path: "/tools",
    title: "Practical Online Tools | Youtoola",
  },
  {
    canonical: "https://www.youtoola.com/about",
    description:
      "Learn what Youtoola is, how its practical online tools are reviewed, and the principles that guide the platform.",
    path: "/about",
    title: "About Youtoola | Youtoola",
  },
  {
    canonical: "https://www.youtoola.com/methodology",
    description:
      "Read Youtoola's methodology and editorial policy for research, calculations, sources, testing, corrections, and review.",
    path: "/methodology",
    title: "Methodology and editorial policy | Youtoola",
  },
  {
    canonical: "https://www.youtoola.com/privacy",
    description:
      "Understand Youtoola's current privacy approach, including browser-local calculations, account-free use, and data-practice reviews.",
    path: "/privacy",
    title: "Privacy | Youtoola",
  },
] as const;

for (const expected of pageExpectations) {
  test(`${expected.path} has unique authored metadata and remains server rendered`, async ({
    page,
  }) => {
    const response = await page.goto(expected.path);
    expect(response?.status()).toBe(200);
    expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    await expect(page).toHaveTitle(expected.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      expected.description,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      expected.canonical,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary",
    );
    await expect(page.locator('script[src*="google"], script[src*="analytics"]')).toHaveCount(0);
  });
}

test("homepage entity schema contains only approved visible facts", async ({ page }) => {
  await page.goto("/");
  const script = page.locator("#youtoola-entities");
  const data = JSON.parse((await script.textContent()) ?? "");
  expect(data["@graph"].map((item: { "@type": string }) => item["@type"])).toEqual([
    "Organization",
    "WebSite",
  ]);
  expect(JSON.stringify(data)).not.toContain("SearchAction");
  expect(JSON.stringify(data)).not.toContain("Fuel Trip Calculator");
});

for (const expected of pageExpectations.slice(1)) {
  test(`${expected.path} visible and structured breadcrumbs agree`, async ({ page }) => {
    await page.goto(expected.path);
    const visible = await page.locator(".breadcrumbs li").allTextContents();
    const data = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? "",
    );
    const structured = data.itemListElement.map((item: { name: string }) => item.name);
    expect(structured).toEqual(visible.map((value) => value.replace(/\/$/, "").trim()));
  });
}

for (const path of ["/about", "/methodology", "/privacy"]) {
  test(`${path} is accessible and contains review ownership`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText("Content owner:")).toBeVisible();
    await expect(page.locator("time[datetime='2026-07-14']")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"),
    ).toEqual([]);
  });
}
