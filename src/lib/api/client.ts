import { getAuth } from '$lib/state/auth.svelte';
import { PUBLIC_API_URL } from '$env/static/public';

const REQUEST_TIMEOUT_MS = 30_000;

class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const auth = getAuth();
	const token = auth.accessToken;
	if (!token) throw new ApiError(401, 'Not authenticated');

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const res = await fetch(`${PUBLIC_API_URL}${path}`, {
			...options,
			signal: controller.signal,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				...options.headers
			}
		});

		if (!res.ok) {
			const body = await res.text().catch(() => '');
			const friendly =
				res.status === 400 ? 'Invalid move — check your selection' :
				res.status === 401 ? 'Session expired — please sign in again' :
				res.status === 409 ? 'Game state changed — try again' :
				res.status >= 500 ? 'Server error — try again shortly' :
				body || `Request failed: ${res.status}`;
			throw new ApiError(res.status, friendly);
		}

		const text = await res.text();
		if (!text) return {} as T;

		try {
			return JSON.parse(text) as T;
		} catch {
			throw new ApiError(res.status, 'Invalid JSON response');
		}
	} catch (err) {
		if (err instanceof ApiError) throw err;
		if (err instanceof DOMException && err.name === 'AbortError') {
			throw new ApiError(0, 'Request timed out');
		}
		throw err;
	} finally {
		clearTimeout(timeoutId);
	}
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, body?: unknown) =>
		request<T>(path, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined
		})
};
