import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://localhost:8000';
const SUPABASE_ANON_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzEyNTI3MjAwLAogICJleHAiOiAxODcwMjkzNjAwCn0.iK-jCfr76BF5M83_gxsUMIW4CevRwRjt9ADb8Oe60ow';
const BACKEND_URL = 'http://localhost:8080';

export default async function globalSetup() {
	// Check backend readiness
	try {
		const res = await fetch(`${BACKEND_URL}/status`);
		if (!res.ok) {
			throw new Error(`Backend returned ${res.status}`);
		}
	} catch (err) {
		throw new Error(
			`Backend not reachable at ${BACKEND_URL}/status. ` +
				`Make sure 'docker compose up' is running.\n` +
				`Original error: ${err}`
		);
	}

	// Check Supabase readiness
	const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
	try {
		// Try creating the admin user (ignore if already exists)
		const { error } = await supabase.auth.signUp({
			email: 'admin@admin.admin',
			password: 'secret_password'
		});
		if (error && !error.message.includes('already registered')) {
			throw error;
		}
	} catch (err) {
		throw new Error(
			`Supabase not reachable at ${SUPABASE_URL}. ` +
				`Make sure 'docker compose up' is running.\n` +
				`Original error: ${err}`
		);
	}

	// Sign in as admin and store JWT for reset calls
	const { data, error: signInError } = await supabase.auth.signInWithPassword({
		email: 'admin@admin.admin',
		password: 'secret_password'
	});
	if (signInError || !data.session) {
		throw new Error(`Failed to sign in as admin: ${signInError?.message}`);
	}

	process.env.ADMIN_JWT = data.session.access_token;
	process.env.ADMIN_USER_ID = data.user?.id ?? '';
}
