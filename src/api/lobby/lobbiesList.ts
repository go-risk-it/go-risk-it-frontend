export interface Lobby {
    id: number;
    numberOfParticipants: number;
}

export interface LobbiesList {
    owned: Lobby[];
    joined: Lobby[];
    joinable: Lobby[];
}
