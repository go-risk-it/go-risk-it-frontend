/**
 * Lobby and game listing API calls. Handles creating, joining, and starting
 * lobbies as well as fetching lobby and game summaries. Response shapes are
 * validated at runtime with type guard functions before being returned.
 */
import { api } from './client';
import type { LobbySummary, GameSummary, GamesSummaryResponse } from '$lib/types/lobby';

/** Runtime type guard ensuring the response is an array of lobby summaries. */
function isLobbySummaryArray(data: unknown): data is LobbySummary[] {
	return (
		Array.isArray(data) &&
		data.every((d) => typeof d === 'object' && d !== null && 'id' in d && 'participants' in d)
	);
}

/** Runtime type guard ensuring the response wraps a games array. */
function isGamesSummaryResponse(data: unknown): data is GamesSummaryResponse {
	return (
		typeof data === 'object' &&
		data !== null &&
		'games' in data &&
		Array.isArray((data as GamesSummaryResponse).games)
	);
}

/**
 * Fetches all available lobbies. The response is validated to ensure
 * each entry has at minimum an `id` and `participants` field.
 * @throws {ApiError} On network/auth/server errors
 */
export function getLobbies(): Promise<LobbySummary[]> {
	return api.get<LobbySummary[]>('/lobbies/summary', isLobbySummaryArray);
}

/**
 * Creates a new lobby owned by the current user.
 * @param ownerName - Display name for the lobby owner
 * @throws {ApiError} With status 400 if the name is invalid
 */
export function createLobby(ownerName: string) {
	return api.post('/lobbies', { ownerName });
}

/**
 * Joins an existing lobby as a participant.
 * @param lobbyId - UUID of the lobby to join
 * @param participantName - Display name for the joining player
 * @throws {ApiError} With status 409 if the lobby is full or already started
 */
export function joinLobby(lobbyId: string, participantName: string) {
	return api.post(`/lobbies/${lobbyId}/join`, { participantName });
}

/**
 * Starts a lobby, transitioning it into an active game. Only the lobby
 * owner can trigger this.
 * @param lobbyId - UUID of the lobby to start
 * @throws {ApiError} With status 409 if the lobby lacks enough participants
 */
export function startLobby(lobbyId: string) {
	return api.post(`/lobbies/${lobbyId}/start`);
}

/**
 * Fetches all games the current user is participating in. Unwraps the
 * `{ games: [...] }` envelope, returning an empty array if none exist.
 * @throws {ApiError} On network/auth/server errors
 */
export async function getGames(): Promise<GameSummary[]> {
	const data = await api.get<GamesSummaryResponse>('/games/summary', isGamesSummaryResponse);
	return data.games ?? [];
}
