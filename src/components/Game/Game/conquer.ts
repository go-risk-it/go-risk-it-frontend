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
    getSvgPathForRegion: (regionId: string) => string,
): ConquerPopupProps => {
    const troopsInSource = boardState.regions.find(region => region.id === phaseState.attackingRegionId)?.troops || 0;

    const onSetTroops = (troopsToMove: number) => {
        // Only dispatch if the troops have actually changed
        if (troopsToMove !== conquerMove.troops) {
            dispatchConquerMove({
                type: ConquerActionType.SET_TROOPS,
                troops: troopsToMove,
            });
        }
    };

    const onConfirm = () => {
        doConquer(conquerMove, gameState).then(response => {
            console.log("Conquer response: ", response)
        }).catch(error => {
            console.error("Error conquering: ", error)
        });
        dispatchConquerMove({type: ConquerActionType.RESET});
    };

    return {
        isVisible: gameState.phaseType === PhaseType.CONQUER,
        sourceRegion: phaseState.attackingRegionId,
        targetRegion: phaseState.defendingRegionId,
        sourceSvgPath: getSvgPathForRegion(phaseState.attackingRegionId),
        targetSvgPath: getSvgPathForRegion(phaseState.defendingRegionId),
        troopsInSource,
        minTroopsToMove: phaseState.minTroopsToMove,
        onSetTroops,
        onConfirm,
    };
};
