import { describe, it, expect } from 'vitest';
import { createMoveState } from './move-state.svelte';

describe('createMoveState', () => {
	it('starts in idle phase', () => {
		const state = createMoveState();
		expect(state.interaction).toEqual({ phase: 'idle' });
	});

	describe('startPhase', () => {
		it('deploy: sets correct initial values', () => {
			const state = createMoveState();
			state.startPhase('deploy');
			expect(state.interaction).toEqual({ phase: 'deploy', regionId: null, troops: 1 });
		});

		it('attack: sets correct initial values', () => {
			const state = createMoveState();
			state.startPhase('attack');
			expect(state.interaction).toEqual({
				phase: 'attack',
				sourceRegionId: null,
				targetRegionId: null,
				attackingTroops: 1,
				blitzRequested: false
			});
		});

		it('conquer: sets correct initial values', () => {
			const state = createMoveState();
			state.startPhase('conquer');
			expect(state.interaction).toEqual({ phase: 'conquer', troops: 0 });
		});

		it('reinforce: sets correct initial values', () => {
			const state = createMoveState();
			state.startPhase('reinforce');
			expect(state.interaction).toEqual({
				phase: 'reinforce',
				sourceRegionId: null,
				targetRegionId: null,
				movingTroops: 1
			});
		});

		it('cards: sets correct initial values', () => {
			const state = createMoveState();
			state.startPhase('cards');
			expect(state.interaction).toEqual({ phase: 'cards', selectedCardIds: [], combinations: [] });
		});
	});

	describe('phase guards', () => {
		it('deploy actions ignored when not in deploy phase', () => {
			const state = createMoveState();
			state.startPhase('attack');
			state.setDeployRegion('r1');
			state.setDeployTroops(5);
			expect(state.interaction.phase).toBe('attack');
		});

		it('attack actions ignored when not in attack phase', () => {
			const state = createMoveState();
			state.startPhase('deploy');
			state.setAttackSource('r1');
			expect(state.interaction.phase).toBe('deploy');
		});

		it('conquer actions ignored when not in conquer phase', () => {
			const state = createMoveState();
			state.startPhase('deploy');
			state.setConquerTroops(3);
			expect(state.interaction.phase).toBe('deploy');
		});

		it('reinforce actions ignored when not in reinforce phase', () => {
			const state = createMoveState();
			state.startPhase('deploy');
			state.setReinforceSource('r1');
			expect(state.interaction.phase).toBe('deploy');
		});

		it('card actions ignored when not in cards phase', () => {
			const state = createMoveState();
			state.startPhase('deploy');
			state.addCardCombination([1, 2, 3]);
			expect(state.interaction.phase).toBe('deploy');
		});
	});

	describe('deploy actions', () => {
		it('setDeployRegion updates region', () => {
			const state = createMoveState();
			state.startPhase('deploy');
			state.setDeployRegion('r1');
			expect(state.interaction).toEqual({ phase: 'deploy', regionId: 'r1', troops: 1 });
		});

		it('setDeployTroops updates troops', () => {
			const state = createMoveState();
			state.startPhase('deploy');
			state.setDeployTroops(5);
			expect(state.interaction).toEqual({ phase: 'deploy', regionId: null, troops: 5 });
		});
	});

	describe('attack actions', () => {
		it('setAttackSource resets target and troops', () => {
			const state = createMoveState();
			state.startPhase('attack');
			state.setAttackSource('r1');
			state.setAttackTarget('r2');
			state.setAttackingTroops(3);
			// Setting new source resets target and troops
			state.setAttackSource('r3');
			expect(state.interaction).toEqual({
				phase: 'attack',
				sourceRegionId: 'r3',
				targetRegionId: null,
				attackingTroops: 1,
				blitzRequested: false
			});
		});

		it('setAttackTarget updates target', () => {
			const state = createMoveState();
			state.startPhase('attack');
			state.setAttackSource('r1');
			state.setAttackTarget('r2');
			expect(state.interaction).toMatchObject({ targetRegionId: 'r2' });
		});

		it('setAttackingTroops updates troops', () => {
			const state = createMoveState();
			state.startPhase('attack');
			state.setAttackingTroops(3);
			expect(state.interaction).toMatchObject({ attackingTroops: 3 });
		});
	});

	describe('conquer actions', () => {
		it('setConquerTroops updates troops', () => {
			const state = createMoveState();
			state.startPhase('conquer');
			state.setConquerTroops(5);
			expect(state.interaction).toEqual({ phase: 'conquer', troops: 5 });
		});
	});

	describe('reinforce actions', () => {
		it('setReinforceSource resets target and troops', () => {
			const state = createMoveState();
			state.startPhase('reinforce');
			state.setReinforceSource('r1');
			state.setReinforceTarget('r2');
			state.setReinforceTroops(3);
			// Setting new source resets target and troops
			state.setReinforceSource('r3');
			expect(state.interaction).toEqual({
				phase: 'reinforce',
				sourceRegionId: 'r3',
				targetRegionId: null,
				movingTroops: 1
			});
		});

		it('setReinforceTarget updates target', () => {
			const state = createMoveState();
			state.startPhase('reinforce');
			state.setReinforceTarget('r2');
			expect(state.interaction).toMatchObject({ targetRegionId: 'r2' });
		});

		it('setReinforceTroops updates troops', () => {
			const state = createMoveState();
			state.startPhase('reinforce');
			state.setReinforceTroops(4);
			expect(state.interaction).toMatchObject({ movingTroops: 4 });
		});
	});

	describe('card actions', () => {
		it('addCardCombination clears selection and appends combo', () => {
			const state = createMoveState();
			state.startPhase('cards');
			state.setSelectedCards([1, 2, 3]);
			state.addCardCombination([1, 2, 3]);
			expect(state.interaction).toMatchObject({
				phase: 'cards',
				selectedCardIds: [],
				combinations: [{ cardIDs: [1, 2, 3] }]
			});
		});

		it('addCardCombination appends multiple combos', () => {
			const state = createMoveState();
			state.startPhase('cards');
			state.addCardCombination([1, 2, 3]);
			state.addCardCombination([4, 5, 6]);
			expect(state.interaction).toMatchObject({
				combinations: [{ cardIDs: [1, 2, 3] }, { cardIDs: [4, 5, 6] }]
			});
		});

		it('removeCardCombination by index', () => {
			const state = createMoveState();
			state.startPhase('cards');
			state.addCardCombination([1, 2, 3]);
			state.addCardCombination([4, 5, 6]);
			state.removeCardCombination(0);
			expect(state.interaction).toMatchObject({
				combinations: [{ cardIDs: [4, 5, 6] }]
			});
		});

		it('setSelectedCards updates selection', () => {
			const state = createMoveState();
			state.startPhase('cards');
			state.setSelectedCards([7, 8]);
			expect(state.interaction).toMatchObject({ selectedCardIds: [7, 8] });
		});
	});

	describe('lastConqueredRegionId', () => {
		it('starts null', () => {
			const state = createMoveState();
			expect(state.lastConqueredRegionId).toBeNull();
		});

		it('setLastConqueredRegionId stores the value', () => {
			const state = createMoveState();
			state.setLastConqueredRegionId('r5');
			expect(state.lastConqueredRegionId).toBe('r5');
		});

		it('clearLastConqueredRegionId resets to null', () => {
			const state = createMoveState();
			state.setLastConqueredRegionId('r5');
			state.clearLastConqueredRegionId();
			expect(state.lastConqueredRegionId).toBeNull();
		});

		it('persists across phase changes', () => {
			const state = createMoveState();
			state.setLastConqueredRegionId('r5');
			state.startPhase('attack');
			expect(state.lastConqueredRegionId).toBe('r5');
		});

		it('reset() does not clear it', () => {
			const state = createMoveState();
			state.setLastConqueredRegionId('r5');
			state.reset();
			expect(state.lastConqueredRegionId).toBe('r5');
		});
	});

	describe('reset', () => {
		it('returns to idle from deploy', () => {
			const state = createMoveState();
			state.startPhase('deploy');
			state.setDeployRegion('r1');
			state.reset();
			expect(state.interaction).toEqual({ phase: 'idle' });
		});

		it('returns to idle from attack', () => {
			const state = createMoveState();
			state.startPhase('attack');
			state.reset();
			expect(state.interaction).toEqual({ phase: 'idle' });
		});

		it('returns to idle from cards', () => {
			const state = createMoveState();
			state.startPhase('cards');
			state.addCardCombination([1, 2, 3]);
			state.reset();
			expect(state.interaction).toEqual({ phase: 'idle' });
		});
	});
});
