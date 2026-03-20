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

export function createGameState() {
	let boardState = $state<BoardState | null>(null);
	let cardState = $state<CardState>({ cards: [] });
	let gameState = $state<GameState | null>(null);
	let phase = $state<Phase | null>(null);
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
		if (!phase || phase.type !== 'deploy') return 0;
		return phase.state.deployableTroops;
	});

	const conquerState = $derived.by(() => {
		if (!phase || phase.type !== 'conquer') return null;
		return phase.state;
	});

	function handleMessage(msg: WebSocketMessage) {
		switch (msg.type) {
			case 'boardState':
				boardState = msg.data;
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
					turn: data.turn,
					phaseType: data.phase.type
				};
				phase = data.phase;
				break;
			}

			case 'missionState':
				missionState = msg.data;
				break;

			case 'moveHistory': {
				const data = msg.data;
				const decoded: MovePerformed[] = data.moves.map((m) => ({
					...m,
					move: JSON.parse(atob(m.move)),
					result: JSON.parse(atob(m.result))
				}));
				moveHistory = { moves: [...moveHistory.moves, ...decoded] };
				break;
			}
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
		handleMessage
	};
}
