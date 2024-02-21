export interface Region {
    regionId: number;
    ownerId: number;
    troops: number;
}

export interface BoardState {
    regions: Region[];
}