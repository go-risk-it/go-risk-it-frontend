import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '$lib/config/supabase';

interface Credentials {
	email: string;
	password: string;
}

let session = $state<Session | null>(null);
let user = $state<User | null>(null);
let loading = $state(true);

// Initialize: fetch current session and listen for changes
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

export function getAuth() {
	return {
		get session() {
			return session;
		},
		get user() {
			return user;
		},
		get loading() {
			return loading;
		},
		get isAuthenticated() {
			return !!session;
		},
		get accessToken() {
			return session?.access_token ?? null;
		},

		async signInWithPassword(credentials: Credentials) {
			const { error } = await supabase.auth.signInWithPassword({
				email: credentials.email,
				password: credentials.password
			});
			if (error) throw error;
		},

		async signInWithGoogle(token: string) {
			const { error } = await supabase.auth.signInWithIdToken({
				provider: 'google',
				token
			});
			if (error) throw error;
		},

		async signUp(credentials: Credentials) {
			const { error } = await supabase.auth.signUp({
				email: credentials.email,
				password: credentials.password
			});
			if (error) throw error;
		},

		async signOut() {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		}
	};
}
