import "./StatusBar.css"
import {useGameState} from "../../../hooks/useGameState.ts"
import GameInfoBox from "./components/GameInfoBox/GameInfoBox"
import MissionBox from "./components/MissionBox/MissionBox"
import PlayersBox from "./components/PlayersBox/PlayersBox"
import MoveLogBox from "./components/MoveLogBox/MoveLogBox.tsx";

const StatusBar = () => {
    const {gameState, phaseState, playersState, thisPlayerState, missionState, moveHistory} = useGameState()

    if (!gameState || !phaseState || !playersState || !thisPlayerState || !missionState || !moveHistory) {
        return (
            <div className="status-bar__loading">
                Loading...
            </div>
        )
    }

    const currentTurnPlayer = playersState.players[gameState.turn % playersState.players.length]

    return (
        <div className="status-bar">
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

            <MoveLogBox
                moveHistory={moveHistory}
                playersState={playersState}
                maxMoves={10}
                />

        </div>
    )
}

export default StatusBar