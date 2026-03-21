import { API_URL } from './config';

async function apiFetch(jwt: string, path: string, options?: RequestInit): Promise<Response> {
	const res = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json',
			...options?.headers
		}
	});
	if (!res.ok) {
		throw new Error(`${options?.method ?? 'GET'} ${path}: ${res.status} ${await res.text()}`);
	}
	return res;
}

/**
 * Reset all game state via the admin API.
 */
export async function resetState(jwt: string): Promise<void> {
	await apiFetch(jwt, '/reset', { method: 'POST' });
}

/**
 * Create a lobby via the API. Returns the lobby ID (int64).
 */
export async function createLobbyApi(jwt: string, ownerName: string): Promise<{ lobbyId: number }> {
	const res = await apiFetch(jwt, '/lobbies', {
		method: 'POST',
		body: JSON.stringify({ ownerName })
	});
	return res.json();
}

/**
 * Join a lobby via the API.
 */
export async function joinLobbyApi(
	jwt: string,
	lobbyId: number,
	participantName: string
): Promise<void> {
	await apiFetch(jwt, `/lobbies/${lobbyId}/join`, {
		method: 'POST',
		body: JSON.stringify({ participantName })
	});
}

/**
 * Start a lobby (begin game) via the API. Returns 200 with no body.
 */
export async function startLobbyApi(jwt: string, lobbyId: number): Promise<void> {
	await apiFetch(jwt, `/lobbies/${lobbyId}/start`, { method: 'POST' });
}

/**
 * Get available games for the authenticated user.
 */
export async function getGamesSummaryApi(jwt: string): Promise<{ id: number }[]> {
	const res = await apiFetch(jwt, '/games/summary');
	const data = (await res.json()) as { games: { id: number }[] };
	return data.games;
}

/**
 * Set up near-win state for a game via the test-only API.
 */
export async function setupNearWinApi(jwt: string, gameId: number): Promise<void> {
	await apiFetch(jwt, '/setup-near-win', {
		method: 'POST',
		body: JSON.stringify({ gameId })
	});
}
