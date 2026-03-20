/**
 * Types for the pre-game lobby where players gather before a game starts.
 * Covers lobby participants, lobby/game summaries for the home screen,
 * and the lobby WebSocket message envelope.
 */

/** A user who has joined a lobby. */
export interface LobbyParticipant {
	userId: string;
	/** Display name shown in the lobby UI. */
	name: string;
}

/** Summary of a lobby as shown in the lobby list on the home screen. */
export interface LobbySummary {
	id: string;
	/** User ID of the player who created the lobby. */
	owner: string;
	participants: LobbyParticipant[];
}

/** Summary of an active or completed game, shown on the home screen. */
export interface GameSummary {
	id: number;
	numberOfParticipants: number;
}

/** Response wrapper for the list-games API endpoint. */
export interface GamesSummaryResponse {
	games: GameSummary[];
}

/** Full lobby state received via WebSocket while inside a lobby. */
export interface LobbyState {
	id: string;
	/** User ID of the lobby creator (only the owner can start the game). */
	owner: string;
	participants: LobbyParticipant[];
}

/** WebSocket message envelope for lobby-scoped events. */
export interface LobbyWebSocketMessage {
	/** Event type identifier (e.g. "lobbyState", "gameStarted"). */
	type: string;
	/** Payload whose shape depends on the message type. */
	data: unknown;
}
