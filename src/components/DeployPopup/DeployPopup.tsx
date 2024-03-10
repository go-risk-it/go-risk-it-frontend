import {PlayerState} from "../../api/message/playersState.ts";
import React from "react";
import {DeployAction} from "../../api/message/deployAction.ts";
import {GameState, Phase} from "../../api/message/gameState.ts";

import './DeployPopup.css'

interface DeployPopupProps {
    deployAction: DeployAction;
    setDeployAction: (action: DeployAction) => void;
    gameState: GameState;
    playerState: PlayerState;
}

function shouldShow(gameState: GameState, playerState: PlayerState, deployAction: DeployAction) {
    return gameState.currentPhase === Phase.DEPLOY &&
        gameState.currentTurn === playerState.index &&
        deployAction.regionId !== null
}

const DeployPopup: React.FC<DeployPopupProps> = ({deployAction, setDeployAction, gameState, playerState}) => {
    if (playerState === undefined) {
        return null
    }
    return (
        <div
            className={`risk-it-troop-deployment-popup ${shouldShow(gameState, playerState, deployAction) ? 'visible' : ''}`}>
            <h3>Deploy Troops on region {deployAction.regionId}</h3>
            <p>Player ID: {playerState.id}, Turn: {playerState.index}, Troops to
                Deploy: {playerState.troopsToDeploy}</p>
            <input type="number" value={playerState.troopsToDeploy}
                   onChange={e => deployAction.troops = parseInt(e.target.value)}/>
            <button onClick={() => {
                setDeployAction({regionId: null, troops: 0})
            }}>Cancel
            </button>
            <button onClick={() => {
                fetch('http://localhost:8080/deploy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(deployAction),
                })
                setDeployAction({regionId: null, troops: 0})
            }
            }>Deploy
            </button>
        </div>
    );
}

export default DeployPopup;