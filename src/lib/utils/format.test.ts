import { describe, it, expect } from 'vitest';
import { formatRegionName } from './format';

describe('formatRegionName', () => {
	it('replaces underscores with spaces', () => {
		expect(formatRegionName('north_america')).toBe('north america');
	});

	it('handles multiple underscores', () => {
		expect(formatRegionName('new_south_wales')).toBe('new south wales');
	});

	it('returns unchanged if no underscores', () => {
		expect(formatRegionName('alaska')).toBe('alaska');
	});

	it('handles empty string', () => {
		expect(formatRegionName('')).toBe('');
	});
});
