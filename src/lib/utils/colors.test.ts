import { describe, it, expect } from 'vitest';
import { getPlayerColor, getPlayerHexColor, buildPlayerColorMap } from './colors';

describe('getPlayerColor', () => {
	it('returns correct CSS var for each index', () => {
		expect(getPlayerColor(0)).toBe('var(--color-player-0)');
		expect(getPlayerColor(1)).toBe('var(--color-player-1)');
		expect(getPlayerColor(5)).toBe('var(--color-player-5)');
	});

	it('wraps at 6', () => {
		expect(getPlayerColor(6)).toBe('var(--color-player-0)');
		expect(getPlayerColor(7)).toBe('var(--color-player-1)');
	});
});

describe('getPlayerHexColor', () => {
	it('returns hex strings for each index', () => {
		expect(getPlayerHexColor(0)).toBe('#ef4444');
		expect(getPlayerHexColor(1)).toBe('#3b82f6');
		expect(getPlayerHexColor(2)).toBe('#22c55e');
		expect(getPlayerHexColor(3)).toBe('#eab308');
		expect(getPlayerHexColor(4)).toBe('#a855f7');
		expect(getPlayerHexColor(5)).toBe('#f97316');
	});

	it('wraps at 6', () => {
		expect(getPlayerHexColor(6)).toBe('#ef4444');
	});
});

describe('buildPlayerColorMap', () => {
	it('creates userId to hex color map', () => {
		const players = [
			{ userId: 'alice', index: 0 },
			{ userId: 'bob', index: 1 }
		];
		const map = buildPlayerColorMap(players);
		expect(map.get('alice')).toBe('#ef4444');
		expect(map.get('bob')).toBe('#3b82f6');
		expect(map.size).toBe(2);
	});
});
