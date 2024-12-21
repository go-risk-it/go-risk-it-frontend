import {PlayersState, PlayerState} from "../../../api/message/playersState.ts"
import {BoardState, Region} from "../../../api/message/boardState.ts"
import {AttackMove} from "../../../api/message/attackMove.ts"
import {AttackAction, AttackActionType} from "../../../hooks/useAttackMoveReducer.ts"
import {GameState, PhaseType} from "../../../api/message/gameState.ts"
import Graph from "./Graph.ts"
import {AttackPopupProps} from "../Popup/AttackPopup.tsx"

export function onRegionClickAttack(thisPlayerState: PlayerState, region: Region,
                                    attackMove: AttackMove, dispatchAttackMove: (action: AttackAction) => void,
                                    graph: Graph) {
    console.log("onRegionClickAttack", attackMove, region)
    if (!attackMove.sourceRegionId) {
        if (region.ownerId === thisPlayerState.userId && region.troops > 1) {
            return () => dispatchAttackMove({
                type: AttackActionType.SET_SOURCE_REGION,
                regionId: region.id,
                currentTroops: region.troops,
            })
        }
    } else if (!attackMove.targetRegionId) {
        if (region.ownerId === thisPlayerState.userId) {
            return () => dispatchAttackMove({
                type: AttackActionType.SET_SOURCE_REGION,
                regionId: region.id,
                currentTroops: region.troops,
            })
        } else if (graph.areNeighbors(region.id, attackMove.sourceRegionId)) {
            return () => dispatchAttackMove({
                type: AttackActionType.SET_TARGET_REGION,
                regionId: region.id,
                currentTroops: region.troops,
            })
        }
    }
    return null
}

export const getAttackPopupProps = (
    doAttack: (attackMove: AttackMove, gameState: GameState) => Promise<Response>,
    gameState: GameState,
    attackMove: AttackMove,
    dispatchAttackMove: (action: AttackAction) => void,
    boardState: BoardState,
    playersState: PlayersState,
): AttackPopupProps => {
    const sourceRegion = boardState.regions.find(r => r.id === attackMove.sourceRegionId)
    const targetRegion = boardState.regions.find(r => r.id === attackMove.targetRegionId)
    const sourceOwner = playersState.players.find(p => p.userId === sourceRegion?.ownerId)
    const targetOwner = playersState.players.find(p => p.userId === targetRegion?.ownerId)

    return {
        isVisible: gameState.phaseType === PhaseType.ATTACK && attackMove.sourceRegionId !== null && attackMove.targetRegionId !== null,
        sourceRegion: attackMove.sourceRegionId || "",
        targetRegion: attackMove.targetRegionId || "",
        troopsInSource: attackMove.troopsInSource,
        troopsInTarget: attackMove.troopsInTarget,
        onSetTroops: (attackingTroops: number) => dispatchAttackMove({
            type: AttackActionType.SET_TROOPS,
            attackingTroops,
        }),
        onCancel: () => {
            dispatchAttackMove({type: AttackActionType.RESET})
        },
        onConfirm: () => {
            doAttack(attackMove, gameState).then(response => {
                console.log("Attack response: ", response)
            }).catch(error => {
                console.error("Error attacking: ", error)
            })
            dispatchAttackMove({type: AttackActionType.RESET})
        },
        sourceOwnerIndex: sourceOwner?.index ?? 0,
        targetOwnerIndex: targetOwner?.index ?? 0,
    }
}
