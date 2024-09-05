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

export type ConquerAction = SetTroopsAction

function conquerMoveReducer(conquerMove: ConquerMove, action: ConquerAction): ConquerMove {
    switch (action.type) {
        case ConquerActionType.SET_TROOPS:
            return {...conquerMove, troops: action.troops}
        default:
            throw Error("Unknown action: " + action)
    }
}

export const useConquerMoveReducer = () => {
    const [conquerMove, dispatchConquerMove] = React.useReducer(conquerMoveReducer, {
        troops: 0,
    })

    return {conquerMove, dispatchConquerMove}
}