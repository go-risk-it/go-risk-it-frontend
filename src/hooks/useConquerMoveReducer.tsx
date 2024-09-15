import React from "react"
import {ConquerMove} from "../api/message/conquerMove.ts"

export enum ConquerActionType {
    SET_TROOPS = "setTroops",
    RESET = "reset"
}

export interface SetTroopsAction {
    type: ConquerActionType.SET_TROOPS
    troops: number
}

export interface ResetAction {
    type: ConquerActionType.RESET
}

export type ConquerAction = SetTroopsAction | ResetAction

const initialState = {troops: 1};

function conquerMoveReducer(conquerMove: ConquerMove, action: ConquerAction): ConquerMove {
    switch (action.type) {
        case ConquerActionType.SET_TROOPS:
            return {...conquerMove, troops: action.troops}
        case ConquerActionType.RESET:
            return initialState
        default:
            throw Error("Unknown action: " + action)
    }
}

export const useConquerMoveReducer = () => {
    const [conquerMove, dispatchConquerMove] = React.useReducer(conquerMoveReducer, initialState)

    return {conquerMove, dispatchConquerMove}
}