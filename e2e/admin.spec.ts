import { test, expect } from '@playwright/test';

test.describe('Admin Authentication and Access', () => {
  // This test sets up the admin user. It should run first.
  test('Setup Admin User', async ({ page }) => {
    await page.goto('/setup-admin');
    await expect(page.locator('h1')).toHaveText('Admin Setup');

    const createButton = page.locator('button:has-text("Create Admin User")');
    await createButton.click();

    // Wait for either success or already exists message
    await expect(
      page.locator('text=Admin User Ready!, text=Admin user already exists')
    ).toBeVisible({ timeout: 15000 });
  });

  test('should redirect to login when accessing /admin without auth', async ({ page }) => {
    await page.goto('/admin');
    // Expect a redirect to the login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.locator('h1')).toHaveText('Admin Login');
  });

  test('should allow login with correct credentials and redirect to dashboard', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill in credentials
    await page.locator('input[name="email"]').fill('admin@omaima.com');
    await page.locator('input[name="password"]').fill('admin123');

    // Click login
    await page.locator('button:has-text("Login")').click();

    // Expect a redirect to the admin dashboard
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.locator('h1')).toHaveText('Dashboard');
  });

  test('should persist login session and allow direct access to /admin', async ({ page }) => {
    // First, log in
    await page.goto('/auth/login');
    await page.locator('input[name="email"]').fill('admin@omaima.com');
    await page.locator('input[name="password"]').fill('admin123');
    await page.locator('button:has-text("Login")').click();
    await expect(page).toHaveURL(/.*\/admin/);

    // Then, navigate away and back to the admin page
    await page.goto('/');
    await expect(page.locator('h1')).not.toHaveText('Dashboard');

    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.locator('h1')).toHaveText('Dashboard');
  });

  test('should allow an admin to create a new product', async ({ page }) => {
    // Log in first
    await page.goto('/auth/login');
    await page.locator('input[name="email"]').fill('admin@omaima.com');
    await page.locator('input[name="password"]').fill('admin123');
    await page.locator('button:has-text("Login")').click();
    await expect(page).toHaveURL(/.*\/admin/);

    // Navigate to products page
    await page.locator('a:has-text("Products")').click();
    await expect(page).toHaveURL(/.*\/admin\/products/);

    // Click "Add Product"
    await page.locator('button:has-text("Add Product")').click();

    // Fill out the form in the modal
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    const uniqueSku = `TEST-SKU-${Date.now()}`;
    await modal.locator('input[name="name"]').fill('E2E Test Product');
    await modal.locator('textarea[name="description"]').fill('This is a product created by an E2E test.');
    await modal.locator('input[name="sku"]').fill(uniqueSku);
    await modal.locator('input[name="price"]').fill('199.99');

    await modal.locator('button[role="combobox"]').click();
    await page.locator('div[role="option"]:has-text("Blazers")').click();

    // Create the product
    await modal.locator('button:has-text("Create Product")').click();

    // Modal should close, and the new product should be in the table
    await expect(modal).not.toBeVisible();
    await expect(page.locator(`text=${uniqueSku}`)).toBeVisible();
  });
});
