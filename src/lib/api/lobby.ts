import { api } from './client';
import type { LobbySummary, GameSummary, GamesSummaryResponse } from '$lib/types/lobby';

export function getLobbies(): Promise<LobbySummary[]> {
	return api.get<LobbySummary[]>('/lobbies/summary');
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
	const data = await api.get<GamesSummaryResponse>('/games/summary');
	return data.games ?? [];
}
