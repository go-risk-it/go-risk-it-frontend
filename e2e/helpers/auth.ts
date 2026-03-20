import { createClient } from '@supabase/supabase-js';
import type { BrowserContext, Page } from '@playwright/test';

const SUPABASE_URL = 'http://localhost:8000';
const SUPABASE_ANON_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzEyNTI3MjAwLAogICJleHAiOiAxODcwMjkzNjAwCn0.iK-jCfr76BF5M83_gxsUMIW4CevRwRjt9ADb8Oe60ow';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface UserInfo {
	id: string;
	email: string;
	jwt: string;
}

/**
 * Create a Supabase user via the auth API and return their info + JWT.
 */
export async function createUser(email: string, password: string): Promise<UserInfo> {
	const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
		email,
		password
	});
	if (signUpError && !signUpError.message.includes('already registered')) {
		throw new Error(`Failed to create user ${email}: ${signUpError.message}`);
	}

	// Sign in to get a fresh JWT
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error || !data.session) {
		throw new Error(`Failed to sign in as ${email}: ${error?.message}`);
	}

	return {
		id: data.user!.id,
		email,
		jwt: data.session.access_token
	};
}

/**
 * Authenticate a browser context by filling the sign-in form.
 */
export async function authenticateContext(
	page: Page,
	email: string,
	password: string
): Promise<void> {
	await page.goto('/auth/signin');
	await page.locator('#email').fill(email);
	await page.locator('#password').fill(password);
	await page.locator('[data-testid="signin-submit"]').click();
	await page.waitForURL('/', { timeout: 10_000 });
}
