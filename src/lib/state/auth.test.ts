import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '$lib/config/supabase';

const mockAuth = vi.mocked(supabase.auth);

// Reset mocks before each test and re-import to get fresh module state
describe('auth', () => {
	let getAuth: typeof import('./auth.svelte').getAuth;

	beforeEach(async () => {
		vi.resetModules();
		mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: null } as never);
		mockAuth.onAuthStateChange.mockReturnValue({
			data: { subscription: { unsubscribe: vi.fn() } }
		} as never);
		mockAuth.signInWithPassword.mockReset();
		mockAuth.signInWithIdToken.mockReset();
		mockAuth.signUp.mockReset();
		mockAuth.signOut.mockReset();

		const mod = await import('./auth.svelte');
		getAuth = mod.getAuth;

		// Wait for init() to complete
		await vi.waitFor(() => {
			expect(getAuth().loading).toBe(false);
		});
	});

	describe('initial state', () => {
		it('has no session or user after init with no session', () => {
			const auth = getAuth();
			expect(auth.session).toBeNull();
			expect(auth.user).toBeNull();
			expect(auth.isAuthenticated).toBe(false);
			expect(auth.accessToken).toBeNull();
		});
	});

	describe('init with existing session', () => {
		it('loads existing session from supabase', async () => {
			vi.resetModules();
			const mockSession = {
				access_token: 'tok-123',
				user: { id: 'u1', email: 'a@b.com' }
			};
			mockAuth.getSession.mockResolvedValue({
				data: { session: mockSession },
				error: null
			} as never);

			const mod = await import('./auth.svelte');
			await vi.waitFor(() => {
				expect(mod.getAuth().loading).toBe(false);
			});

			const auth = mod.getAuth();
			expect(auth.isAuthenticated).toBe(true);
			expect(auth.accessToken).toBe('tok-123');
			expect(auth.user?.id).toBe('u1');
		});
	});

	describe('signInWithPassword', () => {
		it('calls supabase signInWithPassword', async () => {
			mockAuth.signInWithPassword.mockResolvedValue({ error: null } as never);
			const auth = getAuth();
			await auth.signInWithPassword({ email: 'a@b.com', password: 'pass' });
			expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
				email: 'a@b.com',
				password: 'pass'
			});
		});

		it('throws on auth error', async () => {
			mockAuth.signInWithPassword.mockResolvedValue({
				error: new Error('Invalid credentials')
			} as never);
			const auth = getAuth();
			await expect(auth.signInWithPassword({ email: 'a@b.com', password: 'bad' })).rejects.toThrow(
				'Invalid credentials'
			);
		});
	});

	describe('signInWithGoogle', () => {
		it('calls supabase signInWithIdToken', async () => {
			mockAuth.signInWithIdToken.mockResolvedValue({ error: null } as never);
			const auth = getAuth();
			await auth.signInWithGoogle('google-token');
			expect(mockAuth.signInWithIdToken).toHaveBeenCalledWith({
				provider: 'google',
				token: 'google-token'
			});
		});

		it('throws on auth error', async () => {
			mockAuth.signInWithIdToken.mockResolvedValue({
				error: new Error('Invalid token')
			} as never);
			const auth = getAuth();
			await expect(auth.signInWithGoogle('bad-token')).rejects.toThrow('Invalid token');
		});
	});

	describe('signUp', () => {
		it('calls supabase signUp', async () => {
			mockAuth.signUp.mockResolvedValue({ error: null } as never);
			const auth = getAuth();
			await auth.signUp({ email: 'new@b.com', password: 'pass' });
			expect(mockAuth.signUp).toHaveBeenCalledWith({
				email: 'new@b.com',
				password: 'pass'
			});
		});

		it('throws on auth error', async () => {
			mockAuth.signUp.mockResolvedValue({
				error: new Error('Email taken')
			} as never);
			const auth = getAuth();
			await expect(auth.signUp({ email: 'dup@b.com', password: 'pass' })).rejects.toThrow(
				'Email taken'
			);
		});
	});

	describe('signOut', () => {
		it('calls supabase signOut', async () => {
			mockAuth.signOut.mockResolvedValue({ error: null } as never);
			const auth = getAuth();
			await auth.signOut();
			expect(mockAuth.signOut).toHaveBeenCalled();
		});

		it('throws on signOut error', async () => {
			mockAuth.signOut.mockResolvedValue({
				error: new Error('Network error')
			} as never);
			const auth = getAuth();
			await expect(auth.signOut()).rejects.toThrow('Network error');
		});
	});

	describe('onAuthStateChange', () => {
		it('registers a listener during init', () => {
			expect(mockAuth.onAuthStateChange).toHaveBeenCalled();
		});

		it('updates session when auth state changes', async () => {
			vi.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let authChangeCallback: (...args: any[]) => void = () => {};
			mockAuth.onAuthStateChange.mockImplementation(((cb: (...args: unknown[]) => void) => {
				authChangeCallback = cb;
				return { data: { subscription: { unsubscribe: vi.fn() } } } as never;
			}) as unknown as typeof mockAuth.onAuthStateChange);

			const mod = await import('./auth.svelte');
			await vi.waitFor(() => {
				expect(mod.getAuth().loading).toBe(false);
			});

			const newSession = {
				access_token: 'new-tok',
				user: { id: 'u2', email: 'b@c.com' }
			};
			authChangeCallback('SIGNED_IN', newSession);

			const auth = mod.getAuth();
			expect(auth.isAuthenticated).toBe(true);
			expect(auth.accessToken).toBe('new-tok');
			expect(auth.user?.id).toBe('u2');
		});

		it('clears session on sign out event', async () => {
			vi.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let authChangeCallback: (...args: any[]) => void = () => {};
			mockAuth.onAuthStateChange.mockImplementation(((cb: (...args: unknown[]) => void) => {
				authChangeCallback = cb;
				return { data: { subscription: { unsubscribe: vi.fn() } } } as never;
			}) as unknown as typeof mockAuth.onAuthStateChange);

			const mod = await import('./auth.svelte');
			await vi.waitFor(() => {
				expect(mod.getAuth().loading).toBe(false);
			});

			authChangeCallback('SIGNED_OUT', null);

			const auth = mod.getAuth();
			expect(auth.isAuthenticated).toBe(false);
			expect(auth.session).toBeNull();
			expect(auth.user).toBeNull();
		});
	});
});
