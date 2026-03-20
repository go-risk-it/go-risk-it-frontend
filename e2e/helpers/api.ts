const API_URL = 'http://localhost:8080/api/v1';

/**
 * Reset all game state via the admin API.
 */
export async function resetState(jwt: string): Promise<void> {
	const res = await fetch(`${API_URL}/reset`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json'
		}
	});
	if (!res.ok) {
		throw new Error(`Reset failed: ${res.status} ${await res.text()}`);
	}
}

/**
 * Create a lobby via the API. Returns the lobby ID (int64).
 */
export async function createLobbyApi(
	jwt: string,
	ownerName: string
): Promise<{ lobbyId: number }> {
	const res = await fetch(`${API_URL}/lobbies`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ ownerName })
	});
	if (!res.ok) {
		throw new Error(`Create lobby failed: ${res.status} ${await res.text()}`);
	}
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
	const res = await fetch(`${API_URL}/lobbies/${lobbyId}/join`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ participantName })
	});
	if (!res.ok) {
		throw new Error(`Join lobby failed: ${res.status} ${await res.text()}`);
	}
}

/**
 * Start a lobby (begin game) via the API. Returns 200 with no body.
 */
export async function startLobbyApi(jwt: string, lobbyId: number): Promise<void> {
	const res = await fetch(`${API_URL}/lobbies/${lobbyId}/start`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json'
		}
	});
	if (!res.ok) {
		throw new Error(`Start lobby failed: ${res.status} ${await res.text()}`);
	}
}

/**
 * Get available games for the authenticated user.
 */
export async function getGamesSummaryApi(jwt: string): Promise<{ id: number }[]> {
	const res = await fetch(`${API_URL}/games/summary`, {
		headers: {
			Authorization: `Bearer ${jwt}`
		}
	});
	if (!res.ok) {
		throw new Error(`Get games summary failed: ${res.status} ${await res.text()}`);
	}
	const data = (await res.json()) as { games: { id: number }[] };
	return data.games;
}
