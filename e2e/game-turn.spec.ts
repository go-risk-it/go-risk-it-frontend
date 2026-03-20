import { test, expect } from '@playwright/test';
import { createUser, authenticateContext, type UserInfo } from './helpers/auth';
import {
	resetState,
	createLobbyApi,
	joinLobbyApi,
	startLobbyApi,
	getGamesSummaryApi
} from './helpers/api';
import {
	waitForGameLoaded,
	waitForPhase,
	skipAttack,
	skipCards,
	endTurn
} from './helpers/game';

test.describe('Game Turn', () => {
	let player1: UserInfo;
	let player2: UserInfo;
	let player3: UserInfo;
	let gameId: number;

	test.beforeAll(async () => {
		const adminJwt = process.env.ADMIN_JWT!;
		await resetState(adminJwt);

		const ts = Date.now();
		player1 = await createUser(`game-p1-${ts}@test.com`, 'test_password_123');
		player2 = await createUser(`game-p2-${ts}@test.com`, 'test_password_123');
		player3 = await createUser(`game-p3-${ts}@test.com`, 'test_password_123');

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
		const ctx1 = await browser.newContext();
		const ctx2 = await browser.newContext();
		const ctx3 = await browser.newContext();

		const page1 = await ctx1.newPage();
		const page2 = await ctx2.newPage();
		const page3 = await ctx3.newPage();

		try {
			// All players sign in and navigate to the game
			await authenticateContext(page1, player1.email, 'test_password_123');
			await authenticateContext(page2, player2.email, 'test_password_123');
			await authenticateContext(page3, player3.email, 'test_password_123');

			await page1.goto(`/game/${gameId}`);
			await page2.goto(`/game/${gameId}`);
			await page3.goto(`/game/${gameId}`);

			// All should see the game board loaded
			await waitForGameLoaded(page1);
			await waitForGameLoaded(page2);
			await waitForGameLoaded(page3);

			// Phase bar should be visible for all
			await expect(page1.locator('[data-testid="phase-deploy"]')).toBeVisible();
			await expect(page2.locator('[data-testid="phase-deploy"]')).toBeVisible();
			await expect(page3.locator('[data-testid="phase-deploy"]')).toBeVisible();

			// Exactly one player should see "Your turn"
			const pages = [page1, page2, page3];
			let activePlayerPage: typeof page1 | null = null;
			let waitingPages: typeof pages = [];

			for (const p of pages) {
				const indicator = p.locator('[data-testid="turn-indicator"]');
				const text = await indicator.textContent({ timeout: 5_000 });
				if (text?.includes('Your turn')) {
					activePlayerPage = p;
				} else {
					waitingPages.push(p);
				}
			}

			expect(activePlayerPage).not.toBeNull();
			expect(waitingPages.length).toBe(2);

			// Waiting players should see "Waiting for"
			for (const p of waitingPages) {
				await expect(p.locator('[data-testid="turn-indicator"]')).toContainText('Waiting for');
			}
		} finally {
			await ctx1.close();
			await ctx2.close();
			await ctx3.close();
		}
	});

	test('active player can complete a full deploy → skip attack → end turn cycle', async ({
		browser
	}) => {
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

			// Find which player has the turn
			const players = [
				{ page: page1, info: player1 },
				{ page: page2, info: player2 },
				{ page: page3, info: player3 }
			];

			let activePlayer: (typeof players)[0] | null = null;

			for (const p of players) {
				const text = await p.page
					.locator('[data-testid="turn-indicator"]')
					.textContent({ timeout: 5_000 });
				if (text?.includes('Your turn')) {
					activePlayer = p;
					break;
				}
			}

			expect(activePlayer).not.toBeNull();
			const activePage = activePlayer!.page;

			// Check if we're in cards phase (skip it if so)
			const cardsBtn = activePage.locator('[data-testid="skip-cards-btn"]');
			if (await cardsBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
				await skipCards(activePage);
			}

			// Should be in deploy phase
			await waitForPhase(activePage, 'deploy');

			// Find an owned region (has the "clickable" class during deploy phase)
			// Click the path element inside it to ensure we hit the right area
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
			// After deploying all troops, the phase should auto-advance to attack
			await expect(activePage.locator('[data-testid="skip-attack-btn"]').first()).toBeVisible({
				timeout: 10_000
			});

			// Skip attack phase
			await skipAttack(activePage);

			// Should now be in reinforce phase — end turn
			await waitForPhase(activePage, 'reinforce');
			await endTurn(activePage);

			// After ending turn, another player should now have their turn
			// The active player should see "Waiting for"
			await expect(activePage.locator('[data-testid="turn-indicator"]')).toContainText(
				'Waiting for',
				{ timeout: 10_000 }
			);

			// One of the other players should see "Your turn"
			const otherPages = players.filter((p) => p !== activePlayer).map((p) => p.page);
			let newActiveFound = false;
			for (const p of otherPages) {
				const text = await p
					.locator('[data-testid="turn-indicator"]')
					.textContent({ timeout: 5_000 });
				if (text?.includes('Your turn')) {
					newActiveFound = true;
					break;
				}
			}
			expect(newActiveFound).toBe(true);
		} finally {
			await ctx1.close();
			await ctx2.close();
			await ctx3.close();
		}
	});
});
