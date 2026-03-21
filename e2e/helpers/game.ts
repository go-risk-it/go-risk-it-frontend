import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Wait for the phase indicator to show the expected phase.
 */
export async function waitForPhase(page: Page, phase: string): Promise<void> {
	const phaseEl = page.locator(`[data-testid="phase-${phase}"]`);
	// The active phase has the 'active' class or 'scale-110' class
	await expect(phaseEl).toHaveClass(/scale-110/, { timeout: 15_000 });
}

/**
 * Wait for "Your turn" to appear in the turn indicator.
 */
export async function waitForMyTurn(page: Page): Promise<void> {
	await expect(page.locator('[data-testid="turn-indicator"]')).toContainText('Your turn', {
		timeout: 30_000
	});
}

/**
 * Wait for the game board to be loaded (map rendered + WebSocket connected).
 */
export async function waitForGameLoaded(page: Page): Promise<void> {
	// Wait for at least one region to appear on the map
	await page.locator('[data-testid^="region-"]').first().waitFor({ timeout: 15_000 });
}

/**
 * Click a region on the game map by its ID.
 */
export async function clickRegion(page: Page, regionId: string): Promise<void> {
	await page.locator(`[data-testid="region-${regionId}"]`).click();
}

/**
 * Deploy troops to a region. Assumes deploy phase and the player's turn.
 */
export async function deployTroops(page: Page, regionId: string, troops: number): Promise<void> {
	await clickRegion(page, regionId);

	// Set slider value
	const slider = page.locator('[data-testid="deploy-slider"]').first();
	await slider.waitFor({ timeout: 5_000 });
	await slider.fill(String(troops));

	await page.locator('[data-testid="deploy-btn"]').first().click();
}

/**
 * Perform an attack. Assumes attack phase and source/target are valid.
 */
export async function attackRegion(
	page: Page,
	sourceRegionId: string,
	targetRegionId: string,
	troops: number
): Promise<void> {
	// Select source
	await clickRegion(page, sourceRegionId);

	// Select target
	await clickRegion(page, targetRegionId);

	// Set attacking troops
	const slider = page.locator('[data-testid="attack-slider"]').first();
	await slider.waitFor({ timeout: 5_000 });
	await slider.fill(String(troops));

	await page.locator('[data-testid="attack-btn"]').first().click();
}

/**
 * Move troops after conquering a region.
 */
export async function conquerRegion(page: Page, troops: number): Promise<void> {
	const slider = page.locator('[data-testid="conquer-slider"]').first();
	await slider.waitFor({ timeout: 5_000 });
	await slider.fill(String(troops));

	await page.locator('[data-testid="conquer-btn"]').first().click();
}

/**
 * Skip the attack phase (advance to reinforce).
 */
export async function skipAttack(page: Page): Promise<void> {
	await page.locator('[data-testid="skip-attack-btn"]').first().click();
}

/**
 * End the current turn (from reinforce phase).
 */
export async function endTurn(page: Page): Promise<void> {
	await page.locator('[data-testid="end-turn-btn"]').first().click();
}

/**
 * Skip the cards phase (advance to deploy).
 */
export async function skipCards(page: Page): Promise<void> {
	await page.locator('[data-testid="skip-cards-btn"]').first().click();
}

/**
 * Wait for the game over overlay to appear.
 */
export async function waitForGameOver(page: Page): Promise<void> {
	await page.locator('[data-testid="game-over-result"]').waitFor({ timeout: 30_000 });
}

/**
 * Find which player has the active turn by checking the turn indicator.
 * Returns the active player and the remaining others.
 */
export async function findActivePlayer<T extends { page: Page }>(
	players: T[]
): Promise<{ active: T; others: T[] }> {
	for (const p of players) {
		const text = await p.page
			.locator('[data-testid="turn-indicator"]')
			.textContent({ timeout: 10_000 });
		if (text?.includes('Your turn')) {
			return { active: p, others: players.filter((o) => o !== p) };
		}
	}
	throw new Error('No active player found');
}
