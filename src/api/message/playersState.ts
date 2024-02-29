interface PlayerState {
    id: string;
    index: number;
}

export interface PlayersState {
    players: PlayerState[];
}