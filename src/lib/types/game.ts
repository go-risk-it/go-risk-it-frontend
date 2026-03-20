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

export type PhaseState = Record<string, never> | DeployPhaseState | ConquerPhaseState;

export interface GameStateAPI {
	id: number;
	turn: number;
	phase: {
		type: PhaseType;
		state: PhaseState;
	};
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
export type MissionType =
	| 'TWO_CONTINENTS'
	| 'TWO_CONTINENTS_PLUS_ONE'
	| 'EIGHTEEN_TERRITORIES_TWO_TROOPS'
	| 'TWENTY_FOUR_TERRITORIES'
	| 'ELIMINATE_PLAYER';

export interface MissionState {
	type: MissionType;
	details: Record<string, unknown>;
}

// Move history from WebSocket
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

// WebSocket message envelope
export interface WebSocketMessage {
	type: string;
	data: unknown;
}
