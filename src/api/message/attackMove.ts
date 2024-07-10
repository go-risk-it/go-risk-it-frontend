export interface AttackMove {
    sourceRegionId: string | null;
    targetRegionId: string | null;
    troopsInSource: number;
    troopsInTarget: number;
    attackingTroops: number;
}