import React from "react"
import {AttackMove} from "../api/message/attackMove.ts"

export enum AttackActionType {
    SET_SOURCE_REGION = "setSourceRegion",
    SET_TARGET_REGION = "setTargetRegion",
    SET_TROOPS = "setTroops",
}

export interface SetAttackingRegionAction {
    type: AttackActionType.SET_SOURCE_REGION
    regionId: string | null
    currentTroops: number
}

export interface SetDefendingRegionAction {
    type: AttackActionType.SET_TARGET_REGION
    regionId: string | null
    currentTroops: number
}

export interface SetTroopsAction {
    type: AttackActionType.SET_TROOPS
    attackingTroops: number
}

export type AttackAction = SetAttackingRegionAction | SetDefendingRegionAction | SetTroopsAction

function attackMoveReducer(attackMove: AttackMove, action: AttackAction): AttackMove {
    switch (action.type) {
        case AttackActionType.SET_SOURCE_REGION:
            return {...attackMove, sourceRegionId: action.regionId, troopsInSource: action.currentTroops}
        case AttackActionType.SET_TARGET_REGION:
            return {...attackMove, targetRegionId: action.regionId, troopsInTarget: action.currentTroops}
        case AttackActionType.SET_TROOPS:
            return {...attackMove, attackingTroops: action.attackingTroops}
        default:
            throw Error("Unknown action: " + action)
    }
}

export const useAttackMoveReducer = () => {
    const [attackMove, dispatchAttackMove] = React.useReducer(attackMoveReducer, {
        sourceRegionId: null,
        targetRegionId: null,
        troopsInSource: 0,
        troopsInTarget: 0,
        attackingTroops: 0,
    })

    return {attackMove, dispatchAttackMove}
}