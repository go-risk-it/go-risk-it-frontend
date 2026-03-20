// Board state from WebSocket
export interface Region {
	id: string;
	ownerId: string;
	troops: number;
}

export interface BoardState {
	regions: Region[];
}

// Player state from WebSocket
export type ConnectionStatus = 'connected' | 'disconnected';
export type PlayerStatus = 'alive' | 'dead';

export interface PlayerState {
	userId: string;
	name: string;
	index: number;
	cardCount: number;
	status: PlayerStatus;
	connectionStatus: ConnectionStatus;
}

export interface PlayersState {
	players: PlayerState[];
}

// Game state from WebSocket
export type PhaseType = 'cards' | 'deploy' | 'attack' | 'conquer' | 'reinforce';

export interface DeployPhaseState {
	deployableTroops: number;
}

export interface ConquerPhaseState {
	attackingRegionId: string;
	defendingRegionId: string;
	minTroopsToMove: number;
}

// Discriminated union on phase.type — enables type narrowing without `as` casts
export type Phase =
	| { type: 'deploy'; state: DeployPhaseState }
	| { type: 'conquer'; state: ConquerPhaseState }
	| { type: 'cards'; state: Record<string, never> }
	| { type: 'attack'; state: Record<string, never> }
	| { type: 'reinforce'; state: Record<string, never> };

export interface GameStateAPI {
	id: number;
	turn: number;
	phase: Phase;
}

export interface GameState {
	id: number;
	turn: number;
	phaseType: PhaseType;
}

// Card state from WebSocket
export type CardType = 'cavalry' | 'infantry' | 'artillery' | 'jolly';

export interface Card {
	id: number;
	type: CardType;
	region: string;
}

export interface CardState {
	cards: Card[];
}

// Mission state from WebSocket
export type MissionState =
	| { type: 'TWO_CONTINENTS'; details: { continent1: string; continent2: string } }
	| { type: 'TWO_CONTINENTS_PLUS_ONE'; details: { continent1: string; continent2: string } }
	| { type: 'EIGHTEEN_TERRITORIES_TWO_TROOPS'; details: Record<string, never> }
	| { type: 'TWENTY_FOUR_TERRITORIES'; details: Record<string, never> }
	| { type: 'ELIMINATE_PLAYER'; details: { targetUserId: string } };

// Move history from WebSocket
// Wire format: move and result are base64-encoded JSON strings from the server
export interface MovePerformedWire {
	userId: string;
	phase: PhaseType;
	move: string;
	result: string;
	created: string;
}

export interface MoveHistoryWire {
	moves: MovePerformedWire[];
}

// Decoded format: move and result are parsed JSON objects
export interface MovePerformed {
	userId: string;
	phase: PhaseType;
	move: Record<string, unknown>;
	result: Record<string, unknown>;
	created: string;
}

export interface MoveHistory {
	moves: MovePerformed[];
}

// WebSocket message envelope — discriminated union
export type WebSocketMessage =
	| { type: 'boardState'; data: BoardState }
	| { type: 'cardState'; data: CardState }
	| { type: 'playerState'; data: PlayersState }
	| { type: 'gameState'; data: GameStateAPI }
	| { type: 'missionState'; data: MissionState }
	| { type: 'moveHistory'; data: MoveHistoryWire };

const VALID_MESSAGE_TYPES = new Set<WebSocketMessage['type']>([
	'boardState',
	'cardState',
	'playerState',
	'gameState',
	'missionState',
	'moveHistory'
]);

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
