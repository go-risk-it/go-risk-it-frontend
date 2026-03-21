/**
 * Low-level WebSocket factory with automatic reconnection and token refresh.
 * Implements a two-tier retry strategy: fast retries for transient drops followed
 * by exponential backoff. Consumers (game WS, lobby WS) provide URL-building
 * and message-handling callbacks via {@link BaseWebSocketOptions}.
 */

import { getAuth } from '$lib/state/auth.svelte';
import { PUBLIC_WS_URL } from '$env/static/public';

const MAX_RETRIES = 5;
/** Delay for the first FAST_RETRIES attempts (covers transient network blips). */
const FAST_RETRY_DELAY = 200;
const FAST_RETRIES = 2;
/** Base delay for exponential backoff after fast retries are exhausted. */
const INITIAL_RETRY_DELAY = 1000;

/** Configuration for a base WebSocket connection. */
interface BaseWebSocketOptions {
	/** Build the full WS URL and sub-protocol array from the base URL and auth token. */
	buildUrl: (baseUrl: string, token: string) => { url: string; protocols: string[] };
	/** Called with the raw message string for every incoming WebSocket message. */
	onMessage: (data: string) => void;
	/** Human-readable label used in log/error messages. */
	label?: string;
}

/**
 * Create a managed WebSocket connection with reconnection logic.
 * @param options - URL builder, message handler, and optional label.
 * @returns Reactive connection state and control methods.
 */
export function createBaseWebSocket(options: BaseWebSocketOptions) {
	let ws = $state<WebSocket | null>(null);
	let connected = $state(false);
	let reconnecting = $state(false);
	let retriesExhausted = $state(false);
	/** True when the last received message failed to parse. Cleared on next successful message. */
	let parseError = $state(false);
	let retryCount = 0;
	let retryTimeoutId: ReturnType<typeof setTimeout> | undefined;
	/** When true, onclose will not trigger auto-reconnect (set during intentional teardown). */
	let teardownRequested = false;

	const label = options.label ?? 'WebSocket';

	/** Open a new WebSocket connection. No-ops if already connected or torn down. */
	function connect() {
		if (ws || teardownRequested) return;

		const auth = getAuth();
		const token = auth.accessToken;
		if (!token) return;

		const { url, protocols } = options.buildUrl(PUBLIC_WS_URL, token);
		const socket = new WebSocket(url, protocols);

		socket.onopen = () => {
			connected = true;
			reconnecting = false;
			retriesExhausted = false;
			retryCount = 0;
		};

		socket.onclose = () => {
			connected = false;
			ws = null;

			if (teardownRequested) return;

			if (retryCount < MAX_RETRIES) {
				reconnecting = true;
				// Two-tier strategy: fast retries first, then exponential backoff
				const delay =
					retryCount < FAST_RETRIES
						? FAST_RETRY_DELAY
						: INITIAL_RETRY_DELAY * Math.pow(2, retryCount - FAST_RETRIES);
				retryTimeoutId = setTimeout(() => {
					retryCount++;
					connect();
				}, delay);
			} else {
				reconnecting = false;
				retriesExhausted = true;
			}
		};

		socket.onmessage = (event: MessageEvent) => {
			try {
				options.onMessage(event.data);
				parseError = false;
			} catch {
				console.error(`Failed to parse ${label} message:`, event.data);
				parseError = true;
			}
		};

		socket.onerror = (error: Event) => {
			console.error(`${label} error:`, error);
		};

		ws = socket;
	}

	/** Permanently close the connection and cancel any pending retries. */
	function disconnect() {
		teardownRequested = true;
		if (retryTimeoutId) {
			clearTimeout(retryTimeoutId);
			retryTimeoutId = undefined;
		}
		if (ws) {
			ws.close();
			ws = null;
		}
		connected = false;
		reconnecting = false;
	}

	/** User-triggered reconnect that resets all retry state. */
	function manualReconnect() {
		retryCount = 0;
		reconnecting = false;
		retriesExhausted = false;
		teardownRequested = false;
		connect();
	}

	/**
	 * Close the current socket and immediately reconnect with a fresh auth token.
	 * Temporarily sets teardownRequested to suppress the onclose auto-retry,
	 * then clears it before calling connect() with the new token.
	 */
	function reconnectWithNewToken() {
		if (teardownRequested) return;
		if (retryTimeoutId) {
			clearTimeout(retryTimeoutId);
			retryTimeoutId = undefined;
		}
		if (ws) {
			// Suppress auto-retry for this intentional close
			teardownRequested = true;
			ws.close();
			ws = null;
		}
		retryCount = 0;
		reconnecting = false;
		retriesExhausted = false;
		teardownRequested = false;
		connect();
	}

	return {
		get connected() {
			return connected;
		},
		get reconnecting() {
			return reconnecting;
		},
		get retriesExhausted() {
			return retriesExhausted;
		},
		get parseError() {
			return parseError;
		},
		connect,
		disconnect,
		manualReconnect,
		reconnectWithNewToken
	};
}
