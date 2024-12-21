import {GameState, PhaseType} from "../../../api/message/gameState.ts"
import {CardState} from "../../../api/message/cardState.ts"
import {CardMove} from "../../../api/message/cardMove.ts"
import {CardAction, CardActionType} from "../../../hooks/useCardMoveReducer.tsx"


export const getCardsPopupProps = (
    doPlayCards: (cardMove: CardMove, gameState: GameState) => Promise<Response>,
    gameState: GameState,
    cardState: CardState,
    cardMove: CardMove,
    dispatchCardMove: (action: CardAction) => void,
    getSvgPathForRegion: (regionId: string) => string,
) => {
    return {
        isVisible: gameState.phaseType === PhaseType.CARDS,
        cardState: cardState,
        getSvgPathForRegion: getSvgPathForRegion,
        onCancel: () => {
        },
        onConfirm: () => {
            doPlayCards(cardMove, gameState)
            dispatchCardMove({type: CardActionType.RESET});
        },
    }
}
