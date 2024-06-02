import {PlayerState} from "../../../api/message/playersState.ts"
import React, {useState} from "react"
import {DeployMove} from "../../../api/message/deployMove.ts"
import {GameState, Phase} from "../../../api/message/gameState.ts"

import "./DeployPopup.css"
import {useAuth} from "../../../hooks/useAuth.tsx"
import {useGameState} from "../../../hooks/useGameState.tsx"

interface DeployPopupProps {
    deployAction: DeployMove
    setDeployAction: (action: DeployMove) => void
}

function shouldShow(gameState: GameState, thisPlayerState: PlayerState, deployAction: DeployMove) {
    return gameState.currentPhase === Phase.DEPLOY &&
        gameState.currentTurn === thisPlayerState.index &&
        deployAction.regionId !== null
}

const DeployPopup: React.FC<DeployPopupProps> = ({
                                                     deployAction,
                                                     setDeployAction,
                                                 }) => {
    const {session} = useAuth()
    const {gameState, thisPlayerState, boardState} = useGameState()

    const [troops, setTroops] = useState<number>(thisPlayerState?.troopsToDeploy || 0)

    if (!boardState || !thisPlayerState || !gameState) {
        return null
    }

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
            className={`risk-it-troop-deployment-popup ${shouldShow(gameState, thisPlayerState, deployAction) ? "visible" : ""}`}>
            <h3>Deploy Troops on region {deployAction.regionId}</h3>
            <p>Player name: {thisPlayerState.name}, Turn: {thisPlayerState.index}, Troops to
                Deploy: {thisPlayerState.troopsToDeploy}</p>
            <input type="number" value={thisPlayerState.troopsToDeploy}
                   onChange={e => setTroops(parseInt(e.target.value))}/>
            <button onClick={() => {
                setDeployAction({regionId: null, userId: thisPlayerState.userId, currentTroops: 0, desiredTroops: 0})
            }}>Cancel
            </button>
            <button onClick={() => {
                const body = JSON.stringify({
                    regionId: deployAction.regionId,
                    userId: thisPlayerState.userId,
                    currentTroops: currentTroops,
                    desiredTroops: currentTroops + troops,
                })
                console.log("Body: ", body)
                fetch("http://localhost:8000/api/v1/game/1/move/deploy", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session.access_token}`,
                    },
                    body: body,
                })
                setDeployAction({regionId: null, userId: thisPlayerState.userId, currentTroops: 0, desiredTroops: 0})
            }
            }>Deploy
            </button>
        </div>
    )
}

export default DeployPopup