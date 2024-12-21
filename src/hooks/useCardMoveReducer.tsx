import React from "react"
import {CardMove} from "../api/message/cardMove.ts"

export enum CardActionType {
    SELECT_COMBINATION = "selectCombination",
    UNSELECT_COMBINATION = "unselectCombination",
    RESET = "reset"
}

export interface SelectCombinationAction {
    type: CardActionType.SELECT_COMBINATION
    combination: number[]
}

export interface UnselectCombinationAction {
    type: CardActionType.UNSELECT_COMBINATION
    combinationIndex: number
}

export interface ResetAction {
    type: CardActionType.RESET
}

export type CardAction = SelectCombinationAction | UnselectCombinationAction | ResetAction

const initialState = {combinations: []}

function cardMoveReducer(cardMove: CardMove, action: CardAction): CardMove {
    switch (action.type) {
        case CardActionType.SELECT_COMBINATION:
            // check that the combination has three cards
            if (action.combination.length !== 3) {
                return cardMove
            }
            return {combinations: [...cardMove.combinations, {cardIDs: action.combination}]}
        case CardActionType.UNSELECT_COMBINATION:
            return {combinations: cardMove.combinations.filter((_, index) => index !== action.combinationIndex)}
        case CardActionType.RESET:
            return initialState
        default:
            throw Error("Unknown action: " + action)
    }
}

export const useCardMoveReducer = () => {
    const [cardMove, dispatchCardMove] = React.useReducer(cardMoveReducer, initialState)

    return {cardMove, dispatchCardMove}
}