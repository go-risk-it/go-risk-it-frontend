/**
 * Move request payloads sent from the client to the backend API.
 * Each interface corresponds to one phase-specific action the player can take.
 * Fields that are nullable represent selections not yet made in the UI.
 */

/** Place troops into a region during the deploy phase. */
export interface DeployMove {
	/** Target region, or null if the player hasn't selected one yet. */
	regionId: string | null;
	/** Troop count in the region before this deployment. */
	currentTroops: number;
	/** Troop count the player wants after deployment. */
	desiredTroops: number;
}

/** Launch an attack from one region into an adjacent enemy region. */
export interface AttackMove {
	/** Attacking region, or null if not yet selected. */
	sourceRegionId: string | null;
	/** Defending region, or null if not yet selected. */
	targetRegionId: string | null;
	/** Current troop count in the source region (for UI validation). */
	troopsInSource: number;
	/** Current troop count in the target region (for UI validation). */
	troopsInTarget: number;
	/** Number of troops committed to the attack (1-3). */
	attackingTroops: number;
}

/** Move troops into a newly conquered region after a successful attack. */
export interface ConquerMove {
	/** Number of troops to move into the conquered region. */
	troops: number;
}

/** Move troops between two owned, connected regions during the reinforce phase. */
export interface ReinforceMove {
	sourceRegionId: string;
	targetRegionId: string;
	/** Current troop count in the source region (for UI validation). */
	troopsInSource: number;
	/** Current troop count in the target region (for UI validation). */
	troopsInTarget: number;
	/** Number of troops to transfer. */
	movingTroops: number;
}

/** Skip the current phase and advance to the next one. */
export interface AdvanceMove {
	/** The phase being skipped (server validates this matches the actual current phase). */
	currentPhase: string;
}

/** A set of card IDs that form a valid combination (e.g. three of a kind). */
export interface CardCombination {
	cardIDs: number[];
}

/** Play one or more card combinations during the cards phase. */
export interface CardMove {
	combinations: CardCombination[];
}
