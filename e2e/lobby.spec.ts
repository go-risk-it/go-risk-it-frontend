import { test, expect } from '@playwright/test';
import { createUser, authenticateContext, type UserInfo } from './helpers/auth';
import { resetState, joinLobbyApi, startLobbyApi, getGamesSummaryApi } from './helpers/api';

test.describe('Lobby', () => {
	let player1: UserInfo;
	let player2: UserInfo;
	let player3: UserInfo;

	test.beforeAll(async () => {
		const adminJwt = process.env.ADMIN_JWT!;
		await resetState(adminJwt);

		const ts = Date.now();
		player1 = await createUser(`lobby-p1-${ts}@test.com`, 'test_password_123');
		player2 = await createUser(`lobby-p2-${ts}@test.com`, 'test_password_123');
		player3 = await createUser(`lobby-p3-${ts}@test.com`, 'test_password_123');
	});

	test('create lobby via UI, join players via API, start game', async ({ browser }) => {
		const ctx1 = await browser.newContext();
		const page1 = await ctx1.newPage();

		try {
			// Player 1 signs in and creates a lobby via UI
			await authenticateContext(page1, player1.email, 'test_password_123');
			await page1.locator('[data-testid="player-name-input"]').fill('Player1');
			await page1.locator('[data-testid="create-game-btn"]').click();

			// Player 1 should see the waiting room
			await expect(page1.locator('text=Waiting Room')).toBeVisible({ timeout: 10_000 });
			await expect(page1.locator('[data-testid="start-game-btn"]')).toBeVisible();

			// Get the lobby ID from the API
			const lobbyRes = await fetch('http://localhost:8080/api/v1/lobbies/summary', {
				headers: { Authorization: `Bearer ${player1.jwt}` }
			});
			const lobbyData = await lobbyRes.json();
			const lobbyId = lobbyData.owned[0].id;

			// Join players 2 and 3 via API, then start the game via API
			await joinLobbyApi(player2.jwt, lobbyId, 'Player2');
			await joinLobbyApi(player3.jwt, lobbyId, 'Player3');
			await startLobbyApi(player1.jwt, lobbyId);

			// Verify the game was created
			const games = await getGamesSummaryApi(player1.jwt);
			expect(games.length).toBeGreaterThan(0);

			// Navigate Player 1 to the game and verify the board loads
			await page1.goto(`/game/${games[0].id}`);
			await expect(page1).toHaveURL(/\/game\/\d+/, { timeout: 15_000 });
		} finally {
			await ctx1.close();
		}
	});
});
