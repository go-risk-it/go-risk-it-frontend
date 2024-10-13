import React, { useState } from "react"

import "./Game.css"
import Button from "@mui/material/Button"
import {useAuth} from "../../../hooks/useAuth.tsx"
import world from "../../../assets/risk.json"
import {SVGMap} from "../Map/SVGMap.tsx"
import {useGameState} from "../../../hooks/useGameState.tsx"
import {DeployMove} from "../../../api/message/deployMove.ts"
import {ConquerPhaseState, DeployPhaseState, GameState, PhaseType} from "../../../api/message/gameState.ts"
import {Region} from "../../../api/message/boardState.ts"
import {PlayersState, PlayerState} from "../../../api/message/playersState.ts"
import {DeployAction, useDeployMoveReducer} from "../../../hooks/useDeployMoveReducer.tsx"
import {getDeployPopupProps, onRegionClickDeploy} from "./deploy.ts"
import DeployPopup from "../Popup/DeployPopup.tsx"
import {AttackAction, useAttackMoveReducer} from "../../../hooks/useAttackMoveReducer.tsx"
import {AttackMove} from "../../../api/message/attackMove.ts"
import {getAttackPopupProps, onRegionClickAttack} from "./attack.ts"
import AttackPopup from "../Popup/AttackPopup.tsx"
import {useServerQuerier} from "../../../hooks/useServerQuerier.tsx"
import Graph from "./Graph.ts"
import ConquerPopup from "../Popup/ConquerPopup.tsx"
import {useConquerMoveReducer} from "../../../hooks/useConquerMoveReducer.tsx"
import {ReinforceAction, useReinforceMoveReducer} from "../../../hooks/useReinforceMoveReducer.tsx"
import {ReinforceMove} from "../../../api/message/reinforceMove.ts"
import {getReinforcePopupProps, onRegionClickReinforce} from "./reinforce.ts"
import ReinforcePopup from "../Popup/ReinforcePopup.tsx"
import { getConquerPopupProps } from "./conquer.ts"
import { AdvanceMove } from "../../../api/message/advanceMove.ts"


const onRegionClick = (region: Region, gameState: GameState, thisPlayerState: PlayerState, playersState: PlayersState,
                       deployMove: DeployMove, dispatchDeployMove: (action: DeployAction) => void,
                       attackMove: AttackMove, dispatchAttackMove: (action: AttackAction) => void,
                       reinforceMove: ReinforceMove, dispatchReinforceMove: (action: ReinforceAction) => void,
                       graph: Graph,
): (() => void) | null => {
    if (gameState.turn % playersState.players.length !== thisPlayerState.index) {
        return null;
    }
    switch (gameState.phaseType) {
        case PhaseType.DEPLOY:
            return onRegionClickDeploy(thisPlayerState, region, deployMove, dispatchDeployMove);
        case PhaseType.ATTACK:
            return onRegionClickAttack(thisPlayerState, region, attackMove, dispatchAttackMove, graph);
        case PhaseType.REINFORCE:
            return onRegionClickReinforce(thisPlayerState, region, reinforceMove, dispatchReinforceMove, graph);
        default:
            return null;
    }
}

