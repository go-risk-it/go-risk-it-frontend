import { getAuth } from '$lib/state/auth.svelte';
import { PUBLIC_API_URL } from '$env/static/public';

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

	const res = await fetch(`${PUBLIC_API_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			...options.headers
		}
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new ApiError(res.status, body || `Request failed: ${res.status}`);
	}

	const text = await res.text();
	return text ? JSON.parse(text) : ({} as T);
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, body?: unknown) =>
		request<T>(path, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined
		})
};
