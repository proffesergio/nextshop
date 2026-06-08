import { test, expect } from "@playwright/test";

/**
 * Smoke test — verifies the storefront homepage renders its core elements:
 *  - the brand heading ("Tuore" for finnish-grocer)
 *  - at least one product card with an "Add +" button
 */
test.describe("Storefront homepage smoke", () => {
  test("renders the brand heading", async ({ page }) => {
    await page.goto("/");
    // The brand name appears in the Header and in the Hero title
    await expect(page.getByRole("heading", { name: /Tuore/i }).first()).toBeVisible();
  });

  test("shows at least one Add button (product grid)", async ({ page }) => {
    await page.goto("/");
    // ProductCard renders "Add +" buttons with aria-label "Add <title> to cart"
    const addButtons = page.getByRole("button", { name: /add .+ to cart/i });
    await expect(addButtons.first()).toBeVisible();
  });

  test("cart counter increments on Add click", async ({ page }) => {
    await page.goto("/");
    // Initial cart label
    await expect(page.getByRole("button", { name: /Cart · 0/i })).toBeVisible();

    // Click the first product's Add button
    await page.getByRole("button", { name: /add .+ to cart/i }).first().click();

    await expect(page.getByRole("button", { name: /Cart · 1/i })).toBeVisible();
  });
});
