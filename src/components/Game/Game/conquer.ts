import {BoardState} from "../../../api/message/boardState.ts"
import {ConquerMove} from "../../../api/message/conquerMove.ts"
import {ConquerPhaseState, GameState, PhaseType} from "../../../api/message/gameState.ts"
import {ConquerAction, ConquerActionType} from "../../../hooks/useConquerMoveReducer.tsx"
import {ConquerPopupProps} from "../Popup/ConquerPopup.tsx"
import {PlayersState} from "../../../api/message/playersState.ts"


export const getConquerPopupProps = (
    doConquer: (conquerMove: ConquerMove, gameState: GameState) => Promise<Response>,
    gameState: GameState,
    phaseState: ConquerPhaseState,
    boardState: BoardState,
    conquerMove: ConquerMove,
    dispatchConquerMove: (action: ConquerAction) => void,
    getSvgPathForRegion: (regionId: string) => string,
    playersState: PlayersState
): ConquerPopupProps => {
    const sourceRegion = boardState.regions.find(r => r.id === phaseState.attackingRegionId);
    const targetRegion = boardState.regions.find(r => r.id === phaseState.defendingRegionId);
    const sourceOwner = playersState.players.find(p => p.userId === sourceRegion?.ownerId);
    const targetOwner = playersState.players.find(p => p.userId === targetRegion?.ownerId);

    const troopsInSource = sourceRegion?.troops || 0;

    const onSetTroops = (troopsToMove: number) => {
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
        sourceOwnerIndex: sourceOwner?.index ?? 0,
        targetOwnerIndex: targetOwner?.index ?? 0,
    };
};
