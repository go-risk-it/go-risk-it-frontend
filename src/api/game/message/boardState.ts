export interface Region {
    id: string;
    ownerId: string;
    troops: number;
}

export interface BoardState {
    regions: Region[];
}