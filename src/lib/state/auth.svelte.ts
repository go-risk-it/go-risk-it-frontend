/**
 * Authentication state module backed by Supabase Auth.
 * Maintains reactive session/user state via module-level $state runes and
 * auto-initializes by fetching the current session and subscribing to auth changes.
 */

import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '$lib/config/supabase';

/** Email/password pair used for sign-in and sign-up. */
interface Credentials {
	email: string;
	password: string;
}

/** Reactive auth state (module-scoped singletons shared across all consumers). */
let session = $state<Session | null>(null);
let user = $state<User | null>(null);
let loading = $state(true);

/** Fetch the existing session on module load and subscribe to future auth changes. */
async function init() {
	const {
		data: { session: currentSession }
	} = await supabase.auth.getSession();
	session = currentSession;
	user = currentSession?.user ?? null;
	loading = false;

	supabase.auth.onAuthStateChange((_event, newSession) => {
		session = newSession;
		user = newSession?.user ?? null;
		loading = false;
	});
}

init();

/**
 * Returns a reactive auth accessor object. Because the underlying $state
 * is module-scoped, every caller shares the same session state.
 * @returns Reactive getters for session/user plus sign-in/sign-up/sign-out methods.
 */
export function getAuth() {
	return {
		/** Current Supabase session, or null if not authenticated. */
		get session() {
			return session;
		},
		/** Current Supabase user, or null if not authenticated. */
		get user() {
			return user;
		},
		/** True while the initial session is being fetched. */
		get loading() {
			return loading;
		},
		/** Convenience boolean derived from session presence. */
		get isAuthenticated() {
			return !!session;
		},
		/** JWT access token for authenticating API/WebSocket requests. */
		get accessToken() {
			return session?.access_token ?? null;
		},

		/**
		 * Sign in with email and password.
		 * @param credentials - Email/password pair.
		 * @throws Supabase AuthError on failure.
		 */
		async signInWithPassword(credentials: Credentials) {
			const { error } = await supabase.auth.signInWithPassword({
				email: credentials.email,
				password: credentials.password
			});
			if (error) throw error;
		},

		/**
		 * Sign in using a Google OAuth ID token (One Tap / credential response).
		 * @param token - Google ID token string.
		 * @throws Supabase AuthError on failure.
		 */
		async signInWithGoogle(token: string) {
			const { error } = await supabase.auth.signInWithIdToken({
				provider: 'google',
				token
			});
			if (error) throw error;
		},

		/**
		 * Create a new account with email and password.
		 * @param credentials - Email/password pair.
		 * @throws Supabase AuthError on failure.
		 */
		async signUp(credentials: Credentials) {
			const { error } = await supabase.auth.signUp({
				email: credentials.email,
				password: credentials.password
			});
			if (error) throw error;
		},

		/** Sign out and clear the session. */
		async signOut() {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		}
	};
}
