import React from 'react';
import {GameState} from '../../../api/message/gameState.ts';
import {PlayersState} from '../../../api/message/playersState.ts';

import './StatusBar.css';

interface StatusBarProps {
    gameState: GameState;
    playersState: PlayersState;
}

const StatusBar: React.FC<StatusBarProps> = ({gameState, playersState}) => {
    return (
        <div className="status-bar">
            {/* Display Game Status in the first line */}
            <div className="game-status">
                <p>Game ID: {gameState.gameId}, Turn: {gameState.currentTurn}, Phase: {gameState.currentPhase}</p>
            </div>

            {/* Display Player Information for each player */}
            <div className="player-info">
                <h3>Players:</h3>
                {playersState.players.map((player) => (
                    <div key={player.id} className="player">
                        <p>Player ID: {player.id}, Turn: {player.index}, Troops to Deploy: {player.troopsToDeploy}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default StatusBar;