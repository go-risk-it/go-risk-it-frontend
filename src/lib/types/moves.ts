// Move request types sent to backend

export interface DeployMove {
	regionId: string | null;
	currentTroops: number;
	desiredTroops: number;
}

export interface AttackMove {
	sourceRegionId: string | null;
	targetRegionId: string | null;
	troopsInSource: number;
	troopsInTarget: number;
	attackingTroops: number;
}

export interface ConquerMove {
	troops: number;
}

export interface ReinforceMove {
	sourceRegionId: string;
	targetRegionId: string;
	troopsInSource: number;
	troopsInTarget: number;
	movingTroops: number;
}

export interface AdvanceMove {
	currentPhase: string;
}

export interface CardCombination {
	cardIDs: number[];
}

export interface CardMove {
	combinations: CardCombination[];
}
