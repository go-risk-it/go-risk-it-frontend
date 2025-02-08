import {PlayerState} from "../../../api/game/message/playersState.ts"
import {Region} from "../../../api/game/message/boardState.ts"
import {DeployMove} from "../../../api/game/message/deployMove.ts"
import {DeployAction, DeployActionType} from "../../../hooks/useDeployMoveReducer.ts"
import {DeployPhaseState, GameState} from "../../../api/game/message/gameState.ts"
import {DeployPopupProps} from "../Popup/DeployPopup.tsx"

export function onRegionClickDeploy(thisPlayerState: PlayerState, region: Region, deployMove: DeployMove, dispatchDeployMove: (action: DeployAction) => void) {
    if (thisPlayerState.userId === region.ownerId && deployMove.regionId === null) {
        return () => dispatchDeployMove({
            type: DeployActionType.SET_REGION,
            regionId: region.id,
            currentTroops: region.troops,
        })
    }
    return null
}

export const getDeployPopupProps = (
    doDeploy: (deployMove: DeployMove, gameState: GameState) => Promise<Response>,
    gameState: GameState,
    phaseState: DeployPhaseState,
    deployMove: DeployMove,
    dispatchDeployMove: (action: DeployAction) => void,
    ownerIndex: number,
): DeployPopupProps => {
    return {
        isVisible: deployMove.regionId !== null,
        region: deployMove.regionId || "",
        currentTroops: deployMove.currentTroops,
        deployableTroops: phaseState.deployableTroops,
        onSetTroops: (desiredTroops: number) => dispatchDeployMove({type: DeployActionType.SET_TROOPS, desiredTroops}),
        onCancel: () => dispatchDeployMove({type: DeployActionType.RESET}),
        onConfirm: () => {
            doDeploy(deployMove, gameState).then(response => {
                console.log("Deploy response: ", response)
            }).catch(error => {
                console.error("Error deploying: ", error)
            })
            dispatchDeployMove({type: DeployActionType.RESET})
        },
        ownerIndex,
    }
}
