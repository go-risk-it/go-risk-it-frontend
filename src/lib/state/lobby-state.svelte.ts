import type { LobbyState, LobbyWebSocketMessage } from '$lib/types/lobby';
import { getAuth } from '$lib/state/auth.svelte';
import { PUBLIC_WS_URL } from '$env/static/public';

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

export function createLobbyWebSocket(lobbyId: string) {
	let ws = $state<WebSocket | null>(null);
	let connected = $state(false);
	let lobbyState = $state<LobbyState | null>(null);
	let retryCount = 0;
	let retryTimeoutId: ReturnType<typeof setTimeout> | undefined;
	let teardownRequested = false;

	function connect() {
		if (ws || teardownRequested) return;

		const auth = getAuth();
		const token = auth.accessToken;
		if (!token) return;

		const url = `${PUBLIC_WS_URL}?lobbyID=${lobbyId}`;
		const socket = new WebSocket(url, ['risk-it.websocket.auth.token', token]);

		socket.onopen = () => {
			connected = true;
			retryCount = 0;
		};

		socket.onclose = () => {
			connected = false;
			ws = null;

			if (teardownRequested) return;

			if (retryCount < MAX_RETRIES) {
				const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
				retryTimeoutId = setTimeout(() => {
					retryCount++;
					connect();
				}, delay);
			}
		};

		socket.onmessage = (event: MessageEvent) => {
			try {
				const msg = JSON.parse(event.data) as LobbyWebSocketMessage;
				if (msg.type === 'lobbyState') {
					lobbyState = msg.data as LobbyState;
				}
			} catch {
				console.error('Failed to parse lobby WebSocket message:', event.data);
			}
		};

		socket.onerror = (error: Event) => {
			console.error('Lobby WebSocket error:', error);
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
	}

	return {
		get connected() {
			return connected;
		},
		get lobbyState() {
			return lobbyState;
		},
		connect,
		disconnect
	};
}
