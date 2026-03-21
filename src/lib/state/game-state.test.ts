import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WebSocketMessage } from '$lib/types/game';

// Mock auth before importing game-state
vi.mock('$lib/state/auth.svelte', () => ({
	getAuth: () => ({
		user: { id: 'user1' },
		accessToken: 'token'
	})
}));

const { createGameState } = await import('./game-state.svelte');

describe('createGameState', () => {
	let state: ReturnType<typeof createGameState>;

	beforeEach(() => {
		state = createGameState();
	});

	describe('initial state', () => {
		it('has null board, game, players, mission state', () => {
			expect(state.boardState).toBeNull();
			expect(state.gameState).toBeNull();
			expect(state.playersState).toBeNull();
			expect(state.missionState).toBeNull();
		});

		it('has empty card state and move history', () => {
			expect(state.cardState).toEqual({ cards: [] });
			expect(state.moveHistory).toEqual({ moves: [] });
		});
	});

	describe('handleMessage: boardState', () => {
		it('sets regions and populates regionMap + myRegions', () => {
			const msg: WebSocketMessage = {
				type: 'boardState',
				data: {
					regions: [
						{ id: 'r1', ownerId: 'user1', troops: 3 },
						{ id: 'r2', ownerId: 'user2', troops: 2 }
					]
				}
			};
			state.handleMessage(msg);
			expect(state.boardState!.regions).toHaveLength(2);
			expect(state.regionMap.get('r1')).toEqual({ id: 'r1', ownerId: 'user1', troops: 3 });
			expect(state.myRegions).toHaveLength(1);
			expect(state.myRegions[0].id).toBe('r1');
		});
	});

	describe('handleMessage: cardState', () => {
		it('sets cards array', () => {
			const msg: WebSocketMessage = {
				type: 'cardState',
				data: { cards: [{ id: 1, type: 'artillery', region: 'r1' }] }
			};
			state.handleMessage(msg);
			expect(state.cardState.cards).toHaveLength(1);
			expect(state.cardState.cards[0].type).toBe('artillery');
		});
	});

	describe('handleMessage: playerState', () => {
		it('sets players array', () => {
			const msg: WebSocketMessage = {
				type: 'playerState',
				data: {
					players: [
						{ userId: 'user1', name: 'Alice', index: 0, cardCount: 0, status: 'alive', connectionStatus: 'connected' },
						{ userId: 'user2', name: 'Bob', index: 1, cardCount: 0, status: 'alive', connectionStatus: 'connected' }
					]
				}
			};
			state.handleMessage(msg);
			expect(state.playersState!.players).toHaveLength(2);
			expect(state.thisPlayer!.userId).toBe('user1');
		});
	});

	describe('handleMessage: gameState', () => {
		it('parses phase type and state', () => {
			const msg: WebSocketMessage = {
				type: 'gameState',
				data: {
					id: 42,
					turn: 5,
					phase: {
						type: 'deploy',
						state: { deployableTroops: 7 }
					}
				}
			};
			state.handleMessage(msg);
			expect(state.gameState).toEqual({ id: 42, turn: 5, phaseType: 'deploy' });
			expect(state.phase).toEqual({ type: 'deploy', state: { deployableTroops: 7 } });
		});
	});

	describe('handleMessage: missionState', () => {
		it('sets mission', () => {
			const msg: WebSocketMessage = {
				type: 'missionState',
				data: { type: 'TWENTY_FOUR_TERRITORIES', details: {} as Record<string, never> }
			};
			state.handleMessage(msg);
			expect(state.missionState!.type).toBe('TWENTY_FOUR_TERRITORIES');
		});
	});

	describe('handleMessage: moveHistory', () => {
		it('base64-decodes move and result fields and appends', () => {
			const move = { regionId: 'r1' };
			const result = { success: true };
			const msg: WebSocketMessage = {
				type: 'moveHistory',
				data: {
					moves: [
						{
							userId: 'user1',
							phase: 'deploy',
							move: btoa(JSON.stringify(move)),
							result: btoa(JSON.stringify(result)),
							created: '2024-01-01T00:00:00Z'
						}
					]
				}
			};
			state.handleMessage(msg);
			expect(state.moveHistory.moves).toHaveLength(1);
			expect(state.moveHistory.moves[0].move).toEqual(move);
			expect(state.moveHistory.moves[0].result).toEqual(result);
		});

		it('appends to existing history', () => {
			const msg1: WebSocketMessage = {
				type: 'moveHistory',
				data: {
					moves: [{ userId: 'u1', phase: 'deploy', move: btoa('{}'), result: btoa('{}'), created: '' }]
				}
			};
			const msg2: WebSocketMessage = {
				type: 'moveHistory',
				data: {
					moves: [{ userId: 'u2', phase: 'attack', move: btoa('{}'), result: btoa('{}'), created: '' }]
				}
			};
			state.handleMessage(msg1);
			state.handleMessage(msg2);
			expect(state.moveHistory.moves).toHaveLength(2);
		});
	});

	describe('derived: isMyTurn', () => {
		function setupPlayers() {
			const msg: WebSocketMessage = {
				type: 'playerState',
				data: {
					players: [
						{ userId: 'user1', name: 'Alice', index: 0, cardCount: 0, status: 'alive', connectionStatus: 'connected' },
						{ userId: 'user2', name: 'Bob', index: 1, cardCount: 0, status: 'alive', connectionStatus: 'connected' }
					]
				}
			};
			state.handleMessage(msg);
		}

		it('returns true when turn matches player index', () => {
			setupPlayers();
			const msg: WebSocketMessage = {
				type: 'gameState',
				data: { id: 1, turn: 0, phase: { type: 'deploy', state: { deployableTroops: 0 } } }
			};
			state.handleMessage(msg);
			expect(state.isMyTurn).toBe(true);
		});

		it('returns true with modular turn', () => {
			setupPlayers();
			const msg: WebSocketMessage = {
				type: 'gameState',
				data: { id: 1, turn: 4, phase: { type: 'deploy', state: { deployableTroops: 0 } } }
			};
			state.handleMessage(msg);
			// turn 4 % 2 players = 0 = user1's index
			expect(state.isMyTurn).toBe(true);
		});

		it('returns false when not this player turn', () => {
			setupPlayers();
			const msg: WebSocketMessage = {
				type: 'gameState',
				data: { id: 1, turn: 1, phase: { type: 'deploy', state: { deployableTroops: 0 } } }
			};
			state.handleMessage(msg);
			expect(state.isMyTurn).toBe(false);
		});
	});

	describe('derived: deployableTroops', () => {
		it('returns value in deploy phase', () => {
			const msg: WebSocketMessage = {
				type: 'gameState',
				data: { id: 1, turn: 0, phase: { type: 'deploy', state: { deployableTroops: 10 } } }
			};
			state.handleMessage(msg);
			expect(state.deployableTroops).toBe(10);
		});

		it('returns 0 in non-deploy phase', () => {
			const msg: WebSocketMessage = {
				type: 'gameState',
				data: { id: 1, turn: 0, phase: { type: 'attack', state: {} as Record<string, never> } }
			};
			state.handleMessage(msg);
			expect(state.deployableTroops).toBe(0);
		});
	});

	describe('onNextBoardState', () => {
		it('resolves when boardState message arrives', async () => {
			const promise = state.onNextBoardState();
			const msg: WebSocketMessage = {
				type: 'boardState',
				data: { regions: [{ id: 'r1', ownerId: 'user1', troops: 1 }] }
			};
			state.handleMessage(msg);
			await expect(promise).resolves.toBeUndefined();
		});

		it('resolves multiple listeners', async () => {
			const p1 = state.onNextBoardState();
			const p2 = state.onNextBoardState();
			const msg: WebSocketMessage = {
				type: 'boardState',
				data: { regions: [{ id: 'r1', ownerId: 'user1', troops: 1 }] }
			};
			state.handleMessage(msg);
			await expect(p1).resolves.toBeUndefined();
			await expect(p2).resolves.toBeUndefined();
		});

		it('listeners are one-shot', async () => {
			const p1 = state.onNextBoardState();
			const msg: WebSocketMessage = {
				type: 'boardState',
				data: { regions: [{ id: 'r1', ownerId: 'user1', troops: 1 }] }
			};
			state.handleMessage(msg);
			await p1;

			// Register a new listener after the first resolved
			const p2 = state.onNextBoardState();
			let resolved = false;
			p2.then(() => {
				resolved = true;
			});

			// Send another boardState — only p2 should resolve, not p1 again
			state.handleMessage(msg);
			await p2;
			expect(resolved).toBe(true);
		});
	});

	describe('derived: conquerState', () => {
		it('returns state in conquer phase', () => {
			const msg: WebSocketMessage = {
				type: 'gameState',
				data: {
					id: 1,
					turn: 0,
					phase: {
						type: 'conquer',
						state: { attackingRegionId: 'r1', defendingRegionId: 'r2', minTroopsToMove: 2 }
					}
				}
			};
			state.handleMessage(msg);
			expect(state.conquerState).toEqual({
				attackingRegionId: 'r1',
				defendingRegionId: 'r2',
				minTroopsToMove: 2
			});
		});

		it('returns null in non-conquer phase', () => {
			const msg: WebSocketMessage = {
				type: 'gameState',
				data: { id: 1, turn: 0, phase: { type: 'deploy', state: { deployableTroops: 5 } } }
			};
			state.handleMessage(msg);
			expect(state.conquerState).toBeNull();
		});
	});
});
