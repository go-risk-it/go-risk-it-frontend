/**
 * Graph representation of the game board's region adjacency.
 * Supports neighbor queries, BFS-based reachability checks through friendly territory,
 * and dynamic updates when board state changes (e.g., after conquests).
 */

import type { BoardState, Region } from '$lib/types/game';
import type { MapLink } from '$lib/types/map';

export class Graph {
	private adjacency: Map<string, Set<string>>;
	private regionMap: Map<string, Region>;

	/**
	 * Build an undirected adjacency graph from map links and populate the region lookup.
	 * @param links - Edges between regions as defined by the map topology
	 * @param boardState - Current board state containing region ownership and troop counts
	 */
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

	/**
	 * @param regionId1 - First region ID
	 * @param regionId2 - Second region ID
	 * @returns Whether the two regions share a direct border
	 */
	areNeighbors(regionId1: string, regionId2: string): boolean {
		return this.adjacency.get(regionId1)?.has(regionId2) ?? false;
	}

	/**
	 * @param regionId - Region to query
	 * @returns IDs of all regions directly adjacent to the given region
	 */
	getNeighbors(regionId: string): string[] {
		return Array.from(this.adjacency.get(regionId) ?? []);
	}

	/**
	 * Check whether two regions are connected through a chain of friendly (same-owner) regions.
	 * Used to validate troop transfers, which require an unbroken path of owned territory.
	 * @param regionId1 - Source region ID
	 * @param regionId2 - Destination region ID
	 * @returns Whether a path of same-owner regions connects the two
	 */
	canReach(regionId1: string, regionId2: string): boolean {
		const region1 = this.regionMap.get(regionId1);
		const region2 = this.regionMap.get(regionId2);
		if (!region1 || !region2) return false;
		if (region1.ownerId !== region2.ownerId) return false;

		// BFS through only regions owned by the same player
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

	/**
	 * Replace the region lookup with fresh data. Called when board state changes
	 * so that ownership checks in {@link canReach} reflect the latest game state.
	 * @param boardState - The updated board state
	 */
	updateRegions(boardState: BoardState) {
		this.regionMap.clear();
		for (const region of boardState.regions) {
			this.regionMap.set(region.id, region);
		}
	}
}
