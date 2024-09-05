import React from "react"

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
import {getConquerPopupProps} from "./conquer.ts"
import {useConquerMoveReducer} from "../../../hooks/useConquerMoveReducer.tsx"


const onRegionClick = (region: Region, gameState: GameState, thisPlayerState: PlayerState, playersState: PlayersState,
                       deployMove: DeployMove, dispatchDeployMove: (action: DeployAction) => void,
                       attackMove: AttackMove, dispatchAttackMove: (action: AttackAction) => void,
                       graph: Graph,
) => {
    if (gameState.turn % playersState.players.length !== thisPlayerState.index) {
        return null
    }
    switch (gameState.phaseType) {
        case PhaseType.DEPLOY:
            return onRegionClickDeploy(thisPlayerState, region, deployMove, dispatchDeployMove)
        case PhaseType.ATTACK:
            return onRegionClickAttack(thisPlayerState, region, attackMove, dispatchAttackMove, graph)
    }

    return null
}


const Game: React.FC = () => {
    const {signout} = useAuth()


    const {deployMove, dispatchDeployMove} = useDeployMoveReducer()
    const {attackMove, dispatchAttackMove} = useAttackMoveReducer()
    const {conquerMove, dispatchConquerMove} = useConquerMoveReducer()
    const {doDeploy, doAttack, doConquer} = useServerQuerier()


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

    return (
        <div>
            {/*<h1>Go risk it!</h1>*/}
            <Button onClick={signout}>Sign out</Button>
            <SVGMap {...mapData} className="risk-it-map-container"/>

            {
                gameState.phaseType === PhaseType.DEPLOY &&
                <DeployPopup {...getDeployPopupProps(
                    doDeploy, gameState, phaseState as DeployPhaseState, deployMove, dispatchDeployMove)}/>
            }

            {
                gameState.phaseType === PhaseType.ATTACK &&
                <AttackPopup {...getAttackPopupProps(
                    doAttack, gameState, attackMove, dispatchAttackMove)}/>
            }

            {
                gameState.phaseType === PhaseType.CONQUER &&
                <ConquerPopup {...getConquerPopupProps(
                    doConquer, gameState, phaseState as ConquerPhaseState, boardState, conquerMove, dispatchConquerMove)
                }/>
            }

            {/*<StatusBar/>*/}
        </div>
    )
}

export default Game