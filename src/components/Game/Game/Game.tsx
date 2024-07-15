import React from "react"
import StatusBar from "../StatusBar/StatusBar.tsx"

import "./Game.css"
import Button from "@mui/material/Button"
import {useAuth} from "../../../hooks/useAuth.tsx"
import world from "../../../assets/risk.json"
import {SVGMap} from "../Map/SVGMap.tsx"
import {useGameState} from "../../../hooks/useGameState.tsx"
import {DeployMove} from "../../../api/message/deployMove.ts"
import {DeployPhaseState, GameState, PhaseType} from "../../../api/message/gameState.ts"
import {Region} from "../../../api/message/boardState.ts"
import {PlayersState, PlayerState} from "../../../api/message/playersState.ts"
import {DeployAction, DeployActionType, useDeployMoveReducer} from "../../../hooks/useDeployMoveReducer.tsx"
import {onRegionClickDeploy} from "./deploy.ts"
import DeployPopup, {DeployPopupProps} from "../Popup/DeployPopup.tsx"
import {Session} from "@supabase/supabase-js"
import {AttackAction, AttackActionType, useAttackMoveReducer} from "../../../hooks/useAttackMoveReducer.tsx"
import {AttackMove} from "../../../api/message/attackMove.ts"
import {onRegionClickAttack} from "./attack.ts"
import AttackPopup from "../Popup/AttackPopup.tsx"


const onRegionClick = (region: Region, gameState: GameState, thisPlayerState: PlayerState, playersState: PlayersState,
                       deployMove: DeployMove, dispatchDeployMove: (action: DeployAction) => void,
                       attackMove: AttackMove, dispatchAttackMove: (action: AttackAction) => void,
) => {
    if (gameState.turn % playersState.players.length !== thisPlayerState.index) {
        return null
    }
    switch (gameState.phaseType) {
        case PhaseType.DEPLOY:
            return onRegionClickDeploy(thisPlayerState, region, deployMove, dispatchDeployMove)
        case PhaseType.ATTACK:
            return onRegionClickAttack(thisPlayerState, region, attackMove, dispatchAttackMove)
    }

    return null
}

const getDeployPopupProps = (
    session: Session,
    gameState: GameState,
    phaseState: DeployPhaseState,
    deployMove: DeployMove,
    dispatchDeployMove: (action: DeployAction) => void,
): DeployPopupProps => {
    return {
        isVisible: gameState.phaseType === PhaseType.DEPLOY && deployMove.regionId !== null,
        region: deployMove.regionId || "",
        currentTroops: deployMove.currentTroops,
        deployableTroops: phaseState.deployableTroops,
        onSetTroops: (desiredTroops: number) => dispatchDeployMove({type: DeployActionType.SET_TROOPS, desiredTroops}),
        onCancel: () => dispatchDeployMove({type: DeployActionType.SET_REGION, regionId: null, currentTroops: 0}),
        onConfirm: () => {
            console.log("Deploying", deployMove)
            const body = JSON.stringify({
                regionId: deployMove.regionId,
                currentTroops: deployMove.currentTroops,
                desiredTroops: deployMove.desiredTroops,
            })
            console.log("Body: ", body)
            fetch("http://localhost:8000/api/v1/games/1/moves/deployments", {
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

const getAttackPopupProps = (
    session: Session,
    gameState: GameState,
    attackMove: AttackMove,
    dispatchAttackMove: (action: AttackAction) => void,
) => {
    return {
        isVisible: gameState.phaseType === PhaseType.ATTACK && attackMove.sourceRegionId !== null && attackMove.targetRegionId !== null,
        sourceRegion: attackMove.sourceRegionId || "",
        targetRegion: attackMove.targetRegionId || "",
        troopsInSource: attackMove.troopsInSource,
        onSetTroops: (attackingTroops: number) => dispatchAttackMove({
            type: AttackActionType.SET_TROOPS,
            attackingTroops,
        }),
        onCancel: () => {
            dispatchAttackMove({
                type: AttackActionType.SET_SOURCE_REGION,
                regionId: null,
                currentTroops: 0,
            })
            dispatchAttackMove({
                type: AttackActionType.SET_TARGET_REGION,
                regionId: null,
                currentTroops: 0,
            })
        },
        onConfirm: () => {
            console.log("Attacking", attackMove)
            const body = JSON.stringify({
                sourceRegionId: attackMove.sourceRegionId,
                targetRegionId: attackMove.targetRegionId,
                troopsInSource: attackMove.troopsInSource,
                troopsInTarget: attackMove.troopsInTarget,
                attackingTroops: attackMove.attackingTroops,
            })
            console.log("Body: ", body)
            fetch("http://localhost:8000/api/v1/games/1/moves/attacks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: body,
            }).then(response => {
                console.log("Attack response: ", response)
            }).catch(error => {
                console.error("Error attacking: ", error)
            })
            dispatchAttackMove({type: AttackActionType.SET_SOURCE_REGION, regionId: null, currentTroops: 0})
            dispatchAttackMove({type: AttackActionType.SET_TARGET_REGION, regionId: null, currentTroops: 0})
        },
    }
}


const Game: React.FC = () => {
    const {session, signout, user} = useAuth()


    const {deployMove, dispatchDeployMove} = useDeployMoveReducer()
    const {attackMove, dispatchAttackMove} = useAttackMoveReducer()


    const {boardState, gameState, phaseState, playersState, thisPlayerState} = useGameState()
    if (!session || !boardState || !playersState || !thisPlayerState || !gameState || !user || !phaseState) {
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
                onRegionClick: onRegionClick(region, gameState, thisPlayerState, playersState,
                    deployMove, dispatchDeployMove,
                    attackMove, dispatchAttackMove,
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
            <h1>Go risk it!</h1>
            <Button onClick={signout}>Sign out</Button>
            <SVGMap {...mapData} className="risk-it-map-container"/>

            { /* show deploy popup only if phase is deploy*/
                gameState.phaseType === PhaseType.DEPLOY &&
                <DeployPopup {...getDeployPopupProps(
                    session, gameState, phaseState as DeployPhaseState, deployMove, dispatchDeployMove)}/>
            }

            {
                gameState.phaseType === PhaseType.ATTACK &&
                <AttackPopup {...getAttackPopupProps(
                    session, gameState, attackMove, dispatchAttackMove)}/>
            }

            <StatusBar/>
        </div>
    )
}

export default Game