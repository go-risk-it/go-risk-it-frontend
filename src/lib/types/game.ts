/**
 * Core game state types received via WebSocket during an active game.
 * Covers board regions, players, turn/phase progression, cards, missions,
 * move history, and the top-level WebSocket message envelope.
 */

/** A single territory on the game board. */
export interface Region {
	/** Region identifier matching the map layer ID (e.g. "eastern_australia"). */
	id: string;
	/** User ID of the player who controls this region. */
	ownerId: string;
	/** Number of troops currently stationed in this region. */
	troops: number;
}

/** Snapshot of all regions on the board. */
export interface BoardState {
	regions: Region[];
}

/** Whether a player's WebSocket connection is active. */
export type ConnectionStatus = 'connected' | 'disconnected';

/** Whether a player is still in the game or has been eliminated. */
export type PlayerStatus = 'alive' | 'dead';

/** State of a single player within the game. */
export interface PlayerState {
	userId: string;
	/** Display name shown in the UI. */
	name: string;
	/** Turn order index (0-based). Also used for player color assignment. */
	index: number;
	/** Number of cards in this player's hand (other players' cards are hidden). */
	cardCount: number;
	status: PlayerStatus;
	connectionStatus: ConnectionStatus;
}

/** Container for all player states in the game. */
export interface PlayersState {
	players: PlayerState[];
}

/** The five sequential phases within each turn. */
export type PhaseType = 'cards' | 'deploy' | 'attack' | 'conquer' | 'reinforce';

/** Extra state available during the deploy phase. */
export interface DeployPhaseState {
	/** Number of troops the current player has left to place. */
	deployableTroops: number;
}

/** Extra state available during the conquer phase (after a successful attack). */
export interface ConquerPhaseState {
	/** Region that won the attack. */
	attackingRegionId: string;
	/** Region that was conquered. */
	defendingRegionId: string;
	/** Minimum troops the attacker must move into the conquered region. */
	minTroopsToMove: number;
}

/**
 * Discriminated union on `phase.type` — enables type narrowing without `as` casts.
 * Phases with no extra state use an empty record.
 */
export type Phase =
	| { type: 'deploy'; state: DeployPhaseState }
	| { type: 'conquer'; state: ConquerPhaseState }
	| { type: 'cards'; state: Record<string, never> }
	| { type: 'attack'; state: Record<string, never> }
	| { type: 'reinforce'; state: Record<string, never> };

/** Game state as received from the API (phase is a discriminated union). */
export interface GameStateAPI {
	id: number;
	/** Current turn number (1-based, increments when play returns to the first player). */
	turn: number;
	phase: Phase;
}

/** Core game metadata used by UI stores. Phase type is read from the phase union directly. */
export interface GameState {
	id: number;
	turn: number;
}

/** The four Risk card types. Jolly is the wildcard. */
export type CardType = 'cavalry' | 'infantry' | 'artillery' | 'jolly';

/** A single card in the current player's hand. */
export interface Card {
	id: number;
	type: CardType;
	/** Region depicted on the card (empty for jolly). */
	region: string;
}

/** The current player's hand of cards. */
export interface CardState {
	cards: Card[];
}

/**
 * The player's secret mission objective. Discriminated union on `type` —
 * each variant carries only the details relevant to that mission kind.
 */
export type MissionState =
	| { type: 'TWO_CONTINENTS'; details: { continent1: string; continent2: string } }
	| { type: 'TWO_CONTINENTS_PLUS_ONE'; details: { continent1: string; continent2: string } }
	| { type: 'EIGHTEEN_TERRITORIES_TWO_TROOPS'; details: Record<string, never> }
	| { type: 'TWENTY_FOUR_TERRITORIES'; details: Record<string, never> }
	| { type: 'ELIMINATE_PLAYER'; details: { targetUserId: string } };

/**
 * A move as received on the wire. The `move` and `result` fields are
 * base64-encoded JSON strings that must be decoded before use.
 */
export interface MovePerformedWire {
	/** Player who performed the move. */
	userId: string;
	/** Phase during which the move was made. */
	phase: PhaseType;
	/** Base64-encoded JSON of the move payload. */
	move: string;
	/** Base64-encoded JSON of the server's result for this move. */
	result: string;
	/** ISO 8601 timestamp of when the move was recorded. */
	created: string;
}

/** Wire-format list of moves in chronological order. */
export interface MoveHistoryWire {
	moves: MovePerformedWire[];
}

/** A move after decoding — `move` and `result` are parsed JSON objects. */
export interface MovePerformed {
	userId: string;
	phase: PhaseType;
	move: Record<string, unknown>;
	result: Record<string, unknown>;
	created: string;
}

/** Decoded move history ready for UI consumption. */
export interface MoveHistory {
	moves: MovePerformed[];
}

/**
 * WebSocket message envelope — discriminated union on `type`.
 * Each variant wraps one of the game state slices.
 */
export type WebSocketMessage =
	| { type: 'boardState'; data: BoardState }
	| { type: 'cardState'; data: CardState }
	| { type: 'playerState'; data: PlayersState }
	| { type: 'gameState'; data: GameStateAPI }
	| { type: 'missionState'; data: MissionState }
	| { type: 'moveHistory'; data: MoveHistoryWire };

/** Allowed values for the message type field, used for validation. */
const VALID_MESSAGE_TYPES = new Set<WebSocketMessage['type']>([
	'boardState',
	'cardState',
	'playerState',
	'gameState',
	'missionState',
	'moveHistory'
]);

/**
 * Parse a raw WebSocket text frame into a typed message envelope.
 * Validates that the payload is an object with a known `type` and a `data` field.
 *
 * @param data - Raw JSON string received from the WebSocket.
 * @returns A validated {@link WebSocketMessage}.
 * @throws {Error} If the payload is malformed or has an unknown type.
 */
export function parseWebSocketMessage(data: string): WebSocketMessage {
	const parsed = JSON.parse(data);
	if (
		typeof parsed !== 'object' ||
		parsed === null ||
		!VALID_MESSAGE_TYPES.has(parsed.type) ||
		!('data' in parsed)
	) {
		throw new Error(`Invalid WebSocket message: ${parsed?.type ?? 'missing type'}`);
	}
	return parsed as WebSocketMessage;
}
