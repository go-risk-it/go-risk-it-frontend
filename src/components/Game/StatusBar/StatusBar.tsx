import "./StatusBar.css"
import {useGameState} from "../../../hooks/useGameState.ts"
import {DeployPhaseState, PhaseType} from "../../../api/game/message/gameState.ts"
import {ConnectionStatus, PlayerStatus} from "../../../api/game/message/playersState.ts"

const StatusBar = () => {
    const {gameState, phaseState, playersState, thisPlayerState} = useGameState()

    if (!gameState || !phaseState || !playersState || !thisPlayerState) {
        return (
            <div className="status-bar__loading">
                Loading...
            </div>
        )
    }

    const currentTurnPlayer = playersState.players[gameState.turn % playersState.players.length]

    return (
        <div className="status-bar">
            {/* Game Info Box */}
            <div className="status-bar__game-info">
                <div className="status-bar__section status-bar__phase">
                    <div>
                        <span className="status-bar__heading">
                            {gameState.phaseType.toUpperCase()} phase
                        </span>
                        {gameState.phaseType === PhaseType.DEPLOY && (
                            <span className="status-bar__troops">
                                Deployable Troops: {(phaseState as DeployPhaseState).deployableTroops}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Players Box */}
            <div className="status-bar__players-box">
                <h2 className="status-bar__heading">Players</h2>
                <div className="status-bar__players">
                    {playersState.players
                        .sort((a, b) => a.index - b.index)
                        .map(player => {
                            const isCurrentTurn = player.userId === currentTurnPlayer.userId
                            const isDead = player.status !== PlayerStatus.ALIVE
                            const isConnected = player.connectionStatus === ConnectionStatus.CONNECTED
                            const displayName = player.userId === thisPlayerState.userId ? "You" : player.name

                            return (
                                <div
                                    key={player.userId}
                                    className={`
                                        status-bar__player 
                                        ${isCurrentTurn ? "status-bar__player--current" : ""} 
                                        ${isDead ? "status-bar__player--dead" : ""}
                                        ${isCurrentTurn ? `player-${player.index}-border` : ""}
                                    `}
                                >
                                    <div className="status-bar__player-info">
                                        <div className={`status-bar__avatar player-${player.index}-bg`}>
                                            {displayName[0].toUpperCase()}
                                            <div className={`status-bar__connection-dot ${
                                                isConnected ? "status-bar__connection-dot--connected" : "status-bar__connection-dot--disconnected"
                                            }`}/>
                                        </div>
                                        <span>
                                            {displayName}
                                        </span>
                                    </div>
                                    <div className="status-bar__player-info">
                                        <span className="status-bar__badge">
                                            Cards: {player.cardCount}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </div>
        </div>
    )}

export default StatusBar