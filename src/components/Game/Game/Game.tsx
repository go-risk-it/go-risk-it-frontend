import React from "react"
import StatusBar from "../StatusBar/StatusBar.tsx"

import "./Game.css"
import Button from "@mui/material/Button"
import {useAuth} from "../../../hooks/useAuth.tsx"
import world from "../../../assets/risk.json"
import {SVGMap} from "../Map/SVGMap.tsx"
import {useGameState} from "../../../hooks/useGameState.tsx"
import {DeployMove} from "../../../api/message/deployMove.ts"
import {GameState, Phase} from "../../../api/message/gameState.ts"
import {Region} from "../../../api/message/boardState.ts"
import {PlayersState, PlayerState} from "../../../api/message/playersState.ts"

enum DeployActionType {
    SET_REGION = "setRegion",
    SET_TROOPS = "setTroops",
}

interface SetRegionAction {
    type: DeployActionType.SET_REGION
    regionId: string
    currentTroops: number
}

interface SetTroopsAction {
    type: DeployActionType.SET_TROOPS
    desiredTroops: number
}

type DeployAction = SetRegionAction | SetTroopsAction

const onRegionClick = (region: Region, gameState: GameState, thisPlayerState: PlayerState, playersState: PlayersState,
                       deployMove: DeployMove, dispatchDeployMove: (action: DeployAction) => void) => {
    if (gameState.currentTurn % playersState.players.length !== thisPlayerState.index) {
        return null
    }
    switch (gameState.currentPhase) {
        case Phase.DEPLOY: {
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
            break
        }
    }

    return null

}


function deployMoveReducer(deployMove: DeployMove, action: DeployAction) {
    switch (action.type) {
        case DeployActionType.SET_REGION:
            return {...deployMove, regionId: action.regionId, currentTroops: action.currentTroops}
        case DeployActionType.SET_TROOPS:
            return {...deployMove, desiredTroops: action.desiredTroops}
        default:
            throw Error("Unknown action: " + action)
    }
}

const Game: React.FC = () => {
    const {signout, user} = useAuth()

    const [deployMove, dispatchDeployMove] = React.useReducer(deployMoveReducer, {
        regionId: null,
        userId: user?.id || "",
        currentTroops: 0,
        desiredTroops: 0,
    })

    const {boardState, gameState, playersState, thisPlayerState} = useGameState()
    if (!boardState || !playersState || !thisPlayerState || !gameState || !user) {
        return null
    }

    const thisPlayerRegions = new Set<string>(
        boardState.regions
            .filter(region => region.ownerId === thisPlayerState.userId)
            .map(region => region.id),
    )

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
                onRegionClick: onRegionClick(region, gameState, thisPlayerState, playersState, deployMove, dispatchDeployMove),
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
            <h1>Go risk it!</h1>
            <Button onClick={signout}>Sign out</Button>
            <SVGMap {...mapData} className="risk-it-map-container"/>

            {/*<DeployPopup isVisible={} onSetTroops={} onCancel={} onConfirm={} />*/}

            <StatusBar/>
        </div>
    )
}

export default Game