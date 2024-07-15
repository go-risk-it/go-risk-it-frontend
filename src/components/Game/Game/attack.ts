import {PlayerState} from "../../../api/message/playersState.ts"
import {Region} from "../../../api/message/boardState.ts"
import {AttackMove} from "../../../api/message/attackMove.ts"
import {AttackAction, AttackActionType} from "../../../hooks/useAttackMoveReducer.tsx"
import {GameState, PhaseType} from "../../../api/message/gameState.ts"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isNeighbour(_: Region, __: string) {
    // TODO: Implement this
    return true
}

function setRegion(actionType: AttackActionType.SET_SOURCE_REGION | AttackActionType.SET_TARGET_REGION,
                   region: Region, dispatchAttackMove: (action: AttackAction) => void) {
    return () => {
        console.log(actionType, region.id, region.troops)
        dispatchAttackMove({
            type: actionType,
            regionId: region.id,
            currentTroops: region.troops,
        })
    }
}

export function onRegionClickAttack(thisPlayerState: PlayerState, region: Region,
                                    attackMove: AttackMove, dispatchAttackMove: (action: AttackAction) => void) {

    if (attackMove.sourceRegionId === null) {
        if (region.ownerId === thisPlayerState.userId && region.troops > 1) {
            return setRegion(AttackActionType.SET_SOURCE_REGION, region, dispatchAttackMove)
        }
    } else if (attackMove.targetRegionId === null) {
        if (region.ownerId === thisPlayerState.userId) {
            return setRegion(AttackActionType.SET_SOURCE_REGION, region, dispatchAttackMove)
        } else if (isNeighbour(region, attackMove.sourceRegionId)) {
            return setRegion(AttackActionType.SET_TARGET_REGION, region, dispatchAttackMove)
        }
    }

    return null
}

export const getAttackPopupProps = (
    doAttack: (attackMove: AttackMove) => Promise<Response>,
    gameState: GameState,
    attackMove: AttackMove,
    dispatchAttackMove: (action: AttackAction) => void,
) => {
    return {
        isVisible: gameState.phaseType === PhaseType.ATTACK && attackMove.sourceRegionId !== null && attackMove.targetRegionId !== null,
        sourceRegion: attackMove.sourceRegionId || "",
        targetRegion: attackMove.targetRegionId || "",
        troopsInSource: attackMove.troopsInSource,
        onSetTroops: (attackingTroops: number) => dispatchAttackMove({
            type: AttackActionType.SET_TROOPS,
            attackingTroops,
        }),
        onCancel: () => {
            dispatchAttackMove({type: AttackActionType.RESET})
        },
        onConfirm: () => {
            doAttack(attackMove).then(response => {
                console.log("Attack response: ", response)
            }).catch(error => {
                console.error("Error attacking: ", error)
            })
            dispatchAttackMove({type: AttackActionType.RESET})
        },
    }
}