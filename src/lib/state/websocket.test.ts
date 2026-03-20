import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture the options passed to createBaseWebSocket
let capturedOptions: {
	buildUrl: (baseUrl: string, token: string) => { url: string; protocols: string[] };
	onMessage: (data: string) => void;
	label?: string;
};

const mockBase = {
	_connected: false,
	_reconnecting: false,
	_retriesExhausted: false,
	get connected() {
		return this._connected;
	},
	get reconnecting() {
		return this._reconnecting;
	},
	get retriesExhausted() {
		return this._retriesExhausted;
	},
	connect: vi.fn(),
	disconnect: vi.fn(),
	manualReconnect: vi.fn(),
	reconnectWithNewToken: vi.fn()
};

vi.mock('$lib/state/base-websocket.svelte', () => ({
	createBaseWebSocket: vi.fn((opts: typeof capturedOptions) => {
		capturedOptions = opts;
		return mockBase;
	})
}));

const { createWebSocket } = await import('./websocket.svelte');

describe('createWebSocket', () => {
	beforeEach(() => {
		mockBase._connected = false;
		mockBase._reconnecting = false;
		mockBase._retriesExhausted = false;
		mockBase.connect.mockClear();
		mockBase.disconnect.mockClear();
		mockBase.manualReconnect.mockClear();
		mockBase.reconnectWithNewToken.mockClear();
	});

	describe('URL building', () => {
		it('builds URL with gameID query parameter', () => {
			createWebSocket('game-42');
			const { url } = capturedOptions.buildUrl('ws://example.com', 'tok');
			expect(url).toBe('ws://example.com?gameID=game-42');
		});

		it('includes auth token in protocols', () => {
			createWebSocket('game-1');
			const { protocols } = capturedOptions.buildUrl('ws://example.com', 'my-token');
			expect(protocols).toEqual(['risk-it.websocket.auth.token', 'my-token']);
		});
	});

	describe('messages', () => {
		it('parses JSON and calls registered handler', () => {
			const ws = createWebSocket('g1');
			const handler = vi.fn();
			ws.onMessage(handler);

			capturedOptions.onMessage(JSON.stringify({ type: 'boardState', data: {} }));
			expect(handler).toHaveBeenCalledWith({ type: 'boardState', data: {} });
		});

		it('does not throw when no handler registered', () => {
			createWebSocket('g1');
			expect(() => {
				capturedOptions.onMessage(JSON.stringify({ type: 'test', data: null }));
			}).not.toThrow();
		});

		it('throws on invalid JSON', () => {
			createWebSocket('g1');
			expect(() => {
				capturedOptions.onMessage('not-json');
			}).toThrow();
		});
	});

	describe('API surface', () => {
		it('delegates connect/disconnect/manualReconnect/reconnectWithNewToken', () => {
			const ws = createWebSocket('g1');
			ws.connect();
			ws.disconnect();
			ws.manualReconnect();
			ws.reconnectWithNewToken();
			expect(mockBase.connect).toHaveBeenCalled();
			expect(mockBase.disconnect).toHaveBeenCalled();
			expect(mockBase.manualReconnect).toHaveBeenCalled();
			expect(mockBase.reconnectWithNewToken).toHaveBeenCalled();
		});

		it('delegates connected/reconnecting/retriesExhausted getters', () => {
			const ws = createWebSocket('g1');
			expect(ws.connected).toBe(false);
			expect(ws.reconnecting).toBe(false);
			expect(ws.retriesExhausted).toBe(false);

			mockBase._connected = true;
			mockBase._reconnecting = true;
			mockBase._retriesExhausted = true;
			expect(ws.connected).toBe(true);
			expect(ws.reconnecting).toBe(true);
			expect(ws.retriesExhausted).toBe(true);
		});
	});

	describe('label', () => {
		it('passes "WebSocket" as label', () => {
			createWebSocket('g1');
			expect(capturedOptions.label).toBe('WebSocket');
		});
	});
});
