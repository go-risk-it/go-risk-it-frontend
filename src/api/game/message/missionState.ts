export enum MissionType {
    TWO_CONTINENTS = "twoContinents",
    TWO_CONTINENTS_PLUS_ONE = "twoContinentsPlusOne",
    EIGHTEEN_TERRITORIES_TWO_TROOPS = "eighteenTerritoriesTwoTroops",
    TWENTY_FOUR_TERRITORIES = "twentyFourTerritories",
    ELIMINATE_PLAYER = "eliminatePlayer",
}

// Define interfaces for each mission type
export interface TwoContinentMission {
    continent1: string;
    continent2: string;
}

export interface TwoContinentsPlusOneMission {
    continent1: string;
    continent2: string;
}

export interface EliminatePlayerMission {
    targetUserId: string;
}

export type EmptyState = Record<string, never>

export interface EighteenTerritoriesTwoTroopsMission extends EmptyState {}
export interface TwentyFourTerritoriesMission extends EmptyState {}

// Map mission types to their detail types
export type MissionDetailsMap = {
    [MissionType.TWO_CONTINENTS]: TwoContinentMission;
    [MissionType.TWO_CONTINENTS_PLUS_ONE]: TwoContinentsPlusOneMission;
    [MissionType.EIGHTEEN_TERRITORIES_TWO_TROOPS]: EighteenTerritoriesTwoTroopsMission;
    [MissionType.TWENTY_FOUR_TERRITORIES]: TwentyFourTerritoriesMission;
    [MissionType.ELIMINATE_PLAYER]: EliminatePlayerMission;
}

// Generic MissionState
export interface MissionState<T extends MissionType = MissionType> {
    type: T;
    details: MissionDetailsMap[T];
}