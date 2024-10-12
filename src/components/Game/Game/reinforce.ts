import { PlayerState } from '../../../api/message/playersState';
import { Region } from '../../../api/message/boardState';
import { ReinforceMove } from '../../../api/message/reinforceMove';
import { ReinforceAction, ReinforceActionType } from '../../../hooks/useReinforceMoveReducer';
import Graph from './Graph';
import { GameState } from '../../../api/message/gameState';

export const onRegionClickReinforce = (
    thisPlayerState: PlayerState,
    region: Region,
    reinforceMove: ReinforceMove,
    dispatchReinforceMove: (action: ReinforceAction) => void,
    graph: Graph
) => {
    if (region.ownerId !== thisPlayerState.userId) {
        return;
    }

    if (!reinforceMove.sourceRegionId) {
        dispatchReinforceMove({ type: ReinforceActionType.SET_SOURCE, regionId: region.id, troops: region.troops });
    } else if (reinforceMove.sourceRegionId !== region.id && graph.canReach(reinforceMove.sourceRegionId, region.id)) {
        dispatchReinforceMove({ type: ReinforceActionType.SET_TARGET, regionId: region.id, troops: region.troops });
    }
};

export const getReinforcePopupProps = (
    doReinforce: (reinforceMove: ReinforceMove, gameState: GameState) => Promise<Response>,
    reinforceMove: ReinforceMove,
    gameState: GameState,
    dispatchReinforceMove: (action: ReinforceAction) => void,
    getSvgPathForRegion: (regionId: string) => string
) => {
    return {
        isOpen: !!reinforceMove.sourceRegionId && !!reinforceMove.targetRegionId,
        sourceRegionId: reinforceMove.sourceRegionId,
        targetRegionId: reinforceMove.targetRegionId,
        sourceRegionSvgPath: reinforceMove.sourceRegionId ? getSvgPathForRegion(reinforceMove.sourceRegionId) : "",
        targetRegionSvgPath: reinforceMove.targetRegionId ? getSvgPathForRegion(reinforceMove.targetRegionId) : "",
        troopsInSource: reinforceMove.troopsInSource,
        troopsInTarget: reinforceMove.troopsInTarget,
        movingTroops: reinforceMove.movingTroops,
        onMovingTroopsChange: (troops: number) => dispatchReinforceMove({ type: ReinforceActionType.SET_MOVING_TROOPS, troops:  troops }),
        onConfirm: () => {
            doReinforce(reinforceMove, gameState);
            dispatchReinforceMove({ type: ReinforceActionType.RESET });
        },
        onCancel: () => dispatchReinforceMove({ type: ReinforceActionType.RESET }),
    };
};
