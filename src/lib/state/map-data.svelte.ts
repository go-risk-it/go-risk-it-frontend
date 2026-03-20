import type { MapData, MapLayer, MapLink, Continent } from '$lib/types/map';

let mapData = $state<MapData | null>(null);
let loading = $state(false);
let loaded = $state(false);

// Precomputed lookups
let layerMap = $state(new Map<string, MapLayer>());
let regionToContinent = $state(new Map<string, string>());
let continentRegions = $state(new Map<string, string[]>());

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

		getLayer(regionId: string): MapLayer | undefined {
			return layerMap.get(regionId);
		},

		getContinentForRegion(regionId: string): string | undefined {
			return regionToContinent.get(regionId);
		},

		getRegionsInContinent(continentId: string): string[] {
			return continentRegions.get(continentId) ?? [];
		},

		load
	};
}
