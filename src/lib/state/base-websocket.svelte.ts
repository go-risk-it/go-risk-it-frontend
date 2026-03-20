import { getAuth } from '$lib/state/auth.svelte';
import { PUBLIC_WS_URL } from '$env/static/public';

const MAX_RETRIES = 5;
const FAST_RETRY_DELAY = 200;
const FAST_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1000;

interface BaseWebSocketOptions {
	buildUrl: (baseUrl: string, token: string) => { url: string; protocols: string[] };
	onMessage: (data: string) => void;
	label?: string;
}

export function createBaseWebSocket(options: BaseWebSocketOptions) {
	let ws = $state<WebSocket | null>(null);
	let connected = $state(false);
	let reconnecting = $state(false);
	let retriesExhausted = $state(false);
	let retryCount = 0;
	let retryTimeoutId: ReturnType<typeof setTimeout> | undefined;
	let teardownRequested = false;

	const label = options.label ?? 'WebSocket';

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
			} catch {
				console.error(`Failed to parse ${label} message:`, event.data);
			}
		};

		socket.onerror = (error: Event) => {
			console.error(`${label} error:`, error);
		};

		ws = socket;
	}

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

	function manualReconnect() {
		retryCount = 0;
		reconnecting = false;
		retriesExhausted = false;
		teardownRequested = false;
		connect();
	}

	function reconnectWithNewToken() {
		if (teardownRequested) return;
		// Close existing connection and reconnect with fresh token
		if (retryTimeoutId) {
			clearTimeout(retryTimeoutId);
			retryTimeoutId = undefined;
		}
		if (ws) {
			// Temporarily suppress auto-retry on this close
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
		connect,
		disconnect,
		manualReconnect,
		reconnectWithNewToken
	};
}
