import { describe, it, expect } from 'vitest';
import { Graph } from './graph';
import type { MapLink } from '$lib/types/map';
import type { BoardState } from '$lib/types/game';

// 5-region linear graph: A↔B↔C↔D↔E
const links: MapLink[] = [
	{ source: 'A', target: 'B' },
	{ source: 'B', target: 'C' },
	{ source: 'C', target: 'D' },
	{ source: 'D', target: 'E' }
];

function makeBoardState(owners: Record<string, string>): BoardState {
	return {
		regions: Object.entries(owners).map(([id, ownerId]) => ({ id, ownerId, troops: 1 }))
	};
}

describe('Graph', () => {
	const board = makeBoardState({ A: 'p1', B: 'p1', C: 'p2', D: 'p1', E: 'p1' });

	describe('areNeighbors', () => {
		const graph = new Graph(links, board);

		it('returns true for directly linked regions', () => {
			expect(graph.areNeighbors('A', 'B')).toBe(true);
		});

		it('is bidirectional', () => {
			expect(graph.areNeighbors('B', 'A')).toBe(true);
		});

		it('returns false for non-linked regions', () => {
			expect(graph.areNeighbors('A', 'C')).toBe(false);
		});

		it('returns false for unknown region', () => {
			expect(graph.areNeighbors('A', 'Z')).toBe(false);
		});
	});

	describe('getNeighbors', () => {
		const graph = new Graph(links, board);

		it('returns correct neighbors for middle node', () => {
			expect(graph.getNeighbors('C').sort()).toEqual(['B', 'D']);
		});

		it('returns single neighbor for end node', () => {
			expect(graph.getNeighbors('A')).toEqual(['B']);
		});

		it('returns empty for unknown region', () => {
			expect(graph.getNeighbors('Z')).toEqual([]);
		});
	});

	describe('canReach', () => {
		const graph = new Graph(links, board);

		it('returns true through friendly chain', () => {
			// D and E are both p1 and adjacent
			expect(graph.canReach('D', 'E')).toBe(true);
		});

		it('returns false when blocked by enemy region', () => {
			// A,B=p1 but C=p2 blocks path to D,E
			expect(graph.canReach('A', 'D')).toBe(false);
		});

		it('returns false for different owners', () => {
			expect(graph.canReach('A', 'C')).toBe(false);
		});

		it('returns false for unknown region ids', () => {
			expect(graph.canReach('A', 'Z')).toBe(false);
			expect(graph.canReach('Z', 'A')).toBe(false);
		});

		it('returns true for same region', () => {
			expect(graph.canReach('A', 'A')).toBe(true);
		});
	});

	describe('updateRegions', () => {
		it('ownership changes affect canReach', () => {
			const graph = new Graph(links, board);
			expect(graph.canReach('A', 'D')).toBe(false);

			// Give C to p1 — now A can reach D through B→C→D
			const newBoard = makeBoardState({ A: 'p1', B: 'p1', C: 'p1', D: 'p1', E: 'p1' });
			graph.updateRegions(newBoard);
			expect(graph.canReach('A', 'D')).toBe(true);
			expect(graph.canReach('A', 'E')).toBe(true);
		});
	});
});
