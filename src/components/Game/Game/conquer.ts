import {BoardState} from "../../../api/message/boardState.ts"
import {ConquerMove} from "../../../api/message/conquerMove.ts"
import {ConquerPhaseState, GameState, PhaseType} from "../../../api/message/gameState.ts"
import {ConquerAction, ConquerActionType} from "../../../hooks/useConquerMoveReducer.tsx"
import {ConquerPopupProps} from "../Popup/ConquerPopup.tsx"


export const getConquerPopupProps = (
    doConquer: (conquerMove: ConquerMove, gameState: GameState) => Promise<Response>,
    gameState: GameState,
    phaseState: ConquerPhaseState,
    boardState: BoardState,
    conquerMove: ConquerMove,
    dispatchConquerMove: (action: ConquerAction) => void,
): ConquerPopupProps => {
    const troopsInSource = boardState.regions.find(region => region.id === phaseState.attackingRegionId)?.troops
    return {
        isVisible: gameState.phaseType === PhaseType.CONQUER,
        sourceRegion: phaseState.attackingRegionId,
        targetRegion: phaseState.defendingRegionId,
        troopsInSource: troopsInSource || 0,
        minTroopsToMove: phaseState.minTroopsToMove,
        onSetTroops: (troopsToMove: number) => dispatchConquerMove({
            type: ConquerActionType.SET_TROOPS,
            troops: troopsToMove,
        }),
        onConfirm: () => {
            doConquer(conquerMove, gameState).then(response => {
                console.log("Conquer response: ", response)
            }).catch(error => {
                console.error("Error conquering: ", error)
            })
        },
    }
}