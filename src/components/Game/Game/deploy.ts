import {PlayerState} from "../../../api/message/playersState.ts"
import {Region} from "../../../api/message/boardState.ts"
import {DeployMove} from "../../../api/message/deployMove.ts"
import {DeployAction, DeployActionType} from "../../../hooks/useDeployMoveReducer.tsx"

export function onRegionClickDeploy(thisPlayerState: PlayerState, region: Region, deployMove: DeployMove, dispatchDeployMove: (action: DeployAction) => void) {
    if (thisPlayerState.userId === region?.ownerId && deployMove.regionId === null) {
        return () => {
            console.log("Setting region", region.id, region.troops)
            dispatchDeployMove({
                type: DeployActionType.SET_REGION,
                regionId: region.id,
                currentTroops: region.troops,
            })
        }
    }

    return null
}