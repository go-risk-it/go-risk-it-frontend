import "./StatusBar.css"
import {useGameState} from "../../../hooks/useGameState.ts"
import GameInfoBox from "./components/GameInfoBox/GameInfoBox"
import MissionBox from "./components/MissionBox/MissionBox"
import PlayersBox from "./components/PlayersBox/PlayersBox"

const StatusBar = () => {
    const {gameState, phaseState, playersState, thisPlayerState, missionState} = useGameState()

    if (!gameState || !phaseState || !playersState || !thisPlayerState || !missionState) {
        return (
            <div className="status-bar__loading">
                Loading...
            </div>
        )
    }

    const currentTurnPlayer = playersState.players[gameState.turn % playersState.players.length]

    return (
        <div className="status-bar">
            <GameInfoBox
                phaseType={gameState.phaseType}
                phaseState={phaseState}
            />

            <MissionBox
                missionState={missionState}
                playersState={playersState}
                thisPlayerState={thisPlayerState}
            />

            <PlayersBox
                players={playersState.players}
                currentTurnPlayer={currentTurnPlayer}
                thisPlayerState={thisPlayerState}
            />
        </div>
    )
}

export default StatusBar