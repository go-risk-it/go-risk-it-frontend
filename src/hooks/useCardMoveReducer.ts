import React from "react"
import {CardMove} from "../api/game/message/cardMove.ts"

export enum CardActionType {
    COMBINATION_ADD = "selectCombination",
    COMBINATION_REMOVE = "unselectCombination",
    RESET = "reset"
}

export interface AddCombinationAction {
    type: CardActionType.COMBINATION_ADD
    combination: number[]
}

export interface RemoveCombinationAction {
    type: CardActionType.COMBINATION_REMOVE
    combinationIndex: number
}

export interface ResetAction {
    type: CardActionType.RESET
}

export type CardAction = AddCombinationAction | RemoveCombinationAction | ResetAction

const initialState = {combinations: []}

function cardMoveReducer(cardMove: CardMove, action: CardAction): CardMove {
    switch (action.type) {
        case CardActionType.COMBINATION_ADD:
            // check that the combination has three cards
            if (action.combination.length !== 3) {
                console.error("Combination must have exactly three cards")
                return cardMove
            }
            console.log("Selecting combination: " + action.combination)
            return {combinations: [...cardMove.combinations, {cardIDs: action.combination}]}
        case CardActionType.COMBINATION_REMOVE:
            console.log("Unselecting combination at index " + action.combinationIndex)
            return {combinations: cardMove.combinations.filter((_, index) => index !== action.combinationIndex)}
        case CardActionType.RESET:
            console.log("Resetting card move")
            return initialState
        default:
            throw Error("Unknown action: " + action)
    }
}


export const useCardMoveReducer = () => {
    const [cardMove, dispatchCardMove] = React.useReducer(cardMoveReducer, initialState)

    return {cardMove, dispatchCardMove}
}