/**
 * Authenticated HTTP client for the go-risk-it backend API. All requests include
 * a Bearer token from the current auth state, a 30-second abort timeout, and
 * user-friendly error messages mapped from common HTTP status codes.
 */
import { getAuth } from '$lib/state/auth.svelte';
import { PUBLIC_API_URL } from '$env/static/public';

const REQUEST_TIMEOUT_MS = 30_000;
const RETRY_MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;

/**
 * Structured error thrown by all API requests. Carries the HTTP status code
 * (or 0 for client-side failures like timeouts) alongside a user-friendly message.
 */
export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

type Validator<T> = (data: unknown) => data is T;

/**
 * Sends an authenticated request to the backend API.
 *
 * Every request automatically:
 * - Attaches the current Supabase access token as a Bearer header
 * - Enforces a 30-second timeout via AbortController
 * - Parses JSON and optionally validates the response shape with a type guard
 * - Maps HTTP error codes to friendly messages (400, 401, 409, 5xx)
 *
 * @param path - API path appended to PUBLIC_API_URL (e.g. "/lobbies/summary")
 * @param options - Standard fetch options; headers are merged with auth defaults
 * @param validate - Optional type guard to verify the parsed response shape
 * @returns The parsed and optionally validated response body
 * @throws {ApiError} With status 401 if no access token is available
 * @throws {ApiError} With status 0 if the request times out after 30 seconds
 * @throws {ApiError} With a friendly message for 400, 401, 409, and 5xx responses
 * @throws {ApiError} If the response body is not valid JSON or fails validation
 */
async function request<T>(
	path: string,
	options: RequestInit = {},
	validate?: Validator<T>
): Promise<T> {
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
				res.status === 400
					? 'Invalid move — check your selection'
					: res.status === 401
						? 'Session expired — please sign in again'
						: res.status === 409
							? 'Game state changed — try again'
							: res.status >= 500
								? 'Server error — try again shortly'
								: body || `Request failed: ${res.status}`;
			throw new ApiError(res.status, friendly);
		}

		const text = await res.text();
		if (!text) return {} as T;

		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch {
			throw new ApiError(res.status, 'Invalid JSON response');
		}

		if (validate && !validate(parsed)) {
			throw new ApiError(res.status, 'Unexpected response format');
		}

		return parsed as T;
	} catch (err) {
		if (err instanceof ApiError) throw err;
		if (err instanceof DOMException && err.name === 'AbortError') {
			throw new ApiError(0, 'Request timed out');
		}
		throw new ApiError(0, err instanceof Error ? err.message : 'Unknown error');
	} finally {
		clearTimeout(timeoutId);
	}
}

/** Returns true for errors that are safe to retry (server errors and network failures). */
function isRetryable(err: unknown): boolean {
	if (err instanceof ApiError) return err.status >= 500 || err.status === 0;
	return true; // Network errors (TypeError from fetch) are retryable
}

/**
 * Retry wrapper with exponential backoff for transient failures.
 * Only retries server errors (5xx) and timeouts (status 0). Client errors (4xx) fail immediately.
 */
async function requestWithRetry<T>(
	path: string,
	options: RequestInit = {},
	validate?: Validator<T>
): Promise<T> {
	let lastErr: unknown;
	for (let attempt = 0; attempt < RETRY_MAX_ATTEMPTS; attempt++) {
		try {
			return await request<T>(path, options, validate);
		} catch (err) {
			lastErr = err;
			if (!isRetryable(err) || attempt === RETRY_MAX_ATTEMPTS - 1) throw err;
			await new Promise((r) => setTimeout(r, RETRY_BASE_DELAY_MS * Math.pow(2, attempt)));
		}
	}
	throw lastErr; // unreachable, but satisfies TS
}

/**
 * Public API interface exposing GET and POST methods. Both delegate to {@link request}
 * and inherit its authentication, timeout, and error handling behavior.
 * POST uses retry with backoff for transient failures (5xx, timeouts).
 */
export const api = {
	get: <T>(path: string, validate?: Validator<T>) => request<T>(path, {}, validate),
	post: <T>(path: string, body?: unknown, validate?: Validator<T>) =>
		requestWithRetry<T>(
			path,
			{
				method: 'POST',
				body: body ? JSON.stringify(body) : undefined
			},
			validate
		)
};
