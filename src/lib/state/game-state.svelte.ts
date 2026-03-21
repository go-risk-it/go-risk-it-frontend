/**
 * Central game state store that holds board, players, cards, mission, and phase data.
 * State is populated exclusively via WebSocket messages processed by {@link handleMessage}.
 * Derived values (thisPlayer, isMyTurn, regionMap, etc.) are computed reactively with $derived.
 */

import type {
	BoardState,
	CardState,
	GameState,
	Region,
	MissionState,
	MoveHistory,
	MovePerformed,
	Phase,
	PlayersState,
	WebSocketMessage
} from '$lib/types/game';
import { getAuth } from '$lib/state/auth.svelte';

/**
 * Create a reactive game state container.
 * @returns Reactive getters for all game sub-states, derived convenience values, and a message handler.
 */
export function createGameState() {
	let boardState = $state<BoardState | null>(null);
	let cardState = $state<CardState>({ cards: [] });
	let gameState = $state<GameState | null>(null);
	let phase = $state<Phase | null>(null);
	let playersState = $state<PlayersState | null>(null);
	let missionState = $state<MissionState | null>(null);
	let moveHistory = $state<MoveHistory>({ moves: [] });

	// One-shot listeners for board state changes (used by blitz mode)
	let boardStateListeners: Array<() => void> = [];

	const auth = getAuth();

	/** The authenticated user's player record, or null if not found in the game. */
	const thisPlayer = $derived.by(() => {
		if (!playersState || !auth.user) return null;
		return playersState.players.find((p) => p.userId === auth.user!.id) ?? null;
	});

	/** True when the current turn index matches this player's position (turn % playerCount). */
	const isMyTurn = $derived.by(() => {
		if (!gameState || !playersState || !thisPlayer) return false;
		const playerCount = playersState.players.length;
		return gameState.turn % playerCount === thisPlayer.index;
	});

	/** Precomputed region ID -> Region lookup for O(1) access by map components. */
	const regionMap = $derived.by(() => {
		if (!boardState) return new Map<string, Region>();
		const map = new Map<string, Region>();
		for (const region of boardState.regions) {
			map.set(region.id, region);
		}
		return map;
	});

	/** Regions owned by the authenticated user, used for deploy/reinforce validation. */
	const myRegions = $derived.by(() => {
		if (!boardState || !auth.user) return [];
		return boardState.regions.filter((r) => r.ownerId === auth.user!.id);
	});

	/** Number of troops available to deploy (0 when not in deploy phase). */
	const deployableTroops = $derived.by(() => {
		if (!phase || phase.type !== 'deploy') return 0;
		return phase.state.deployableTroops;
	});

	/** Conquer phase constraints (min/max troops to move), or null when not conquering. */
	const conquerState = $derived.by(() => {
		if (!phase || phase.type !== 'conquer') return null;
		return phase.state;
	});

	/**
	 * Process an incoming WebSocket message and update the corresponding state slice.
	 * @param msg - Typed message from the game WebSocket.
	 */
	function handleMessage(msg: WebSocketMessage) {
		switch (msg.type) {
			case 'boardState':
				boardState = msg.data;
				// Notify one-shot listeners
				for (const cb of boardStateListeners) cb();
				boardStateListeners = [];
				break;

			case 'cardState':
				cardState = msg.data;
				break;

			case 'playerState':
				playersState = msg.data;
				break;

			case 'gameState': {
				const data = msg.data;
				gameState = {
					id: data.id,
					turn: data.turn
				};
				phase = data.phase;
				break;
			}

			case 'missionState':
				missionState = msg.data;
				break;

			case 'moveHistory': {
				const data = msg.data;
				// Move payloads arrive base64-encoded JSON; decode before storing
				const decoded: MovePerformed[] = data.moves.map((m) => ({
					...m,
					move: JSON.parse(atob(m.move)),
					result: JSON.parse(atob(m.result))
				}));
				// Dedup by created timestamp to handle reconnect resends
				const existing = new Set(moveHistory.moves.map((m) => m.created));
				const newMoves = decoded.filter((m) => !existing.has(m.created));
				moveHistory = { moves: [...moveHistory.moves, ...newMoves] };
				break;
			}
		}
	}

	/**
	 * Returns a promise that resolves on the next board state WebSocket update.
	 * Used by blitz mode to synchronize attacks with server state.
	 */
	function onNextBoardState(): Promise<void> {
		return new Promise((resolve) => {
			boardStateListeners.push(resolve);
		});
	}

	return {
		get boardState() {
			return boardState;
		},
		get cardState() {
			return cardState;
		},
		get gameState() {
			return gameState;
		},
		get phase() {
			return phase;
		},
		get playersState() {
			return playersState;
		},
		get thisPlayer() {
			return thisPlayer;
		},
		get missionState() {
			return missionState;
		},
		get moveHistory() {
			return moveHistory;
		},
		get isMyTurn() {
			return isMyTurn;
		},
		get regionMap() {
			return regionMap;
		},
		get myRegions() {
			return myRegions;
		},
		get deployableTroops() {
			return deployableTroops;
		},
		get conquerState() {
			return conquerState;
		},
		handleMessage,
		onNextBoardState
	};
}
