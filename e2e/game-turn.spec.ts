import { test, expect } from '@playwright/test';
import { createUser, type UserInfo } from './helpers/auth';
import {
	resetState,
	createLobbyApi,
	joinLobbyApi,
	startLobbyApi,
	getGamesSummaryApi
} from './helpers/api';
import { TEST_PASSWORD } from './helpers/config';
import { waitForPhase, skipAttack, skipCards, endTurn, findActivePlayer } from './helpers/game';
import { withGameSession } from './helpers/game-session';

test.describe('Game Turn', () => {
	let player1: UserInfo;
	let player2: UserInfo;
	let player3: UserInfo;
	let gameId: number;

	test.beforeAll(async () => {
		const adminJwt = process.env.ADMIN_JWT!;
		await resetState(adminJwt);

		const ts = Date.now();
		player1 = await createUser(`game-p1-${ts}@test.com`, TEST_PASSWORD);
		player2 = await createUser(`game-p2-${ts}@test.com`, TEST_PASSWORD);
		player3 = await createUser(`game-p3-${ts}@test.com`, TEST_PASSWORD);

		// Create game via API: lobby → join → start
		const lobby = await createLobbyApi(player1.jwt, 'Player1');
		await joinLobbyApi(player2.jwt, lobby.lobbyId, 'Player2');
		await joinLobbyApi(player3.jwt, lobby.lobbyId, 'Player3');
		await startLobbyApi(player1.jwt, lobby.lobbyId);

		// Get game ID from games summary
		const games = await getGamesSummaryApi(player1.jwt);
		if (games.length === 0) throw new Error('No games found after starting lobby');
		gameId = games[0].id;
	});

	test('all players can load the game board', async ({ browser }) => {
		const credentials = [
			{ email: player1.email, password: TEST_PASSWORD },
			{ email: player2.email, password: TEST_PASSWORD },
			{ email: player3.email, password: TEST_PASSWORD }
		];

		await withGameSession(browser, credentials, gameId, async (pages) => {
			const [page1, page2, page3] = pages;

			// Phase bar should be visible for all
			await expect(page1.locator('[data-testid="phase-deploy"]')).toBeVisible();
			await expect(page2.locator('[data-testid="phase-deploy"]')).toBeVisible();
			await expect(page3.locator('[data-testid="phase-deploy"]')).toBeVisible();

			// Exactly one player should see "Your turn"
			const playerEntries = pages.map((page) => ({ page }));
			const { active, others } = await findActivePlayer(playerEntries);

			expect(active).toBeDefined();
			expect(others.length).toBe(2);

			// Waiting players should see "Waiting for"
			for (const p of others) {
				await expect(p.page.locator('[data-testid="turn-indicator"]')).toContainText('Waiting for');
			}
		});
	});

	test('active player can complete a full deploy → skip attack → end turn cycle', async ({
		browser
	}) => {
		const credentials = [
			{ email: player1.email, password: TEST_PASSWORD },
			{ email: player2.email, password: TEST_PASSWORD },
			{ email: player3.email, password: TEST_PASSWORD }
		];

		await withGameSession(browser, credentials, gameId, async (pages) => {
			// Find which player has the turn
			const playerEntries = pages.map((page) => ({ page }));
			const { active: activePlayer, others } = await findActivePlayer(playerEntries);
			const activePage = activePlayer.page;

			// Check if we're in cards phase (skip it if so)
			const cardsBtn = activePage.locator('[data-testid="skip-cards-btn"]');
			if (await cardsBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
				await skipCards(activePage);
			}

			// Should be in deploy phase
			await waitForPhase(activePage, 'deploy');

			// Find an owned region (has the "clickable" class during deploy phase)
			const ownedRegions = activePage.locator('g.region.clickable');
			await ownedRegions.first().waitFor({ timeout: 5_000 });
			const ownedCount = await ownedRegions.count();
			expect(ownedCount).toBeGreaterThan(0);

			// Click the first owned region
			await ownedRegions.first().click();

			// Deploy button should appear
			const deployBtn = activePage.locator('[data-testid="deploy-btn"]').first();
			await expect(deployBtn).toBeVisible({ timeout: 5_000 });

			// Deploy all troops at once using max slider value
			const slider = activePage.locator('[data-testid="deploy-slider"]').first();
			const max = await slider.getAttribute('max');
			if (max) await slider.fill(max);
			await deployBtn.click();

			// Wait for deploy to complete and phase to advance
			await expect(activePage.locator('[data-testid="skip-attack-btn"]').first()).toBeVisible({
				timeout: 10_000
			});

			// Skip attack phase
			await skipAttack(activePage);

			// Should now be in reinforce phase — end turn
			await waitForPhase(activePage, 'reinforce');
			await endTurn(activePage);

			// After ending turn, another player should now have their turn
			await expect(activePage.locator('[data-testid="turn-indicator"]')).toContainText(
				'Waiting for',
				{ timeout: 10_000 }
			);

			// One of the other players should see "Your turn"
			let newActiveFound = false;
			for (const p of others) {
				const text = await p.page
					.locator('[data-testid="turn-indicator"]')
					.textContent({ timeout: 5_000 });
				if (text?.includes('Your turn')) {
					newActiveFound = true;
					break;
				}
			}
			expect(newActiveFound).toBe(true);
		});
	});
});
