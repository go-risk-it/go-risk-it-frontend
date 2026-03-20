import { api } from './client';
import type { LobbySummary, GameSummary, GamesSummaryResponse } from '$lib/types/lobby';

function isLobbySummaryArray(data: unknown): data is LobbySummary[] {
	return Array.isArray(data) && data.every((d) =>
		typeof d === 'object' && d !== null && 'id' in d && 'participants' in d
	);
}

function isGamesSummaryResponse(data: unknown): data is GamesSummaryResponse {
	return typeof data === 'object' && data !== null && 'games' in data && Array.isArray((data as GamesSummaryResponse).games);
}

export function getLobbies(): Promise<LobbySummary[]> {
	return api.get<LobbySummary[]>('/lobbies/summary', isLobbySummaryArray);
}

export function createLobby(ownerName: string) {
	return api.post('/lobbies', { ownerName });
}

export function joinLobby(lobbyId: string, participantName: string) {
	return api.post(`/lobbies/${lobbyId}/join`, { participantName });
}

export function startLobby(lobbyId: string) {
	return api.post(`/lobbies/${lobbyId}/start`);
}

export async function getGames(): Promise<GameSummary[]> {
	const data = await api.get<GamesSummaryResponse>('/games/summary', isGamesSummaryResponse);
	return data.games ?? [];
}
