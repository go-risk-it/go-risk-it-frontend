import { test, expect } from '@playwright/test';
import { createUser, type UserInfo } from './helpers/auth';
import {
	resetState,
	createLobbyApi,
	joinLobbyApi,
	startLobbyApi,
	getGamesSummaryApi,
	setupNearWinApi
} from './helpers/api';
import { TEST_PASSWORD } from './helpers/config';
import {
	waitForGameLoaded,
	waitForPhase,
	clickRegion,
	skipCards,
	waitForGameOver,
	findActivePlayer
} from './helpers/game';
import { withGameSession } from './helpers/game-session';

test.describe('Game Complete', () => {
	let player1: UserInfo;
	let player2: UserInfo;
	let player3: UserInfo;
	let gameId: number;

	test.beforeAll(async () => {
		const adminJwt = process.env.ADMIN_JWT!;
		await resetState(adminJwt);

		const ts = Date.now();
		player1 = await createUser(`win-p1-${ts}@test.com`, TEST_PASSWORD);
		player2 = await createUser(`win-p2-${ts}@test.com`, TEST_PASSWORD);
		player3 = await createUser(`win-p3-${ts}@test.com`, TEST_PASSWORD);

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

		const credentials = [
			{ email: player1.email, password: TEST_PASSWORD },
			{ email: player2.email, password: TEST_PASSWORD },
			{ email: player3.email, password: TEST_PASSWORD }
		];

		await withGameSession(browser, credentials, gameId, async (pages) => {
			// Reload all pages to pick up manipulated state
			for (const page of pages) {
				await page.reload();
			}
			for (const page of pages) {
				await waitForGameLoaded(page);
			}

			// Find which player has the turn
			const players = pages.map((page, i) => ({
				page,
				info: [player1, player2, player3][i]
			}));

			const { active: activePlayer, others: otherPlayers } = await findActivePlayer(players);
			const activePage = activePlayer.page;

			// Skip cards if visible
			const cardsBtn = activePage.locator('[data-testid="skip-cards-btn"]');
			if (await cardsBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
				await skipCards(activePage);
			}

			// === DEPLOY PHASE ===
			await waitForPhase(activePage, 'deploy');

			// Deploy all troops to western_australia
			await clickRegion(activePage, 'western_australia');

			const deploySlider = activePage.locator('[data-testid="deploy-slider"]').first();
			await deploySlider.waitFor({ timeout: 5_000 });
			const maxDeploy = await deploySlider.getAttribute('max');
			if (maxDeploy) await deploySlider.fill(maxDeploy);
			await activePage.locator('[data-testid="deploy-btn"]').first().click();

			// === ATTACK PHASE ===
			await waitForPhase(activePage, 'attack');

			const MAX_ATTACK_ATTEMPTS = 20;
			let conquered = false;

			for (let attempt = 0; attempt < MAX_ATTACK_ATTEMPTS; attempt++) {
				await clickRegion(activePage, 'western_australia');

				const validTargets = activePage.locator('g.region.valid-target');
				const hasTargets = await validTargets
					.first()
					.waitFor({ timeout: 3_000 })
					.then(() => true)
					.catch(() => false);
				if (!hasTargets) break;

				await clickRegion(activePage, 'eastern_australia');

				const attackBtn = activePage.locator('[data-testid="attack-btn"]').first();
				await attackBtn.waitFor({ timeout: 3_000 });
				await attackBtn.click();

				const conquerSlider = activePage.locator('[data-testid="conquer-slider"]').first();
				const gameOverResult = activePage.locator('[data-testid="game-over-result"]');

				const result = await Promise.race([
					conquerSlider.waitFor({ timeout: 10_000 }).then(() => 'conquer' as const),
					gameOverResult.waitFor({ timeout: 10_000 }).then(() => 'gameover' as const)
				]).catch(() => 'continue' as const);

				if (result === 'gameover') {
					conquered = true;
					break;
				}

				if (result === 'conquer') {
					const maxConquer = await conquerSlider.getAttribute('max');
					if (maxConquer) await conquerSlider.fill(maxConquer);
					await activePage.locator('[data-testid="conquer-btn"]').first().click();
					conquered = true;
					break;
				}

				await activePage.waitForTimeout(500);
			}

			expect(conquered).toBe(true);

			// Wait for game over overlay on all pages
			await waitForGameOver(activePage);

			// Winner should see "Victory!"
			await expect(activePage.locator('[data-testid="game-over-result"]')).toContainText(
				'Victory!'
			);

			// Other players should see "Defeated"
			for (const p of otherPlayers) {
				await waitForGameOver(p.page);
				await expect(p.page.locator('[data-testid="game-over-result"]')).toContainText('Defeated');
			}

			// All players should see "Back to Lobby"
			for (const p of players) {
				await expect(p.page.locator('[data-testid="back-to-lobby"]')).toBeVisible();
			}
		});
	});
});
