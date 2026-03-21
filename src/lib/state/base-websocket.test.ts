import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock auth before importing base-websocket
vi.mock('$lib/state/auth.svelte', () => ({
	getAuth: vi.fn(() => ({
		accessToken: 'test-token'
	}))
}));

import { getAuth } from '$lib/state/auth.svelte';

interface MockWsInstance {
	url: string;
	protocols: string[];
	onopen: (() => void) | null;
	onclose: (() => void) | null;
	onmessage: ((event: { data: string }) => void) | null;
	onerror: ((error: Event) => void) | null;
	close: ReturnType<typeof vi.fn>;
}

let mockInstances: MockWsInstance[] = [];
const MockWebSocket = vi.fn().mockImplementation((url: string, protocols: string[]) => {
	const instance: MockWsInstance = {
		url,
		protocols,
		onopen: null,
		onclose: null,
		onmessage: null,
		onerror: null,
		close: vi.fn()
	};
	mockInstances.push(instance);
	return instance;
});
globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;

const { createBaseWebSocket } = await import('./base-websocket.svelte');

describe('createBaseWebSocket', () => {
	let onMessage: ReturnType<typeof vi.fn>;

	function defaultOptions(overrides?: { label?: string }) {
		return {
			buildUrl: (baseUrl: string, token: string) => ({
				url: `${baseUrl}?token=${token}`,
				protocols: ['protocol', token]
			}),
			onMessage,
			...overrides
		};
	}

	beforeEach(() => {
		vi.useFakeTimers();
		mockInstances = [];
		MockWebSocket.mockClear();
		onMessage = vi.fn();
		vi.mocked(getAuth).mockReturnValue({
			accessToken: 'test-token'
		} as ReturnType<typeof getAuth>);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('initial state', () => {
		it('starts disconnected', () => {
			const ws = createBaseWebSocket(defaultOptions());
			expect(ws.connected).toBe(false);
			expect(ws.reconnecting).toBe(false);
			expect(ws.retriesExhausted).toBe(false);
		});

		it('does not create WebSocket before connect', () => {
			createBaseWebSocket(defaultOptions());
			expect(MockWebSocket).not.toHaveBeenCalled();
		});

		it('uses default label when none provided', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			const instance = mockInstances[0];
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			instance.onerror!(new Event('error'));
			expect(spy).toHaveBeenCalledWith('WebSocket error:', expect.any(Event));
			spy.mockRestore();
		});
	});

	describe('connect', () => {
		it('creates WebSocket with correct url and protocols', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			expect(MockWebSocket).toHaveBeenCalledWith('ws://localhost:8080/ws?token=test-token', [
				'protocol',
				'test-token'
			]);
		});

		it('sets connected=true on open', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			expect(ws.connected).toBe(false);
			mockInstances[0].onopen!();
			expect(ws.connected).toBe(true);
		});

		it('does nothing when already connected', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			mockInstances[0].onopen!();
			ws.connect();
			expect(MockWebSocket).toHaveBeenCalledTimes(1);
		});

		it('does nothing when no auth token', () => {
			vi.mocked(getAuth).mockReturnValue({
				accessToken: null
			} as unknown as ReturnType<typeof getAuth>);
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			expect(MockWebSocket).not.toHaveBeenCalled();
		});

		it('does nothing after teardown requested', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.disconnect();
			ws.connect();
			expect(MockWebSocket).not.toHaveBeenCalled();
		});
	});

	describe('onmessage', () => {
		it('calls onMessage callback with event data', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			mockInstances[0].onmessage!({ data: 'hello' });
			expect(onMessage).toHaveBeenCalledWith('hello');
		});

		it('logs error when onMessage throws', () => {
			onMessage.mockImplementation(() => {
				throw new Error('parse fail');
			});
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			mockInstances[0].onmessage!({ data: 'bad' });
			expect(spy).toHaveBeenCalledWith('Failed to parse WebSocket message:', 'bad');
			spy.mockRestore();
		});

		it('uses custom label in error messages', () => {
			onMessage.mockImplementation(() => {
				throw new Error('fail');
			});
			const ws = createBaseWebSocket(defaultOptions({ label: 'Lobby' }));
			ws.connect();
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			mockInstances[0].onmessage!({ data: 'x' });
			expect(spy).toHaveBeenCalledWith('Failed to parse Lobby message:', 'x');
			spy.mockRestore();
		});
	});

	describe('onerror', () => {
		it('logs error event with label', () => {
			const ws = createBaseWebSocket(defaultOptions({ label: 'Game' }));
			ws.connect();
			const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const errorEvent = new Event('error');
			mockInstances[0].onerror!(errorEvent);
			expect(spy).toHaveBeenCalledWith('Game error:', errorEvent);
			spy.mockRestore();
		});
	});

	describe('reconnection', () => {
		it('sets reconnecting=true on close', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			mockInstances[0].onopen!();
			mockInstances[0].onclose!();
			expect(ws.connected).toBe(false);
			expect(ws.reconnecting).toBe(true);
		});

		it('retries after 200ms fast retry delay', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			mockInstances[0].onclose!();
			expect(mockInstances).toHaveLength(1);
			vi.advanceTimersByTime(199);
			expect(mockInstances).toHaveLength(1);
			vi.advanceTimersByTime(1);
			expect(mockInstances).toHaveLength(2);
		});

		it('uses fast retries then exponential backoff delays', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();

			// First 2 retries are fast (200ms), then exponential backoff
			const delays = [200, 200, 1000, 2000, 4000];
			for (let i = 0; i < delays.length; i++) {
				mockInstances[i].onclose!();
				vi.advanceTimersByTime(delays[i] - 1);
				expect(mockInstances).toHaveLength(i + 1);
				vi.advanceTimersByTime(1);
				expect(mockInstances).toHaveLength(i + 2);
			}
		});

		it('resets retry state on successful reconnect', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();

			// Close and wait for retry
			mockInstances[0].onclose!();
			vi.advanceTimersByTime(200);
			expect(mockInstances).toHaveLength(2);

			// Successful reconnect
			mockInstances[1].onopen!();
			expect(ws.connected).toBe(true);
			expect(ws.reconnecting).toBe(false);

			// Next close should start fresh with 200ms fast retry delay
			mockInstances[1].onclose!();
			vi.advanceTimersByTime(199);
			expect(mockInstances).toHaveLength(2);
			vi.advanceTimersByTime(1);
			expect(mockInstances).toHaveLength(3);
		});

		it('sets retriesExhausted after 5 failures', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();

			const delays = [200, 200, 1000, 2000, 4000];
			for (let i = 0; i < 5; i++) {
				mockInstances[i].onclose!();
				vi.advanceTimersByTime(delays[i]);
			}
			// 6th instance: close it to trigger exhaustion check
			mockInstances[5].onclose!();
			expect(ws.retriesExhausted).toBe(true);
			expect(ws.reconnecting).toBe(false);
		});

		it('stops creating connections after retries exhausted', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();

			const delays = [200, 200, 1000, 2000, 4000];
			for (let i = 0; i < 5; i++) {
				mockInstances[i].onclose!();
				vi.advanceTimersByTime(delays[i]);
			}
			mockInstances[5].onclose!();
			expect(ws.retriesExhausted).toBe(true);

			// No more connections should be created
			vi.advanceTimersByTime(100000);
			expect(mockInstances).toHaveLength(6);
		});

		it('does not retry when teardownRequested', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			ws.disconnect();
			// Manually trigger onclose after disconnect
			mockInstances[0].onclose!();
			vi.advanceTimersByTime(10000);
			// Only the original instance, no retries
			expect(mockInstances).toHaveLength(1);
		});
	});

	describe('disconnect', () => {
		it('closes socket and resets state', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			mockInstances[0].onopen!();
			expect(ws.connected).toBe(true);
			ws.disconnect();
			expect(mockInstances[0].close).toHaveBeenCalled();
			expect(ws.connected).toBe(false);
			expect(ws.reconnecting).toBe(false);
		});

		it('clears pending retry timeout', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			mockInstances[0].onclose!();
			expect(ws.reconnecting).toBe(true);
			ws.disconnect();
			// Advance past the retry delay — no new WebSocket should be created
			vi.advanceTimersByTime(5000);
			expect(mockInstances).toHaveLength(1);
		});
	});

	describe('manualReconnect', () => {
		it('resets all state and connects after exhaustion', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();

			// Exhaust retries
			const delays = [200, 200, 1000, 2000, 4000];
			for (let i = 0; i < 5; i++) {
				mockInstances[i].onclose!();
				vi.advanceTimersByTime(delays[i]);
			}
			mockInstances[5].onclose!();
			expect(ws.retriesExhausted).toBe(true);

			ws.manualReconnect();
			expect(ws.retriesExhausted).toBe(false);
			expect(ws.reconnecting).toBe(false);
			expect(mockInstances).toHaveLength(7);
		});
	});

	describe('reconnectWithNewToken', () => {
		it('closes existing and reconnects with fresh token', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			mockInstances[0].onopen!();

			vi.mocked(getAuth).mockReturnValue({
				accessToken: 'new-token'
			} as ReturnType<typeof getAuth>);

			ws.reconnectWithNewToken();
			expect(mockInstances[0].close).toHaveBeenCalled();
			expect(mockInstances).toHaveLength(2);
			expect(mockInstances[1].url).toBe('ws://localhost:8080/ws?token=new-token');
		});

		it('does nothing when teardown requested', () => {
			const ws = createBaseWebSocket(defaultOptions());
			ws.connect();
			ws.disconnect();
			const count = mockInstances.length;
			ws.reconnectWithNewToken();
			expect(mockInstances).toHaveLength(count);
		});
	});
});
