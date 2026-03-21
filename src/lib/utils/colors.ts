/**
 * Player color assignments for the game UI.
 * Provides both CSS custom property references (for themed styling) and raw hex values
 * (for canvas/SVG rendering where CSS variables are unavailable).
 */

/** CSS variable references for player colors, indexed by player position. */
const PLAYER_COLORS = [
	'var(--color-player-0)', // red
	'var(--color-player-1)', // blue
	'var(--color-player-2)', // green
	'var(--color-player-3)', // yellow
	'var(--color-player-4)', // purple
	'var(--color-player-5)' // orange
];

/** Raw hex color values for player colors, indexed by player position. */
const PLAYER_HEX_COLORS = [
	'#ef4444', // red
	'#3b82f6', // blue
	'#22c55e', // green
	'#eab308', // yellow
	'#a855f7', // purple
	'#f97316' // orange
];

/**
 * @param index - Player index (wraps around if more players than colors)
 * @returns CSS variable reference for the player's color
 */
export function getPlayerColor(index: number): string {
	return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

/**
 * @param index - Player index (wraps around if more players than colors)
 * @returns Hex color string for the player's color
 */
export function getPlayerHexColor(index: number): string {
	return PLAYER_HEX_COLORS[index % PLAYER_HEX_COLORS.length];
}

/**
 * Build a lookup from user ID to hex color for all players in a game.
 * @param players - Array of player objects with userId and positional index
 * @returns Map from userId to hex color string
 */
export function buildPlayerColorMap(
	players: { userId: string; index: number }[]
): Map<string, string> {
	const map = new Map<string, string>();
	for (const player of players) {
		map.set(player.userId, getPlayerHexColor(player.index));
	}
	return map;
}
