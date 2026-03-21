/**
 * Static map definition types loaded once at game start.
 * Describes the board geography: continents, regions (as SVG layers),
 * and adjacency links between regions.
 */

/** Top-level map definition containing all geography data. */
export interface MapData {
	id: string;
	/** Human-readable map name (e.g. "Classic World"). */
	name: string;
	/** SVG viewBox attribute for the map's coordinate system. */
	viewBox: string;
	continents: Continent[];
	/** One layer per region — each layer is an SVG path rendered on the board. */
	layers: MapLayer[];
	/** Adjacency edges defining which regions can attack/reinforce each other. */
	links: MapLink[];
}

/** A continent that groups several regions and awards bonus troops. */
export interface Continent {
	id: string;
	name: string;
	/** Extra troops awarded per turn for controlling all regions in this continent. */
	bonus_troops: number;
}

/** A single region rendered as an SVG path on the game board. */
export interface MapLayer {
	/** Region identifier, matches {@link Region.id} in game state. */
	id: string;
	/** Display name shown on hover/selection (e.g. "Eastern Australia"). */
	name: string;
	/** ID of the continent this region belongs to. */
	continent: string;
	/** SVG path data (`d` attribute) defining the region's shape. */
	d: string;
}

/** An adjacency edge between two regions (bidirectional). */
export interface MapLink {
	/** Region ID of one endpoint. */
	source: string;
	/** Region ID of the other endpoint. */
	target: string;
}
