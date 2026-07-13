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
