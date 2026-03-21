import { test, expect } from '@playwright/test';
import { createUser, authenticateContext, type UserInfo } from './helpers/auth';
import {
	resetState,
	createLobbyApi,
	joinLobbyApi,
	startLobbyApi,
	getGamesSummaryApi,
	setupNearWinApi
} from './helpers/api';
import {
	waitForGameLoaded,
	waitForMyTurn,
	waitForPhase,
	clickRegion,
	skipCards,
	waitForGameOver
} from './helpers/game';

test.describe('Game Complete', () => {
	let player1: UserInfo;
	let player2: UserInfo;
	let player3: UserInfo;
	let gameId: number;

	test.beforeAll(async () => {
		const adminJwt = process.env.ADMIN_JWT!;
		await resetState(adminJwt);

		const ts = Date.now();
		player1 = await createUser(`win-p1-${ts}@test.com`, 'test_password_123');
		player2 = await createUser(`win-p2-${ts}@test.com`, 'test_password_123');
		player3 = await createUser(`win-p3-${ts}@test.com`, 'test_password_123');

		// Create game via API: lobby → join → start
		const lobby = await createLobbyApi(player1.jwt, 'Player1');
		await joinLobbyApi(player2.jwt, lobby.lobbyId, 'Player2');
		await joinLobbyApi(player3.jwt, lobby.lobbyId, 'Player3');
		await startLobbyApi(player1.jwt, lobby.lobbyId);

		// Get game ID
		const games = await getGamesSummaryApi(player1.jwt);
		if (games.length === 0) throw new Error('No games found after starting lobby');
		gameId = games[0].id;

		// Set up near-win state
		await setupNearWinApi(adminJwt, gameId);
	});

	test('a player can win the game and see victory overlay', async ({ browser }) => {
		test.setTimeout(120_000);

		const ctx1 = await browser.newContext();
		const ctx2 = await browser.newContext();
		const ctx3 = await browser.newContext();

		const page1 = await ctx1.newPage();
		const page2 = await ctx2.newPage();
		const page3 = await ctx3.newPage();

		try {
			// Sign in all players
			await authenticateContext(page1, player1.email, 'test_password_123');
			await authenticateContext(page2, player2.email, 'test_password_123');
			await authenticateContext(page3, player3.email, 'test_password_123');

			// Navigate to game
			await page1.goto(`/game/${gameId}`);
			await page2.goto(`/game/${gameId}`);
			await page3.goto(`/game/${gameId}`);

			await waitForGameLoaded(page1);
			await waitForGameLoaded(page2);
			await waitForGameLoaded(page3);

			// Reload all pages to pick up manipulated state
			await page1.reload();
			await page2.reload();
			await page3.reload();

			await waitForGameLoaded(page1);
			await waitForGameLoaded(page2);
			await waitForGameLoaded(page3);

			// Find which player has the turn (should be player1 = turn_index 0)
			const players = [
				{ page: page1, info: player1 },
				{ page: page2, info: player2 },
				{ page: page3, info: player3 }
			];

			let activePlayer: (typeof players)[0] | null = null;
			const otherPlayers: (typeof players)[0][] = [];

			for (const p of players) {
				const text = await p.page
					.locator('[data-testid="turn-indicator"]')
					.textContent({ timeout: 10_000 });
				if (text?.includes('Your turn')) {
					activePlayer = p;
				} else {
					otherPlayers.push(p);
				}
			}

			expect(activePlayer).not.toBeNull();
			const activePage = activePlayer!.page;

			// Skip cards if visible
			const cardsBtn = activePage.locator('[data-testid="skip-cards-btn"]');
			if (await cardsBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
				await skipCards(activePage);
			}

			// === DEPLOY PHASE ===
			await waitForPhase(activePage, 'deploy');

			// Deploy all 3 troops to western_australia
			await clickRegion(activePage, 'western_australia');

			const deploySlider = activePage.locator('[data-testid="deploy-slider"]').first();
			await deploySlider.waitFor({ timeout: 5_000 });
			const maxDeploy = await deploySlider.getAttribute('max');
			if (maxDeploy) await deploySlider.fill(maxDeploy);
			await activePage.locator('[data-testid="deploy-btn"]').first().click();

			// === ATTACK PHASE ===
			await waitForPhase(activePage, 'attack');

			// Attack eastern_australia from western_australia repeatedly until conquer.
			// The board-improvements branch uses instant click-to-attack:
			// click source, then click enemy target to attack immediately (no slider/button).
			const MAX_ATTACK_ATTEMPTS = 20;
			let conquered = false;

			for (let attempt = 0; attempt < MAX_ATTACK_ATTEMPTS; attempt++) {
				// Select source: western_australia
				await clickRegion(activePage, 'western_australia');

				// Wait for valid targets to appear
				const validTargets = activePage.locator('g.region.valid-target');
				const hasTargets = await validTargets
					.first()
					.waitFor({ timeout: 3_000 })
					.then(() => true)
					.catch(() => false);
				if (!hasTargets) break;

				// Click target: triggers instant attack (no Shift = max troops)
				await clickRegion(activePage, 'eastern_australia');

				// Wait for result — either conquer panel or game over or still in attack
				const conquerSlider = activePage.locator('[data-testid="conquer-slider"]').first();
				const gameOverResult = activePage.locator('[data-testid="game-over-result"]');

				const result = await Promise.race([
					conquerSlider
						.waitFor({ timeout: 10_000 })
						.then(() => 'conquer' as const),
					gameOverResult
						.waitFor({ timeout: 10_000 })
						.then(() => 'gameover' as const)
				]).catch(() => 'continue' as const);

				if (result === 'gameover') {
					conquered = true;
					break;
				}

				if (result === 'conquer') {
					// Move all troops into eastern_australia
					const maxConquer = await conquerSlider.getAttribute('max');
					if (maxConquer) await conquerSlider.fill(maxConquer);
					await activePage.locator('[data-testid="conquer-btn"]').first().click();
					conquered = true;

					// After conquering the last region, game over should trigger
					break;
				}

				// Still in attack phase — wait briefly before retrying
				await activePage.waitForTimeout(500);
			}

			expect(conquered).toBe(true);

			// Wait for game over overlay on all pages
			await waitForGameOver(activePage);

			// Winner should see "Victory!"
			await expect(
				activePage.locator('[data-testid="game-over-result"]')
			).toContainText('Victory!');

			// Other players should see "Defeated"
			for (const p of otherPlayers) {
				await waitForGameOver(p.page);
				await expect(
					p.page.locator('[data-testid="game-over-result"]')
				).toContainText('Defeated');
			}

			// All players should see "Back to Lobby"
			for (const p of players) {
				await expect(
					p.page.locator('[data-testid="back-to-lobby"]')
				).toBeVisible();
			}
		} finally {
			await ctx1.close();
			await ctx2.close();
			await ctx3.close();
		}
	});
});
