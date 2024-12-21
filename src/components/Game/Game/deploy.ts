import {PlayerState} from "../../../api/message/playersState.ts"
import {Region} from "../../../api/message/boardState.ts"
import {DeployMove} from "../../../api/message/deployMove.ts"
import {DeployAction, DeployActionType} from "../../../hooks/useDeployMoveReducer.ts"
import {DeployPhaseState, GameState, PhaseType} from "../../../api/message/gameState.ts"
import { DeployPopupProps } from "../Popup/DeployPopup.tsx"

export function onRegionClickDeploy(thisPlayerState: PlayerState, region: Region, deployMove: DeployMove, dispatchDeployMove: (action: DeployAction) => void) {
    if (thisPlayerState.userId === region.ownerId && deployMove.regionId === null) {
        return () => dispatchDeployMove({
            type: DeployActionType.SET_REGION,
            regionId: region.id,
            currentTroops: region.troops,
        });
    }
    return null;
}

export const getDeployPopupProps = (
    doDeploy: (deployMove: DeployMove, gameState: GameState) => Promise<Response>,
    gameState: GameState,
    phaseState: DeployPhaseState,
    deployMove: DeployMove,
    dispatchDeployMove: (action: DeployAction) => void,
    ownerIndex: number
): DeployPopupProps => {
    return {
        isVisible: gameState.phaseType === PhaseType.DEPLOY && deployMove.regionId !== null,
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
