import type { PhaseType } from '$lib/types/game';
import type { CardCombination } from '$lib/types/moves';

// Discriminated union for the interaction state machine
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

export function createMoveState() {
	let interaction = $state<MoveInteraction>({ phase: 'idle' });

	function reset() {
		interaction = { phase: 'idle' };
	}

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

	// Deploy actions
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

	// Attack actions
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

	// Conquer actions
	function setConquerTroops(troops: number) {
		if (interaction.phase === 'conquer') {
			interaction = { ...interaction, troops };
		}
	}

	// Reinforce actions
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

	// Card actions
	function addCardCombination(cardIds: number[]) {
		if (interaction.phase === 'cards') {
			interaction = {
				...interaction,
				selectedCardIds: [],
				combinations: [...interaction.combinations, { cardIDs: cardIds }]
			};
		}
	}

	function removeCardCombination(index: number) {
		if (interaction.phase === 'cards') {
			const newCombinations = [...interaction.combinations];
			newCombinations.splice(index, 1);
			interaction = { ...interaction, combinations: newCombinations };
		}
	}

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
