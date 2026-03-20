import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
	api: {
		get: vi.fn().mockResolvedValue([]),
		post: vi.fn().mockResolvedValue({})
	}
}));

import { api } from './client';
import { getLobbies, createLobby, joinLobby, startLobby, getGames } from './lobby';

const mockGet = vi.mocked(api.get);
const mockPost = vi.mocked(api.post);

describe('lobby API', () => {
	beforeEach(() => {
		mockGet.mockClear();
		mockPost.mockClear();
	});

	it('getLobbies calls GET /lobbies/summary', async () => {
		await getLobbies();
		expect(mockGet).toHaveBeenCalledWith('/lobbies/summary', expect.any(Function));
	});

	it('createLobby calls POST /lobbies with ownerName', async () => {
		await createLobby('Alice');
		expect(mockPost).toHaveBeenCalledWith('/lobbies', { ownerName: 'Alice' });
	});

	it('joinLobby calls POST /lobbies/{id}/join', async () => {
		await joinLobby('lobby-1', 'Bob');
		expect(mockPost).toHaveBeenCalledWith('/lobbies/lobby-1/join', { participantName: 'Bob' });
	});

	it('startLobby calls POST /lobbies/{id}/start', async () => {
		await startLobby('lobby-1');
		expect(mockPost).toHaveBeenCalledWith('/lobbies/lobby-1/start');
	});

	it('getGames calls GET /games/summary', async () => {
		await getGames();
		expect(mockGet).toHaveBeenCalledWith('/games/summary', expect.any(Function));
	});
});
