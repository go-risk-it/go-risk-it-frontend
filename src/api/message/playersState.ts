interface PlayerState {
    userId: string;
    index: number;
}

export interface PlayersState {
    players: PlayerState[];
}