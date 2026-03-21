/**
 * Lazy-loaded map data module. Imports the static Risk map JSON on first call to load()
 * and builds precomputed lookup maps (region->layer, region->continent, continent->regions)
 * for efficient O(1) access by rendering and game logic components.
 */

import type { MapData, MapLayer, MapLink, Continent } from '$lib/types/map';

let mapData = $state<MapData | null>(null);
let loading = $state(false);
let loaded = $state(false);

/** Precomputed lookups built once after map data loads. */
let layerMap = $state(new Map<string, MapLayer>());
let regionToContinent = $state(new Map<string, string>());
let continentRegions = $state(new Map<string, string[]>());

/** Load the map JSON and build all lookup maps. No-ops if already loaded or in progress. */
async function load() {
	if (loaded || loading) return;
	loading = true;

	const data = (await import('$lib/../assets/risk.json')).default as unknown as MapData;
	mapData = data;

	// Build lookup maps
	const lMap = new Map<string, MapLayer>();
	const r2c = new Map<string, string>();
	const cRegions = new Map<string, string[]>();

	for (const continent of data.continents) {
		cRegions.set(continent.id, []);
	}

	for (const layer of data.layers) {
		lMap.set(layer.id, layer);
		r2c.set(layer.id, layer.continent);
		cRegions.get(layer.continent)?.push(layer.id);
	}

	layerMap = lMap;
	regionToContinent = r2c;
	continentRegions = cRegions;
	loading = false;
	loaded = true;
}

/**
 * Returns a reactive accessor for map data and lookup helpers.
 * Module-scoped state ensures all consumers share the same loaded data.
 * @returns Reactive map data getters and O(1) lookup methods.
 */
export function getMapData() {
	return {
		get data() {
			return mapData;
		},
		get loading() {
			return loading;
		},
		get loaded() {
			return loaded;
		},
		get layers() {
			return mapData?.layers ?? [];
		},
		get links(): MapLink[] {
			return mapData?.links ?? [];
		},
		get continents(): Continent[] {
			return mapData?.continents ?? [];
		},
		get viewBox() {
			return mapData?.viewBox ?? '150 100 800 550';
		},

		/**
		 * Look up a map layer (SVG path data, label position) by region ID.
		 * @param regionId - The region identifier.
		 */
		getLayer(regionId: string): MapLayer | undefined {
			return layerMap.get(regionId);
		},

		/**
		 * Get the continent ID that a region belongs to.
		 * @param regionId - The region identifier.
		 */
		getContinentForRegion(regionId: string): string | undefined {
			return regionToContinent.get(regionId);
		},

		/**
		 * Get all region IDs belonging to a continent.
		 * @param continentId - The continent identifier.
		 */
		getRegionsInContinent(continentId: string): string[] {
			return continentRegions.get(continentId) ?? [];
		},

		load
	};
}
