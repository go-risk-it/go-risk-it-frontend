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
});
