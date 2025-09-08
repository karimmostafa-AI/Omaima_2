import { test, expect } from '@playwright/test';

test.describe('E-commerce Customer Journey', () => {

  test('should allow a user to find a product, add it to cart, and see it in the cart sidebar', async ({ page }) => {
    // 1. Visit the homepage
    await page.goto('/');
    await expect(page.locator('h2:has-text("Featured Collections")')).toBeVisible();

    // 2. Navigate to the products page
    await page.locator('a:has-text("View All Products")').click();
    await expect(page).toHaveURL(/.*\/products/);
    await expect(page.locator('h2:has-text("All Products")')).toBeVisible();

    // 3. Search for a product
    // Note: This relies on the default seeded data having a product named "Executive Power Suit"
    await page.locator('input[placeholder="Search products..."]').fill('Executive Power Suit');

    // Wait for search results to appear (assuming some kind of loading/debounce)
    await page.waitForTimeout(1000);

    // 4. Verify search results and click on the product
    const productLink = page.locator('a:has-text("Executive Power Suit")').first();
    await expect(productLink).toBeVisible();
    await productLink.click();

    // 5. On Product Detail Page, add to cart
    await expect(page).toHaveURL(/.*\/products\/executive-power-suit/);
    await expect(page.locator('h1:has-text("Executive Power Suit")')).toBeVisible();

    const addToCartButton = page.locator('button:has-text("Add to Cart")');
    await addToCartButton.click();

    // 6. Open the cart sidebar and verify the item
    const cartButton = page.locator('button[aria-label="Open cart"]'); // Assuming an aria-label for the cart trigger
    await cartButton.click();

    const cartSidebar = page.locator('[data-slot="sheet-content"]');
    await expect(cartSidebar).toBeVisible();

    await expect(cartSidebar.locator('h4:has-text("Executive Power Suit")')).toBeVisible();
    await expect(cartSidebar.locator('p:has-text("$459.00")')).toBeVisible();
  });

});
