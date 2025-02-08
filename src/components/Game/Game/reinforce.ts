import {PlayerState} from "../../../api/game/message/playersState"
import {Region} from "../../../api/game/message/boardState"
import {ReinforceMove} from "../../../api/game/message/reinforceMove"
import {ReinforceAction, ReinforceActionType} from "../../../hooks/useReinforceMoveReducer.ts"
import Graph from "./Graph"
import {GameState} from "../../../api/game/message/gameState"
import {ReinforcePopupProps} from "../Popup/ReinforcePopup.tsx"

export const onRegionClickReinforce = (
    thisPlayerState: PlayerState,
    region: Region,
    reinforceMove: ReinforceMove,
    dispatchReinforceMove: (action: ReinforceAction) => void,
    graph: Graph,
) => {
    if (region.ownerId !== thisPlayerState.userId) {
        return null
    }

    if (!reinforceMove.sourceRegionId) {
        if (region.troops > 1) {
            return () => {
                dispatchReinforceMove({
                    type: ReinforceActionType.SET_SOURCE,
                    regionId: region.id,
                    troops: region.troops
                })
            }
        }
    } else if (reinforceMove.sourceRegionId !== region.id && graph.canReach(reinforceMove.sourceRegionId, region.id)) {
        return () => {
            dispatchReinforceMove({type: ReinforceActionType.SET_TARGET, regionId: region.id, troops: region.troops})
        }
    }
    return null
}

export const getReinforcePopupProps = (
    doReinforce: (reinforceMove: ReinforceMove, gameState: GameState) => Promise<Response>,
    gameState: GameState,
    reinforceMove: ReinforceMove,
    dispatchReinforceMove: (action: ReinforceAction) => void,
    ownerIndex: number,
): ReinforcePopupProps => {
    return {
        isVisible: !!reinforceMove.sourceRegionId && !!reinforceMove.targetRegionId,
        sourceRegionId: reinforceMove.sourceRegionId,
        targetRegionId: reinforceMove.targetRegionId,
        troopsInSource: reinforceMove.troopsInSource,
        troopsInTarget: reinforceMove.troopsInTarget,
        movingTroops: reinforceMove.movingTroops,
        onMovingTroopsChange: (troops: number) => dispatchReinforceMove({
            type: ReinforceActionType.SET_MOVING_TROOPS,
            troops: troops,
        }),
        onConfirm: () => {
            doReinforce(reinforceMove, gameState)
            dispatchReinforceMove({type: ReinforceActionType.RESET})
        },
        onCancel: () => dispatchReinforceMove({type: ReinforceActionType.RESET}),
        ownerIndex,
    }
}
