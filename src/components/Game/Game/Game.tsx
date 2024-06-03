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
import {DeployAction, DeployActionType, useDeployMoveReducer} from "../../../hooks/useDeployMoveReducer.tsx"
import {onRegionClickDeploy} from "./deploy.ts"
import DeployPopup, {DeployPopupProps} from "../DeployPopup/DeployPopup.tsx"
import {Session} from "@supabase/supabase-js"


const onRegionClick = (region: Region, gameState: GameState, thisPlayerState: PlayerState, playersState: PlayersState,
                       deployMove: DeployMove, dispatchDeployMove: (action: DeployAction) => void) => {
    if (gameState.currentTurn % playersState.players.length !== thisPlayerState.index) {
        return null
    }
    switch (gameState.currentPhase) {
        case Phase.DEPLOY:
            return onRegionClickDeploy(thisPlayerState, region, deployMove, dispatchDeployMove)
    }

    return null
}

const getDeployPopupProps = (
    session: Session,
    gameState: GameState,
    thisPlayerState: PlayerState,
    deployMove: DeployMove,
    dispatchDeployMove: (action: DeployAction) => void,
): DeployPopupProps => {
    return {
        isVisible: gameState.currentPhase === Phase.DEPLOY && deployMove.regionId !== null,
        region: deployMove.regionId || "",
        currentTroops: deployMove.currentTroops,
        troopsToDeploy: thisPlayerState.troopsToDeploy,
        onSetTroops: (desiredTroops: number) => dispatchDeployMove({type: DeployActionType.SET_TROOPS, desiredTroops}),
        onCancel: () => dispatchDeployMove({type: DeployActionType.SET_REGION, regionId: null, currentTroops: 0}),
        onConfirm: () => {
            console.log("Deploying", deployMove)
            const body = JSON.stringify({
                regionId: deployMove.regionId,
                userId: thisPlayerState.userId,
                currentTroops: deployMove.currentTroops,
                desiredTroops: deployMove.desiredTroops,
            })
            console.log("Body: ", body)
            fetch("http://localhost:8000/api/v1/game/1/move/deploy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: body,
            }).then(response => {
                console.log("Deploy response: ", response)
            }).catch(error => {
                console.error("Error deploying: ", error)
            })
            dispatchDeployMove({type: DeployActionType.SET_REGION, regionId: null, currentTroops: 0})
        },
    }
}


const Game: React.FC = () => {
    const {session, signout, user} = useAuth()


    const {deployMove, dispatchDeployMove} = useDeployMoveReducer()


    const {boardState, gameState, playersState, thisPlayerState} = useGameState()
    if (!session || !boardState || !playersState || !thisPlayerState || !gameState || !user) {
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

            <DeployPopup {...getDeployPopupProps(session, gameState, thisPlayerState, deployMove, dispatchDeployMove)}/>

            <StatusBar/>
        </div>
    )
}

export default Game