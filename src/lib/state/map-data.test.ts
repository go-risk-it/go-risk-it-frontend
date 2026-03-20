import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the JSON import
const mockMapData = {
	id: 'test-map',
	name: 'Test Map',
	viewBox: '0 0 100 100',
	continents: [
		{ id: 'c1', name: 'Continent 1', bonus_troops: 3 },
		{ id: 'c2', name: 'Continent 2', bonus_troops: 5 }
	],
	layers: [
		{ id: 'r1', name: 'Region 1', continent: 'c1', d: 'M0 0' },
		{ id: 'r2', name: 'Region 2', continent: 'c1', d: 'M1 1' },
		{ id: 'r3', name: 'Region 3', continent: 'c2', d: 'M2 2' }
	],
	links: [
		{ source: 'r1', target: 'r2' },
		{ source: 'r2', target: 'r3' }
	]
};

vi.mock('$lib/../assets/risk.json', () => ({
	default: mockMapData
}));

describe('map-data', () => {
	let getMapData: typeof import('./map-data.svelte').getMapData;

	beforeEach(async () => {
		vi.resetModules();
		const mod = await import('./map-data.svelte');
		getMapData = mod.getMapData;
	});

	describe('initial state', () => {
		it('starts unloaded', () => {
			const mapData = getMapData();
			expect(mapData.loaded).toBe(false);
			expect(mapData.loading).toBe(false);
			expect(mapData.data).toBeNull();
		});

		it('returns empty arrays when not loaded', () => {
			const mapData = getMapData();
			expect(mapData.layers).toEqual([]);
			expect(mapData.links).toEqual([]);
			expect(mapData.continents).toEqual([]);
		});

		it('returns default viewBox when not loaded', () => {
			const mapData = getMapData();
			expect(mapData.viewBox).toBe('150 100 800 550');
		});
	});

	describe('load', () => {
		it('loads map data from JSON', async () => {
			const mapData = getMapData();
			await mapData.load();
			expect(mapData.loaded).toBe(true);
			expect(mapData.loading).toBe(false);
			expect(mapData.data).toEqual(mockMapData);
		});

		it('populates layers, links, and continents', async () => {
			const mapData = getMapData();
			await mapData.load();
			expect(mapData.layers).toHaveLength(3);
			expect(mapData.links).toHaveLength(2);
			expect(mapData.continents).toHaveLength(2);
		});

		it('returns correct viewBox', async () => {
			const mapData = getMapData();
			await mapData.load();
			expect(mapData.viewBox).toBe('0 0 100 100');
		});

		it('does not reload if already loaded', async () => {
			const mapData = getMapData();
			await mapData.load();
			await mapData.load(); // second call should be a no-op
			expect(mapData.loaded).toBe(true);
		});
	});

	describe('lookup methods', () => {
		it('getLayer returns layer by region id', async () => {
			const mapData = getMapData();
			await mapData.load();
			const layer = mapData.getLayer('r1');
			expect(layer).toEqual({ id: 'r1', name: 'Region 1', continent: 'c1', d: 'M0 0' });
		});

		it('getLayer returns undefined for unknown region', async () => {
			const mapData = getMapData();
			await mapData.load();
			expect(mapData.getLayer('unknown')).toBeUndefined();
		});

		it('getContinentForRegion returns continent id', async () => {
			const mapData = getMapData();
			await mapData.load();
			expect(mapData.getContinentForRegion('r1')).toBe('c1');
			expect(mapData.getContinentForRegion('r3')).toBe('c2');
		});

		it('getContinentForRegion returns undefined for unknown region', async () => {
			const mapData = getMapData();
			await mapData.load();
			expect(mapData.getContinentForRegion('unknown')).toBeUndefined();
		});

		it('getRegionsInContinent returns region ids', async () => {
			const mapData = getMapData();
			await mapData.load();
			expect(mapData.getRegionsInContinent('c1')).toEqual(['r1', 'r2']);
			expect(mapData.getRegionsInContinent('c2')).toEqual(['r3']);
		});

		it('getRegionsInContinent returns empty for unknown continent', async () => {
			const mapData = getMapData();
			await mapData.load();
			expect(mapData.getRegionsInContinent('unknown')).toEqual([]);
		});
	});
});
