import "./StatusBar.css"
import {useGameState} from "../../../hooks/useGameState.ts"
import {DeployPhaseState, PhaseType} from "../../../api/message/gameState.ts"
import {useAttackMoveReducer} from "../../../hooks/useAttackMoveReducer.ts"


const StatusBar = () => {
    const {gameState, phaseState, playersState, thisPlayerState} = useGameState()
    const {attackMove} = useAttackMoveReducer()
    if (!gameState || !phaseState || !playersState || !thisPlayerState) {
        return <div>Loading...</div>
    }
    return (
        <div className="status-bar">
            {/* Display Game Status in the first line */}
            <div className="game-status">
                <p>Game ID: {gameState.id}, Turn: {gameState.turn} </p>
                <p>{attackMove.sourceRegionId}</p>
            </div>

            <div className="phase-status">
                <h3>Phase State: {gameState.phaseType}</h3>
                {(() => {
                    switch (gameState.phaseType) {
                        case PhaseType.DEPLOY:
                            return (
                                <p>Deployable Troops: {(phaseState as DeployPhaseState).deployableTroops}</p>
                            )
                        case PhaseType.ATTACK:
                            return (
                                <>
                                    <p>TODO: show move status</p>
                                </>
                            )
                        // Add more cases here for additional phase types.
                        default:
                            return null
                    }
                })()}

                {/* Display Player Information for each player */}
                <div className="player-info">
                    <h3>Players:</h3>
                    {playersState.players.map((player) => (
                        <div key={player.userId} className="player">
                            <p>
                                {thisPlayerState?.userId === player.userId ? <b>You: </b> : null}
                                Player ID: {player.userId}, Name: {player.name}, Turn: {player.index},
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


export default StatusBar