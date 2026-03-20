const PLAYER_COLORS = [
	'var(--color-player-0)', // red
	'var(--color-player-1)', // blue
	'var(--color-player-2)', // green
	'var(--color-player-3)', // yellow
	'var(--color-player-4)', // purple
	'var(--color-player-5)' // orange
];

const PLAYER_HEX_COLORS = [
	'#ef4444', // red
	'#3b82f6', // blue
	'#22c55e', // green
	'#eab308', // yellow
	'#a855f7', // purple
	'#f97316' // orange
];

export function getPlayerColor(index: number): string {
	return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

export function getPlayerHexColor(index: number): string {
	return PLAYER_HEX_COLORS[index % PLAYER_HEX_COLORS.length];
}

export function buildPlayerColorMap(
	players: { userId: string; index: number }[]
): Map<string, string> {
	const map = new Map<string, string>();
	for (const player of players) {
		map.set(player.userId, getPlayerHexColor(player.index));
	}
	return map;
}
