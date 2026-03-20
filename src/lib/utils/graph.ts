import type { BoardState, Region } from '$lib/types/game';
import type { MapLink } from '$lib/types/map';

export class Graph {
	private adjacency: Map<string, Set<string>>;
	private regionMap: Map<string, Region>;

	constructor(links: MapLink[], boardState: BoardState) {
		this.adjacency = new Map();
		this.regionMap = new Map();

		for (const region of boardState.regions) {
			this.regionMap.set(region.id, region);
		}

		for (const link of links) {
			if (!this.adjacency.has(link.source)) {
				this.adjacency.set(link.source, new Set());
			}
			if (!this.adjacency.has(link.target)) {
				this.adjacency.set(link.target, new Set());
			}
			this.adjacency.get(link.source)!.add(link.target);
			this.adjacency.get(link.target)!.add(link.source);
		}
	}

	areNeighbors(regionId1: string, regionId2: string): boolean {
		return this.adjacency.get(regionId1)?.has(regionId2) ?? false;
	}

	getNeighbors(regionId: string): string[] {
		return Array.from(this.adjacency.get(regionId) ?? []);
	}

	/** BFS: can region1 reach region2 through connected friendly regions? */
	canReach(regionId1: string, regionId2: string): boolean {
		const region1 = this.regionMap.get(regionId1);
		const region2 = this.regionMap.get(regionId2);
		if (!region1 || !region2) return false;
		if (region1.ownerId !== region2.ownerId) return false;

		const visited = new Set<string>();
		const queue = [region1];

		while (queue.length > 0) {
			const current = queue.pop()!;
			if (current.id === region2.id) return true;
			visited.add(current.id);

			for (const neighborId of this.adjacency.get(current.id) ?? []) {
				if (!visited.has(neighborId)) {
					const neighbor = this.regionMap.get(neighborId)!;
					if (neighbor.ownerId === region1.ownerId) {
						queue.push(neighbor);
					}
				}
			}
		}

		return false;
	}

	/** Update region map when board state changes */
	updateRegions(boardState: BoardState) {
		this.regionMap.clear();
		for (const region of boardState.regions) {
			this.regionMap.set(region.id, region);
		}
	}
}
