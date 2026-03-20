export interface LobbyParticipant {
	userId: string;
	name: string;
}

export interface LobbySummary {
	id: string;
	owner: string;
	participants: LobbyParticipant[];
}

export interface GameSummary {
	id: number;
	numberOfParticipants: number;
}

export interface GamesSummaryResponse {
	games: GameSummary[];
}

export interface LobbyState {
	id: string;
	owner: string;
	participants: LobbyParticipant[];
}

export interface LobbyWebSocketMessage {
	type: string;
	data: unknown;
}
