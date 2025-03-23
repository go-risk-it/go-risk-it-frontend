// Types for the move history
export interface DeployMove {
    regionId: string;
    currentTroops: number;
    desiredTroops: number;
}

export interface AttackMove {
    troopsInSource: number;
    troopsInTarget: number;
    attackingTroops: number;
    attackingRegionId: string;
    defendingRegionId: string;
}

export interface AttackResult {
    conqueringTroops: number;
    attackingRegionId: string;
    defendingRegionId: string;
}

export interface ConquerMove {
    troops: number;
}

export interface ReinforceMove {
    movingTroops: number;
    sourceRegionId: string;
    targetRegionId: string;
    troopsInSource: number;
    troopsInTarget: number;
}

export interface CardsMove {
    combinations: Array<{
        cardIds: number[];
    }>;
}

export interface CardsResult {
    regionTroopGrants: Array<{
        regionId: number;
        regionExternalReference: string;
    }>;
    extraDeployableTroops: number;
}

export enum PhaseType {
    DEPLOY = "deploy",
    ATTACK = "attack",
    CONQUER = "conquer",
    REINFORCE = "reinforce",
    CARDS = "cards"
}

export interface MovePerformed {
    userId: string;
    phase: PhaseType;
    move: DeployMove | AttackMove | ConquerMove | ReinforceMove | CardsMove;
    result: AttackResult | CardsResult;
    created: string;
}

export interface MoveHistory {
    moves: MovePerformed[];
}