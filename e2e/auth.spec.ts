import { test, expect } from '@playwright/test';
import { createUser, authenticateContext } from './helpers/auth';
import { resetState } from './helpers/api';
import { TEST_PASSWORD } from './helpers/config';

test.describe('Authentication', () => {
	test.beforeEach(async () => {
		const adminJwt = process.env.ADMIN_JWT!;
		await resetState(adminJwt);
	});

	test('shows sign in form', async ({ page }) => {
		await page.goto('/auth/signin');
		await expect(page.locator('h1')).toContainText('Sign In');
		await expect(page.locator('#email')).toBeVisible();
		await expect(page.locator('#password')).toBeVisible();
		await expect(page.locator('[data-testid="signin-submit"]')).toBeVisible();
	});

	test('sign in with valid credentials redirects to lobby', async ({ page }) => {
		// Create user via API first
		const email = `auth-test-${Date.now()}@test.com`;
		await createUser(email, TEST_PASSWORD);

		// Sign in via UI
		await authenticateContext(page, email, TEST_PASSWORD);

		// Should be on lobby page
		await expect(page).toHaveURL('/');
		await expect(page.locator('[data-testid="player-name-input"]')).toBeVisible();
	});

	test('sign in with invalid credentials shows error', async ({ page }) => {
		await page.goto('/auth/signin');
		await page.locator('#email').fill('nonexistent@test.com');
		await page.locator('#password').fill('wrong_password');
		await page.locator('[data-testid="signin-submit"]').click();

		await expect(page.locator('[data-testid="signin-error"]')).toBeVisible({ timeout: 5_000 });
	});

	test('sign out redirects to sign in page', async ({ page }) => {
		// Create and sign in
		const email = `signout-test-${Date.now()}@test.com`;
		await createUser(email, TEST_PASSWORD);
		await authenticateContext(page, email, TEST_PASSWORD);

		// Sign out
		await page.locator('[data-testid="signout-btn"]').click();
		await expect(page).toHaveURL('/auth/signin', { timeout: 5_000 });
	});

	test('unauthenticated user is redirected to sign in', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/auth/signin', { timeout: 5_000 });
	});
});