const Game: React.FC = () => {
    const {signout} = useAuth()

    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const {deployMove, dispatchDeployMove} = useDeployMoveReducer()
    const {attackMove, dispatchAttackMove} = useAttackMoveReducer()
    const {conquerMove, dispatchConquerMove} = useConquerMoveReducer()
    const {reinforceMove, dispatchReinforceMove} = useReinforceMoveReducer()
    const {doDeploy, doAttack, doConquer, doReinforce, doAdvance} = useServerQuerier()


    const {boardState, gameState, phaseState, playersState, thisPlayerState} = useGameState()
    if (!boardState || !playersState || !thisPlayerState || !gameState || !phaseState) {
        return null
    }

    const thisPlayerRegions = new Set<string>(
        boardState.regions
            .filter(region => region.ownerId === thisPlayerState.userId)
            .map(region => region.id),
    )

    const graph = new Graph(world.links, boardState)

    // add info to world.layers, i.e., the number of troops and the owner of each region
    const mapData = {
        ...world,
        layers: world.layers.map(layer => {
            const region = boardState.regions.find(boardRegion => boardRegion.id === layer.id)
            if (!region) {
                throw Error(`Region with id ${layer.id} not found`)
            }
            const owner = playersState.players.find(player => player.userId === region.ownerId)
            if (!owner) {
                throw Error(`Owner with id ${region.ownerId} not found for region ${region.id} in ${playersState.players}`)
            }

            return {
                ...layer,
                onRegionClick: onRegionClick(region, gameState, thisPlayerState, playersState,
                    deployMove, dispatchDeployMove,
                    attackMove, dispatchAttackMove,
                    reinforceMove, dispatchReinforceMove,
                    graph,
                ),
                troops: region.troops,
                ownerIndex: owner.index,
            }
        }),
    }


    // sort regions layers: put the ones owned by this player last,
    // so they are rendered on top of other regions and animations are visible
    mapData.layers.sort((a, b) => {
        if (thisPlayerRegions.has(a.id)) {
            return 1
        }
        if (thisPlayerRegions.has(b.id)) {
            return -1
        }
        return 0
    })

    const getSvgPathForRegion = (regionId: string) => {
        const layer = world.layers.find(l => l.id === regionId);
        if (layer) {
            return layer.d;
        }
        console.warn(`No SVG path found for region ${regionId}`); // Add this warning
        return '';
    };

    const handlePopupOpen = () => setIsPopupOpen(true);
    const handlePopupClose = () => setIsPopupOpen(false);
    const handleAdvance = () => {
        const advanceMove: AdvanceMove = {
            currentPhase: gameState.phaseType,
        }
        doAdvance(advanceMove, gameState);
    };

    return (
        <div>
            {/*<h1>Go risk it!</h1>*/}
            <Button onClick={signout}>Sign out</Button>
            <SVGMap {...mapData} className="risk-it-map-container"/>

            {
                gameState.phaseType === PhaseType.DEPLOY && (
                    <DeployPopup
                        props={getDeployPopupProps(
                            doDeploy, gameState, phaseState as DeployPhaseState, deployMove, dispatchDeployMove, getSvgPathForRegion
                        )}
                        onOpen={handlePopupOpen}
                        onClose={handlePopupClose}
                    />
                )
            }

            {
                gameState.phaseType === PhaseType.ATTACK && (
                    <AttackPopup
                        props={getAttackPopupProps(
                            doAttack, gameState, attackMove, dispatchAttackMove, getSvgPathForRegion
                        )}
                        onOpen={handlePopupOpen}
                        onClose={handlePopupClose}
                    />
                )
            }

            {
                gameState.phaseType === PhaseType.CONQUER && (
                    <ConquerPopup
                        props={getConquerPopupProps(
                            doConquer, gameState, phaseState as ConquerPhaseState, boardState, conquerMove, dispatchConquerMove, getSvgPathForRegion
                        )}
                        onOpen={handlePopupOpen}
                        onClose={handlePopupClose}
                    />
                )
            }

            {
                gameState.phaseType === PhaseType.REINFORCE && (
                    <ReinforcePopup
                        props={getReinforcePopupProps(
                            doReinforce, reinforceMove, gameState, dispatchReinforceMove, getSvgPathForRegion
                        )}
                        onOpen={handlePopupOpen}
                        onClose={handlePopupClose}
                    />
                )
            }

            {(gameState.phaseType === PhaseType.ATTACK || gameState.phaseType === PhaseType.REINFORCE || gameState.phaseType === PhaseType.CARDS) && !isPopupOpen && (
                <Button onClick={handleAdvance}>Advance</Button>
            )}
        </div>
    )
}

export default Game
