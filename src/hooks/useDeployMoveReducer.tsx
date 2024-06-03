import React from "react"
import {DeployMove} from "../api/message/deployMove.ts"
import {useAuth} from "./useAuth.tsx"

export enum DeployActionType {
    SET_REGION = "setRegion",
    SET_TROOPS = "setTroops",
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

export type DeployAction = SetRegionAction | SetTroopsAction

function deployMoveReducer(deployMove: DeployMove, action: DeployAction) {
    switch (action.type) {
        case DeployActionType.SET_REGION:
            console.log("Reducer: Setting region", action.regionId, action.currentTroops)
            return {...deployMove, regionId: action.regionId, currentTroops: action.currentTroops}
        case DeployActionType.SET_TROOPS:
            console.log("Reducer: Setting troops", action.desiredTroops)
            return {...deployMove, desiredTroops: action.desiredTroops}
        default:
            throw Error("Unknown action: " + action)
    }
}

export const useDeployMoveReducer = () => {
    const {user} = useAuth()

    const [deployMove, dispatchDeployMove] = React.useReducer(deployMoveReducer, {
        regionId: null,
        userId: user?.id || "",
        currentTroops: 0,
        desiredTroops: 0,
    })

    return {deployMove, dispatchDeployMove}
}