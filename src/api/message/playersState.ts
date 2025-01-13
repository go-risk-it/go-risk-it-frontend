export enum ConnectionStatus {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
}

export enum PlayerStatus {
    ALIVE = "alive",
    DEAD = "dead",
}

export interface PlayerState {
    userId: string;
    name: string;
    index: number;
    cardCount: number;
    status: PlayerStatus;
    connectionStatus: ConnectionStatus;
}

export interface PlayersState {
    players: PlayerState[];
}