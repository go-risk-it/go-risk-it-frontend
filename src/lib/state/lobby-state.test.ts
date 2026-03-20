import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture the options passed to createBaseWebSocket
let capturedOptions: {
	buildUrl: (baseUrl: string, token: string) => { url: string; protocols: string[] };
	onMessage: (data: string) => void;
	label?: string;
};

const mockBase = {
	_connected: false,
	get connected() {
		return this._connected;
	},
	connect: vi.fn(),
	disconnect: vi.fn()
};

vi.mock('$lib/state/base-websocket.svelte', () => ({
	createBaseWebSocket: vi.fn((opts: typeof capturedOptions) => {
		capturedOptions = opts;
		return mockBase;
	})
}));

const { createLobbyWebSocket } = await import('./lobby-state.svelte');

describe('createLobbyWebSocket', () => {
	beforeEach(() => {
		mockBase._connected = false;
		mockBase.connect.mockClear();
		mockBase.disconnect.mockClear();
	});

	describe('URL building', () => {
		it('builds URL with lobbyID query parameter', () => {
			createLobbyWebSocket('lobby-99');
			const { url } = capturedOptions.buildUrl('ws://example.com', 'tok');
			expect(url).toBe('ws://example.com?lobbyID=lobby-99');
		});

		it('includes auth token in protocols', () => {
			createLobbyWebSocket('lobby-1');
			const { protocols } = capturedOptions.buildUrl('ws://example.com', 'my-token');
			expect(protocols).toEqual(['risk-it.websocket.auth.token', 'my-token']);
		});
	});

	describe('messages', () => {
		it('sets lobbyState on lobbyState message', () => {
			const ws = createLobbyWebSocket('lobby-1');
			const lobbyData = { id: 'lobby-1', owner: 'user1', participants: [] };

			capturedOptions.onMessage(
				JSON.stringify({ type: 'lobbyState', data: lobbyData })
			);

			expect(ws.lobbyState).toEqual(lobbyData);
		});

		it('ignores non-lobbyState message types', () => {
			const ws = createLobbyWebSocket('lobby-1');

			capturedOptions.onMessage(
				JSON.stringify({ type: 'otherMessage', data: { something: true } })
			);

			expect(ws.lobbyState).toBeNull();
		});
	});

	describe('initial state', () => {
		it('starts with null lobbyState', () => {
			const ws = createLobbyWebSocket('lobby-1');
			expect(ws.lobbyState).toBeNull();
		});
	});

	describe('API surface', () => {
		it('delegates connect and disconnect to base', () => {
			const ws = createLobbyWebSocket('lobby-1');
			ws.connect();
			ws.disconnect();
			expect(mockBase.connect).toHaveBeenCalled();
			expect(mockBase.disconnect).toHaveBeenCalled();
		});
	});

	describe('label', () => {
		it('passes "Lobby WebSocket" as label', () => {
			createLobbyWebSocket('lobby-1');
			expect(capturedOptions.label).toBe('Lobby WebSocket');
		});
	});
});
