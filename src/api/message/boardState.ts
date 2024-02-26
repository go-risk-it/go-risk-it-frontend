export interface Region {
    id: string;
    ownerId: number;
    troops: number;
}

export interface BoardState {
    regions: Region[];
}