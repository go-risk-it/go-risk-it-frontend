import type { LobbyState, LobbyWebSocketMessage } from '$lib/types/lobby';
import { createBaseWebSocket } from '$lib/state/base-websocket.svelte';

export function createLobbyWebSocket(lobbyId: string) {
	let lobbyState = $state<LobbyState | null>(null);

	const base = createBaseWebSocket({
		buildUrl: (baseUrl, token) => ({
			url: `${baseUrl}?lobbyID=${lobbyId}`,
			protocols: ['risk-it.websocket.auth.token', token]
		}),
		onMessage: (data) => {
			const msg = JSON.parse(data) as LobbyWebSocketMessage;
			if (msg.type === 'lobbyState') {
				lobbyState = msg.data as LobbyState;
			}
		},
		label: 'Lobby WebSocket'
	});

	return {
		get connected() {
			return base.connected;
		},
		get lobbyState() {
			return lobbyState;
		},
		connect: base.connect,
		disconnect: base.disconnect
	};
}
