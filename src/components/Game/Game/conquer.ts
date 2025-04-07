import {BoardState} from "../../../api/game/message/boardState.ts"
import {ConquerMove} from "../../../api/game/message/conquerMove.ts"
import {ConquerPhaseState, GameState} from "../../../api/game/message/gameState.ts"
import {ConquerAction, ConquerActionType} from "../../../hooks/useConquerMoveReducer.ts"
import {ConquerPopupProps} from "../Popup/ConquerPopup.tsx"
import {PlayersState} from "../../../api/game/message/playersState.ts"


export const getConquerPopupProps = (
    doConquer: (conquerMove: ConquerMove, gameState: GameState) => Promise<Response>,
    gameState: GameState,
    phaseState: ConquerPhaseState,
    boardState: BoardState,
    conquerMove: ConquerMove,
    dispatchConquerMove: (action: ConquerAction) => void,
    playersState: PlayersState,
): ConquerPopupProps => {
    const sourceRegion = boardState.regions.find(r => r.id === phaseState.attackingRegionId)
    const targetRegion = boardState.regions.find(r => r.id === phaseState.defendingRegionId)
    const sourceOwner = playersState.players.find(p => p.userId === sourceRegion?.ownerId)
    const targetOwner = playersState.players.find(p => p.userId === targetRegion?.ownerId)

    const troopsInSource = sourceRegion?.troops || 0

    const onSetTroops = (troopsToMove: number) => {
        dispatchConquerMove({
            type: ConquerActionType.SET_TROOPS,
            troops: troopsToMove,
        })
    }

    const onConfirm = () => {
        doConquer(conquerMove, gameState).then(response => {
            console.log("Conquer response: ", response)
        }).catch(error => {
            console.error("Error conquering: ", error)
        })
        dispatchConquerMove({type: ConquerActionType.RESET})
    }

    return {
        isVisible: true,
        sourceRegion: phaseState.attackingRegionId,
        targetRegion: phaseState.defendingRegionId,
        troopsInSource: troopsInSource,
        minTroopsToMove: phaseState.minTroopsToMove,
        onSetTroops: onSetTroops,
        onConfirm: onConfirm,
        sourceOwnerIndex: sourceOwner?.index ?? 0,
        targetOwnerIndex: targetOwner?.index ?? 0,
    }
}
