export enum Phase {
    CARDS = "CARDS",
    DEPLOY = "DEPLOY",
    ATTACK = "ATTACK",
    REINFORCE = "REINFORCE",
}

export interface GameState {
    gameId: number;
    currentTurn: number;
    currentPhase: Phase;
    deployableTroops: number;
}