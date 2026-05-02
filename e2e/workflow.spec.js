import { test, expect } from '@playwright/test';

test.describe('Rentokil Self Service - E2E Workflow', () => {
  // Use a unique username to avoid conflicts
  const uniqueUsername = `e2e_user_${Date.now()}`;
  const password = 'securepassword123';

  test('Complete User Journey: Register -> Login -> Book -> Cancel', async ({ page }) => {
    // Listen to console events
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    // 1. Navigate to the application
    await page.goto('/');

    // Verify we are on the Auth screen
    await expect(page.locator('h2')).toContainText('Login to Account');

    // 2. Registration Flow
    // Switch to Register form
    await page.getByText("Don't have an account? Register").click();
    await expect(page.locator('h2')).toContainText('Create an Account');

    // Fill registration form
    await page.getByLabel('Username').fill(uniqueUsername);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // Verify successful registration message
    await expect(page.getByText('Registration successful! Please login.')).toBeVisible();

    // 3. Login Flow
    // The form automatically switches to Login after successful registration
    await expect(page.locator('h2')).toContainText('Login to Account');

    // Fill login form
    await page.getByLabel('Username').fill(uniqueUsername);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify successful login
    await expect(page.getByText(`Welcome, ${uniqueUsername}`)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Appointments' })).toBeVisible();

    // 4. Booking Flow
    await page.getByRole('button', { name: 'Book Exterminator' }).click();

    // Fill booking form
    await page.getByLabel('Date').fill('2026-10-20');
    await page.getByLabel('Time').fill('14:30');
    await page.getByLabel('Pest Type').selectOption('Ants');
    await page.getByLabel('Location').fill('123 Test Street, London');
    await page.getByLabel('Additional Notes').fill('We have a trail of ants in the kitchen.');
    
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Verify booking appears in table
    const tableRow = page.locator('table tbody tr').first();
    await expect(tableRow).toBeVisible();
    await expect(tableRow).toContainText('2026-10-20');
    await expect(tableRow).toContainText('14:30');
    await expect(tableRow).toContainText('Ants');
    await expect(tableRow).toContainText('123 Test Street, London');
    await expect(tableRow).toContainText('Pending');

    // 5. Cancellation Flow
    // Auto-accept the confirmation dialog that appears on deletion
    page.on('dialog', dialog => dialog.accept());

    // Click cancel
    await tableRow.getByRole('button', { name: 'Cancel' }).click();

    // Verify the appointment is removed
    await expect(page.getByText('No appointments found.')).toBeVisible();
  });
});
