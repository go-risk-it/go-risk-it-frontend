import {GameState, PhaseType} from "../../../api/message/gameState.ts"
import {CardState} from "../../../api/message/cardState.ts"
import {CardMove} from "../../../api/message/cardMove.ts"
import {CardAction, CardActionType} from "../../../hooks/useCardMoveReducer.ts"
import {CardsPopupProps} from "../Popup/CardsPopup.tsx"


export const getCardsPopupProps = (
    doPlayCards: (cardMove: CardMove, gameState: GameState) => Promise<Response>,
    gameState: GameState,
    cardState: CardState,
    cardMove: CardMove,
    dispatchCardMove: (action: CardAction) => void,
): CardsPopupProps => {
    return {
        isVisible: gameState.phaseType === PhaseType.CARDS,
        playerCards: cardState.cards,
        onCombinationAdd: (combination: number[]) => {
            dispatchCardMove({
                type: CardActionType.COMBINATION_ADD,
                combination: combination,
            })
        },
        onCombinationRemove: (combinationIndex: number) => {
            dispatchCardMove({
                type: CardActionType.COMBINATION_REMOVE,
                combinationIndex: combinationIndex,
            })
        },
        selectedCombinations: cardMove.combinations,
        onCancel: () => {
        },
        onConfirm: () => {
            doPlayCards(cardMove, gameState).then(response => {
                console.log("Cards response: ", response)
            }).catch(error => {
                console.error("Error playing cards: ", error)
            })
            dispatchCardMove({type: CardActionType.RESET});
        },
    }
}
