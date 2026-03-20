import type {
	BoardState,
	CardState,
	GameState,
	GameStateAPI,
	Region,
	MissionState,
	MoveHistory,
	MovePerformed,
	PhaseState,
	PlayerState,
	PlayersState,
	WebSocketMessage,
	DeployPhaseState,
	ConquerPhaseState
} from '$lib/types/game';
import { getAuth } from '$lib/state/auth.svelte';

export function createGameState() {
	let boardState = $state<BoardState | null>(null);
	let cardState = $state<CardState>({ cards: [] });
	let gameState = $state<GameState | null>(null);
	let phaseState = $state<PhaseState | null>(null);
	let playersState = $state<PlayersState | null>(null);
	let missionState = $state<MissionState | null>(null);
	let moveHistory = $state<MoveHistory>({ moves: [] });

	const auth = getAuth();

	const thisPlayer = $derived.by(() => {
		if (!playersState || !auth.user) return null;
		return playersState.players.find((p) => p.userId === auth.user!.id) ?? null;
	});

	const isMyTurn = $derived.by(() => {
		if (!gameState || !playersState || !thisPlayer) return false;
		const playerCount = playersState.players.length;
		return gameState.turn % playerCount === thisPlayer.index;
	});

	const regionMap = $derived.by(() => {
		if (!boardState) return new Map<string, Region>();
		const map = new Map<string, Region>();
		for (const region of boardState.regions) {
			map.set(region.id, region);
		}
		return map;
	});

	const myRegions = $derived.by(() => {
		if (!boardState || !auth.user) return [];
		return boardState.regions.filter((r) => r.ownerId === auth.user!.id);
	});

	const deployableTroops = $derived.by(() => {
		if (!phaseState || !gameState || gameState.phaseType !== 'deploy') return 0;
		return (phaseState as DeployPhaseState).deployableTroops ?? 0;
	});

	const conquerState = $derived.by(() => {
		if (!phaseState || !gameState || gameState.phaseType !== 'conquer') return null;
		return phaseState as ConquerPhaseState;
	});

	function handleMessage(msg: WebSocketMessage) {
		switch (msg.type) {
			case 'boardState':
				boardState = msg.data as BoardState;
				break;

			case 'cardState':
				cardState = msg.data as CardState;
				break;

			case 'playerState':
				playersState = msg.data as PlayersState;
				break;

			case 'gameState': {
				const data = msg.data as GameStateAPI;
				gameState = {
					id: data.id,
					turn: data.turn,
					phaseType: data.phase.type
				};
				phaseState = data.phase.state;
				break;
			}

			case 'missionState':
				missionState = msg.data as MissionState;
				break;

			case 'moveHistory': {
				const data = msg.data as MoveHistory;
				// Decode base64-encoded move and result fields
				const decoded: MovePerformed[] = data.moves.map((m) => ({
					...m,
					move: JSON.parse(atob(m.move as unknown as string)),
					result: JSON.parse(atob(m.result as unknown as string))
				}));
				moveHistory = { moves: [...moveHistory.moves, ...decoded] };
				break;
			}

			default:
				console.warn('Unhandled WebSocket message type:', msg.type);
		}
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
		get phaseState() {
			return phaseState;
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
		handleMessage
	};
}
