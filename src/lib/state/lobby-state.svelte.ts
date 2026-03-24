/**
 * Lobby-specific WebSocket state built on {@link createBaseWebSocket}.
 * Maintains reactive lobby state (players joined, game readiness) by
 * listening for lobbyState messages over the WebSocket connection.
 */

import type { LobbyState, LobbyWebSocketMessage } from '$lib/types/lobby';
import { createBaseWebSocket } from '$lib/state/base-websocket.svelte';

/**
 * Create a WebSocket connection for a lobby.
 * @param lobbyId - The lobby identifier used in the WS URL path.
 * @returns Reactive lobby state and connection controls.
 */
export function createLobbyWebSocket(lobbyId: string) {
	let lobbyState = $state<LobbyState | null>(null);

	const base = createBaseWebSocket({
		buildUrl: (baseUrl, token) => ({
			url: `${baseUrl}/api/v1/lobbies/${lobbyId}/ws`,
			protocols: ['risk-it.websocket.auth.token', token]
		}),
		onMessage: (data) => {
			const msg = JSON.parse(data) as LobbyWebSocketMessage;
			if (msg.type === 'lobbyState') {
				lobbyState = msg.data;
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
