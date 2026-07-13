import { expect, test } from "@playwright/test";

test("renders the Youtoola foundation", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Useful tools. No account. No nonsense.",
    }),
  ).toBeVisible();

  await expect(page).toHaveTitle(/Youtoola/);
});
