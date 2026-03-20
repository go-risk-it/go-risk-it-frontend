/**
 * UI interaction state machine for player moves. Tracks what the user is currently
 * doing (selecting regions, adjusting troops, picking cards) as a discriminated union
 * keyed by game phase. Each phase has dedicated setter functions that enforce the
 * correct state shape via runtime guards.
 */

import type { PhaseType } from '$lib/types/game';
import type { CardCombination } from '$lib/types/moves';

/**
 * Discriminated union representing the user's in-progress move interaction.
 * The `phase` field determines which properties are available:
 * - `idle`: No interaction in progress.
 * - `deploy`: Region and troop count for deployment.
 * - `attack`: Source/target regions and attacking troop count.
 * - `conquer`: Troop count to move into a conquered territory.
 * - `reinforce`: Source/target regions and moving troop count.
 * - `cards`: Selected card IDs and committed combinations to play.
 */
export type MoveInteraction =
	| { phase: 'idle' }
	| { phase: 'deploy'; regionId: string | null; troops: number }
	| {
			phase: 'attack';
			sourceRegionId: string | null;
			targetRegionId: string | null;
			attackingTroops: number;
	  }
	| { phase: 'conquer'; troops: number }
	| {
			phase: 'reinforce';
			sourceRegionId: string | null;
			targetRegionId: string | null;
			movingTroops: number;
	  }
	| {
			phase: 'cards';
			selectedCardIds: number[];
			combinations: CardCombination[];
	  };

/**
 * Create a reactive move interaction state machine.
 * @returns The current interaction state, phase transition methods, and per-phase setters.
 */
export function createMoveState() {
	let interaction = $state<MoveInteraction>({ phase: 'idle' });

	/** Return to idle state, discarding any in-progress interaction. */
	function reset() {
		interaction = { phase: 'idle' };
	}

	/**
	 * Transition to a new phase with default (empty) interaction values.
	 * @param phaseType - The game phase to enter.
	 */
	function startPhase(phaseType: PhaseType) {
		switch (phaseType) {
			case 'deploy':
				interaction = { phase: 'deploy', regionId: null, troops: 0 };
				break;
			case 'attack':
				interaction = {
					phase: 'attack',
					sourceRegionId: null,
					targetRegionId: null,
					attackingTroops: 1
				};
				break;
			case 'conquer':
				interaction = { phase: 'conquer', troops: 0 };
				break;
			case 'reinforce':
				interaction = {
					phase: 'reinforce',
					sourceRegionId: null,
					targetRegionId: null,
					movingTroops: 0
				};
				break;
			case 'cards':
				interaction = { phase: 'cards', selectedCardIds: [], combinations: [] };
				break;
		}
	}

	// --- Deploy setters ---

	/** @param regionId - Region to deploy troops to. */
	function setDeployRegion(regionId: string) {
		if (interaction.phase === 'deploy') {
			interaction = { ...interaction, regionId };
		}
	}

	function setDeployTroops(troops: number) {
		if (interaction.phase === 'deploy') {
			interaction = { ...interaction, troops };
		}
	}

	// --- Attack setters ---

	/** Set the attacking source region. Resets target and troop count. */
	function setAttackSource(regionId: string) {
		if (interaction.phase === 'attack') {
			interaction = {
				...interaction,
				sourceRegionId: regionId,
				targetRegionId: null,
				attackingTroops: 1
			};
		}
	}

	function setAttackTarget(regionId: string) {
		if (interaction.phase === 'attack') {
			interaction = { ...interaction, targetRegionId: regionId };
		}
	}

	function setAttackingTroops(troops: number) {
		if (interaction.phase === 'attack') {
			interaction = { ...interaction, attackingTroops: troops };
		}
	}

	// --- Conquer setters ---

	function setConquerTroops(troops: number) {
		if (interaction.phase === 'conquer') {
			interaction = { ...interaction, troops };
		}
	}

	// --- Reinforce setters ---

	/** Set the reinforcement source. Resets target and troop count. */
	function setReinforceSource(regionId: string) {
		if (interaction.phase === 'reinforce') {
			interaction = {
				...interaction,
				sourceRegionId: regionId,
				targetRegionId: null,
				movingTroops: 0
			};
		}
	}

	function setReinforceTarget(regionId: string) {
		if (interaction.phase === 'reinforce') {
			interaction = { ...interaction, targetRegionId: regionId };
		}
	}

	function setReinforceTroops(troops: number) {
		if (interaction.phase === 'reinforce') {
			interaction = { ...interaction, movingTroops: troops };
		}
	}

	// --- Card setters ---

	/**
	 * Commit the currently selected cards as a combination and clear the selection.
	 * @param cardIds - Card IDs forming a valid combination.
	 */
	function addCardCombination(cardIds: number[]) {
		if (interaction.phase === 'cards') {
			interaction = {
				...interaction,
				selectedCardIds: [],
				combinations: [...interaction.combinations, { cardIDs: cardIds }]
			};
		}
	}

	/** Remove a previously committed card combination by its index. */
	function removeCardCombination(index: number) {
		if (interaction.phase === 'cards') {
			const newCombinations = [...interaction.combinations];
			newCombinations.splice(index, 1);
			interaction = { ...interaction, combinations: newCombinations };
		}
	}

	/** Update the set of card IDs currently highlighted (before committing a combination). */
	function setSelectedCards(cardIds: number[]) {
		if (interaction.phase === 'cards') {
			interaction = { ...interaction, selectedCardIds: cardIds };
		}
	}

	return {
		get interaction() {
			return interaction;
		},
		reset,
		startPhase,
		setDeployRegion,
		setDeployTroops,
		setAttackSource,
		setAttackTarget,
		setAttackingTroops,
		setConquerTroops,
		setReinforceSource,
		setReinforceTarget,
		setReinforceTroops,
		addCardCombination,
		removeCardCombination,
		setSelectedCards
	};
}
