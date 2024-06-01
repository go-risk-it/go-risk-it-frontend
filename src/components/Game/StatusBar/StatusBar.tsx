import {useContext} from 'react';

import './StatusBar.css';
import {GameStateContext} from "../../../providers/GameState.tsx";


const StatusBar = () => {
    const {gameState, playersState, thisPlayerState} = useContext(GameStateContext);
    return (
        <div className="status-bar">
            {/* Display Game Status in the first line */}
            <div className="game-status">
                {// if gameState is not null, display the current game state
                    gameState ?
                        <p>Game ID: {gameState.gameId}, Turn: {gameState.currentTurn},
                            Phase: {gameState.currentPhase}</p> :
                        <p>Game Status: Loading...</p>
                }
            </div>

            {/* Display Player Information for each player */}
            <div className="player-info">
                {
                    playersState ?
                        <div>
                            <h3>Players:</h3>
                            {playersState.players.map((player) => (
                                <div key={player.userId} className="player">
                                    <p>
                                        {thisPlayerState?.userId === player.userId ? <b>You: </b> : null}
                                        Player ID: {player.userId}, Name: {player.name}, Turn: {player.index},
                                        Troops to Deploy: {player.troopsToDeploy}
                                    </p>
                                </div>
                            ))}
                        </div>
                        :
                        <h3>Players: Loading...</h3>
                }
            </div>
        </div>
    );
};


export default StatusBar;