export interface DeployAction {
    regionId: string | null;
    userId: string;
    currentTroops: number;
    desiredTroops: number;
}