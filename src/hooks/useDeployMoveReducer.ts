import React from "react"
import {DeployMove} from "../api/message/deployMove.ts"

export enum DeployActionType {
    SET_REGION = "setRegion",
    SET_TROOPS = "setTroops",
    RESET = "reset"
}

export interface SetRegionAction {
    type: DeployActionType.SET_REGION
    regionId: string | null
    currentTroops: number
}

export interface SetTroopsAction {
    type: DeployActionType.SET_TROOPS
    desiredTroops: number
}

export interface ResetAction {
    type: DeployActionType.RESET
}

export type DeployAction = SetRegionAction | SetTroopsAction | ResetAction

function deployMoveReducer(deployMove: DeployMove, action: DeployAction) {
    switch (action.type) {
        case DeployActionType.SET_REGION:
            console.log("Reducer: Setting region", action.regionId, action.currentTroops)
            return {...deployMove, regionId: action.regionId, currentTroops: action.currentTroops}
        case DeployActionType.SET_TROOPS:
            console.log("Reducer: Setting troops", action.desiredTroops)
            return {...deployMove, desiredTroops: action.desiredTroops}
        case DeployActionType.RESET:
            console.log("Reducer: Resetting")
            return {regionId: null, currentTroops: 0, desiredTroops: 0}
        default:
            throw Error("Unknown action: " + action)
    }
}

export const useDeployMoveReducer = () => {
    const [deployMove, dispatchDeployMove] = React.useReducer(deployMoveReducer, {
        regionId: null,
        currentTroops: 0,
        desiredTroops: 0,
    })

    return {deployMove, dispatchDeployMove}
}