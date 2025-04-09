export enum PhaseType {
    CARDS = "cards",
    DEPLOY = "deploy",
    ATTACK = "attack",
    CONQUER = "conquer",
    REINFORCE = "reinforce",
}

export type EmptyState = Record<string, never>

export interface DeployPhaseState {
    deployableTroops: number;
}

export interface ConquerPhaseState {
    attackingRegionId: string;
    defendingRegionId: string;
    minTroopsToMove: number;
}

export type PhaseState = EmptyState | DeployPhaseState | ConquerPhaseState;

export interface GameState {
    id: number;
    turn: number;
    phaseType: PhaseType;
    winnerUserId: string;
}

export interface GameStateAPI {
    id: number;
    turn: number;
    phase: {
        type: PhaseType;
        state: PhaseState;
    }; 
    winnerUserId: string;
}

