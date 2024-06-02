export interface DeployMove {
    regionId: string | null;
    userId: string;
    currentTroops: number;
    desiredTroops: number;
}