import {PlayerState} from "../../../api/message/playersState.ts"
import React, {useState} from "react"
import {DeployAction} from "../../../api/message/deployAction.ts"
import {GameState, Phase} from "../../../api/message/gameState.ts"

import './DeployPopup.css'
import {useAuth} from "../../../hooks/useAuth.tsx"
import {BoardState} from "../../../api/message/boardState.ts";

interface DeployPopupProps {
    deployAction: DeployAction
    setDeployAction: (action: DeployAction) => void
    gameState: GameState
    playerState: PlayerState
    boardState: BoardState
}

function shouldShow(gameState: GameState, playerState: PlayerState, deployAction: DeployAction) {
    return gameState.currentPhase === Phase.DEPLOY &&
        gameState.currentTurn === playerState.index &&
        deployAction.regionId !== null
}

const DeployPopup: React.FC<DeployPopupProps> = ({
                                                     deployAction,
                                                     setDeployAction,
                                                     gameState,
                                                     playerState,
                                                     boardState
                                                 }) => {
    const {session} = useAuth()
    const [troops, setTroops] = useState<number>(playerState?.troopsToDeploy)

    if (deployAction.regionId === null) {
        return null
    }

    if (!session) {
        throw new Error("User is not authenticated")
    }
    const region = boardState.regions.find(region => region.id === deployAction.regionId)
    if (!region) {
        throw new Error(`Region with id ${deployAction.regionId} not found. Deploy action: ${JSON.stringify(deployAction)}`)
    }
    const currentTroops = region.troops
    return (
        <div
            className={`risk-it-troop-deployment-popup ${shouldShow(gameState, playerState, deployAction) ? 'visible' : ''}`}>
            <h3>Deploy Troops on region {deployAction.regionId}</h3>
            <p>Player name: {playerState.name}, Turn: {playerState.index}, Troops to
                Deploy: {playerState.troopsToDeploy}</p>
            <input type="number" value={playerState.troopsToDeploy}
                   onChange={e => setTroops(parseInt(e.target.value))}/>
            <button onClick={() => {
                setDeployAction({regionId: null, userId: playerState.userId, currentTroops: 0, desiredTroops: 0})
            }}>Cancel
            </button>
            <button onClick={() => {
                const body = JSON.stringify({
                    regionId: deployAction.regionId,
                    userId: playerState.userId,
                    currentTroops: currentTroops,
                    desiredTroops: currentTroops + troops
                })
                console.log("Body: ", body)
                fetch('http://localhost:8000/api/v1/game/1/move/deploy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: body,
                })
                setDeployAction({regionId: null, userId: playerState.userId, currentTroops: 0, desiredTroops: 0})
            }
            }>Deploy
            </button>
        </div>
    )
}

export default DeployPopup