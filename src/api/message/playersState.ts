export interface PlayerState {
    id: string;
    index: number;
    troopsToDeploy: number;
}

export interface PlayersState {
    players: PlayerState[];
}