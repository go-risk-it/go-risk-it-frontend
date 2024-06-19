export interface PlayerState {
    userId: string;
    name: string;
    index: number;
}

export interface PlayersState {
    players: PlayerState[];
}