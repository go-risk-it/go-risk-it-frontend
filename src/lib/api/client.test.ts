import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth
vi.mock('$lib/state/auth.svelte', () => ({
	getAuth: vi.fn()
}));

import { getAuth } from '$lib/state/auth.svelte';

// We need to import client after mock setup
const { api } = await import('./client');

const mockGetAuth = vi.mocked(getAuth);

describe('api client', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		mockGetAuth.mockReturnValue({
			accessToken: 'test-token'
		} as ReturnType<typeof getAuth>);
	});

	it('get: calls fetch with GET and auth header', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve(JSON.stringify({ data: 1 }))
		});
		globalThis.fetch = mockFetch;

		const result = await api.get('/test');
		expect(mockFetch).toHaveBeenCalledOnce();
		const [url, options] = mockFetch.mock.calls[0];
		expect(url).toContain('/test');
		expect(options.headers.Authorization).toBe('Bearer test-token');
		expect(options.method).toBeUndefined();
		expect(result).toEqual({ data: 1 });
	});

	it('post: calls fetch with POST and serialized body', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve(JSON.stringify({ ok: true }))
		});
		globalThis.fetch = mockFetch;

		await api.post('/submit', { name: 'test' });
		const [, options] = mockFetch.mock.calls[0];
		expect(options.method).toBe('POST');
		expect(options.body).toBe(JSON.stringify({ name: 'test' }));
	});

	it('throws ApiError(401) when no token', async () => {
		mockGetAuth.mockReturnValue({ accessToken: null } as ReturnType<typeof getAuth>);
		await expect(api.get('/test')).rejects.toMatchObject({ status: 401 });
	});

	it('throws ApiError with status on non-ok response', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			text: () => Promise.resolve('Internal Server Error')
		});
		await expect(api.get('/fail')).rejects.toMatchObject({ status: 500 });
	});

	it('returns empty object on empty response body', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			text: () => Promise.resolve('')
		});
		const result = await api.get('/empty');
		expect(result).toEqual({});
	});

	describe('friendly error messages', () => {
		it('maps 400 to friendly message', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				text: () => Promise.resolve('Bad Request')
			});
			await expect(api.get('/test')).rejects.toMatchObject({
				status: 400,
				message: 'Invalid move — check your selection'
			});
		});

		it('maps 401 to friendly message', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
				text: () => Promise.resolve('Unauthorized')
			});
			await expect(api.get('/test')).rejects.toMatchObject({
				status: 401,
				message: 'Session expired — please sign in again'
			});
		});

		it('maps 409 to friendly message', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 409,
				text: () => Promise.resolve('Conflict')
			});
			await expect(api.get('/test')).rejects.toMatchObject({
				status: 409,
				message: 'Game state changed — try again'
			});
		});

		it('maps 500 to friendly message', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Internal Server Error')
			});
			await expect(api.get('/test')).rejects.toMatchObject({
				status: 500,
				message: 'Server error — try again shortly'
			});
		});

		it('maps 503 to server error message (>= 500 branch)', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 503,
				text: () => Promise.resolve('Service Unavailable')
			});
			await expect(api.get('/test')).rejects.toMatchObject({
				status: 503,
				message: 'Server error — try again shortly'
			});
		});

		it('falls back to body text for unknown status', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 418,
				text: () => Promise.resolve('I am a teapot')
			});
			await expect(api.get('/test')).rejects.toMatchObject({
				status: 418,
				message: 'I am a teapot'
			});
		});

		it('falls back to generic message when no body', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 418,
				text: () => Promise.resolve('')
			});
			await expect(api.get('/test')).rejects.toMatchObject({
				status: 418,
				message: 'Request failed: 418'
			});
		});

		it('handles text() rejection gracefully', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 418,
				text: () => Promise.reject(new Error('read failed'))
			});
			await expect(api.get('/test')).rejects.toMatchObject({
				status: 418,
				message: 'Request failed: 418'
			});
		});
	});

	it('throws ApiError(0) on request timeout', async () => {
		globalThis.fetch = vi.fn().mockImplementation(() => {
			const err = new DOMException('The operation was aborted', 'AbortError');
			return Promise.reject(err);
		});
		await expect(api.get('/test')).rejects.toMatchObject({
			status: 0,
			message: 'Request timed out'
		});
	});

	it('re-throws non-ApiError exceptions', async () => {
		const original = new TypeError('Failed to fetch');
		globalThis.fetch = vi.fn().mockRejectedValue(original);
		await expect(api.get('/test')).rejects.toBe(original);
	});
});
