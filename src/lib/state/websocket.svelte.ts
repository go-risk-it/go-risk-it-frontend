import type { WebSocketMessage } from '$lib/types/game';
import { createBaseWebSocket } from '$lib/state/base-websocket.svelte';

type MessageHandler = (msg: WebSocketMessage) => void;

export function createWebSocket(gameId: string | number) {
	let handler: MessageHandler | null = null;

	const base = createBaseWebSocket({
		buildUrl: (baseUrl, token) => ({
			url: `${baseUrl}?gameID=${gameId}`,
			protocols: ['risk-it.websocket.auth.token', token]
		}),
		onMessage: (data) => {
			const msg = JSON.parse(data) as WebSocketMessage;
			handler?.(msg);
		},
		label: 'WebSocket'
	});

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
