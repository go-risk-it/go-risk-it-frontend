import type { Browser, Page } from '@playwright/test';
import { authenticateContext } from './auth';
import { waitForGameLoaded } from './game';

interface PlayerCredentials {
	email: string;
	password: string;
}

/**
 * Set up a multiplayer game session: create browser contexts, sign in each player,
 * navigate to the game, wait for loaded, then run the test function.
 * Contexts are closed in the finally block.
 */
export async function withGameSession(
	browser: Browser,
	players: PlayerCredentials[],
	gameId: number,
	fn: (pages: Page[]) => Promise<void>
): Promise<void> {
	const contexts = await Promise.all(players.map(() => browser.newContext()));
	const pages = await Promise.all(contexts.map((ctx) => ctx.newPage()));

	try {
		// Sign in all players
		for (let i = 0; i < players.length; i++) {
			await authenticateContext(pages[i], players[i].email, players[i].password);
		}

		// Navigate to game and wait for loaded
		for (const page of pages) {
			await page.goto(`/game/${gameId}`);
		}
		for (const page of pages) {
			await waitForGameLoaded(page);
		}

		await fn(pages);
	} finally {
		await Promise.all(contexts.map((ctx) => ctx.close()));
	}
}
