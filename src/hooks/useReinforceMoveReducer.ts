import React from "react";
import {ReinforceMove} from '../api/game/message/reinforceMove';

export enum ReinforceActionType {
    SET_SOURCE = "setSource",
    SET_TARGET = "setTarget",
    SET_MOVING_TROOPS = "setMovingTroops",
    RESET = "reset"
}

export interface SetSourceAction {
    type: ReinforceActionType.SET_SOURCE
    regionId: string
    troops: number
}

export interface SetTargetAction {
    type: ReinforceActionType.SET_TARGET
    regionId: string
    troops: number
}

export interface SetMovingTroopsAction {
    type: ReinforceActionType.SET_MOVING_TROOPS
    troops: number
}

export interface ResetAction {
    type: ReinforceActionType.RESET
}

export type ReinforceAction = SetSourceAction | SetTargetAction | SetMovingTroopsAction | ResetAction;

const initialState: ReinforceMove = {
    sourceRegionId: '',
    targetRegionId: '',
    troopsInSource: 0,
    troopsInTarget: 0,
    movingTroops: 1,
};

function reinforceMoveReducer(reinforceMove: ReinforceMove, action: ReinforceAction): ReinforceMove {
    switch (action.type) {
        case ReinforceActionType.SET_SOURCE:
            return {...reinforceMove, sourceRegionId: action.regionId, troopsInSource: action.troops, movingTroops: 1};
        case ReinforceActionType.SET_TARGET:
            return {...reinforceMove, targetRegionId: action.regionId, troopsInTarget: action.troops, movingTroops: 1};
        case ReinforceActionType.SET_MOVING_TROOPS:
            return {...reinforceMove, movingTroops: Math.min(action.troops, reinforceMove.troopsInSource - 1)};
        case ReinforceActionType.RESET:
            return initialState;
        default:
            throw Error("Unknown action: " + action);
    }
}

export const useReinforceMoveReducer = () => {
    const [reinforceMove, dispatchReinforceMove] = React.useReducer(reinforceMoveReducer, initialState);
    return {reinforceMove, dispatchReinforceMove};
};
