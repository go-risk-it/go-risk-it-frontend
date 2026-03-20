/**
 * Game-specific WebSocket wrapper built on top of {@link createBaseWebSocket}.
 * Parses incoming messages into typed {@link WebSocketMessage} objects and
 * delegates them to a registered handler. One instance per active game.
 */

import type { WebSocketMessage } from '$lib/types/game';
import { parseWebSocketMessage } from '$lib/types/game';
import { createBaseWebSocket } from '$lib/state/base-websocket.svelte';

type MessageHandler = (msg: WebSocketMessage) => void;

/**
 * Create a WebSocket connection for a specific game.
 * @param gameId - The game identifier used in the WS URL query parameter.
 * @returns Reactive connection state, lifecycle controls, and an onMessage registration method.
 */
export function createWebSocket(gameId: string | number) {
	let handler: MessageHandler | null = null;

	const base = createBaseWebSocket({
		buildUrl: (baseUrl, token) => ({
			url: `${baseUrl}?gameID=${gameId}`,
			protocols: ['risk-it.websocket.auth.token', token]
		}),
		onMessage: (data) => {
			const msg = parseWebSocketMessage(data);
			handler?.(msg);
		},
		label: 'WebSocket'
	});

	/**
	 * Register a callback invoked for every parsed game message.
	 * @param fn - Handler receiving the typed WebSocketMessage.
	 */
	function onMessage(fn: MessageHandler) {
		handler = fn;
	}

	return {
		get connected() {
			return base.connected;
		},
		get reconnecting() {
			return base.reconnecting;
		},
		get retriesExhausted() {
			return base.retriesExhausted;
		},
		connect: base.connect,
		disconnect: base.disconnect,
		manualReconnect: base.manualReconnect,
		reconnectWithNewToken: base.reconnectWithNewToken,
		onMessage
	};
}
