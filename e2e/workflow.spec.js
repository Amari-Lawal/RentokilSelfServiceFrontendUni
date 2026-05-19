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
    await expect(page.locator('h2')).toContainText('Login');

    // 2. Registration Flow
    // Switch to Register form
    await page.getByText("Don't have an account? Register").click();
    await expect(page.locator('h2')).toContainText('Registration');

    // Fill registration form
    await page.getByLabel('Username').fill(uniqueUsername);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // Verify successful registration message
    await expect(page.getByText('Registration successful! Please login.')).toBeVisible();

    // 3. Login Flow
    await expect(page.locator('h2')).toContainText('Login');

    // Fill login form
    await page.getByLabel('Username').fill(uniqueUsername);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify successful login
    await expect(page.getByText(`Welcome, ${uniqueUsername}`)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Appointments' })).toBeVisible();

    // 4. Booking Flow - Test Validation (Past Date)
    await page.getByRole('button', { name: 'Book Exterminator' }).click();

    await page.locator('#door_number').fill('10');
    await page.locator('#road_name').fill('Test Road');
    await page.locator('#postcode').fill('SW1A1AA');
    
    // Brief wait for background mapping to resolve M1 -> Manchester
    await page.waitForTimeout(500);
    
    await page.getByLabel('Date').fill('2020-01-01');
    await page.getByLabel('Time').fill('14:30');
    await page.getByLabel('Pest Type').selectOption('Ants');
    await page.getByRole('button', { name: 'Confirm Booking' }).click();
    
    // Verify error message
    await expect(page.getByText('Error: Appointment date cannot be in the past.')).toBeVisible();

    // 5. Booking Flow - Correct Data
    await page.getByLabel('Date').fill('2027-10-20');
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Verify success message then table row
    await expect(page.getByText('Booking Confirmed!')).toBeVisible();
    const tableRow = page.locator('table tbody tr').first();
    await expect(tableRow).toBeVisible({ timeout: 15000 });
    await expect(tableRow).toContainText('Ants');
    await expect(tableRow).toContainText('10 Test Road');
    await expect(tableRow).toContainText('SW1A1AA');

    // 6. Cancellation Flow
    page.on('dialog', dialog => dialog.accept());
    await tableRow.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('No appointments found.')).toBeVisible();
  });

  test('Admin Journey: Login Seeded Admin -> View All -> Manage Staff', async ({ page }) => {
    await page.goto('/');

    // 1. Login Seeded Admin
    await page.getByRole('button', { name: 'Admin' }).click();
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('adminpassword123');
    await page.getByRole('button', { name: 'Login' }).click();

    // 2. Verify Admin Dashboard
    await expect(page.getByText('All Appointments (Admin)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Book Exterminator' })).not.toBeVisible();

    // 3. Verify Staff Management exists
    await expect(page.getByText('Staff Management')).toBeVisible();
  });
});
