export interface PlayerState {
    userId: string;
    name: string;
    index: number;
    troopsToDeploy: number;
}

export interface PlayersState {
    players: PlayerState[];
}