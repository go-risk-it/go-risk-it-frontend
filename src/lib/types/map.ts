export interface MapData {
	id: string;
	name: string;
	viewBox: string;
	continents: Continent[];
	layers: MapLayer[];
	links: MapLink[];
}

export interface Continent {
	id: string;
	name: string;
	bonus_troops: number;
}

export interface MapLayer {
	id: string;
	name: string;
	continent: string;
	d: string;
}

export interface MapLink {
	source: string;
	target: string;
}
