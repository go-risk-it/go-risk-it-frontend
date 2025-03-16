import "./PlayerItem.css";
import {ConnectionStatus, PlayerState, PlayerStatus} from "../../../../../../api/game/message/playersState.ts";

interface PlayerItemProps {
    player: PlayerState;
    thisPlayerState: PlayerState;
    isCurrentTurn: boolean;
}

const PlayerItem = ({player, thisPlayerState, isCurrentTurn}: PlayerItemProps) => {
    const isDead = player.status !== PlayerStatus.ALIVE;
    const isConnected = player.connectionStatus === ConnectionStatus.CONNECTED;
    const displayName = player.userId === thisPlayerState.userId ? "You" : player.name;

    return (
        <div
            className={`
        player-item
        ${isCurrentTurn ? "player-item--current" : ""} 
        ${isDead ? "player-item--dead" : ""}
        ${isCurrentTurn ? `player-${player.index}-border` : ""}
      `}
        >
            <div className="player-item__info">
                <div className={`player-item__avatar player-${player.index}-bg`}>
                    {displayName[0].toUpperCase()}
                    <div className={`player-item__connection-dot ${
                        isConnected ? "player-item__connection-dot--connected" : "player-item__connection-dot--disconnected"
                    }`}/>
                </div>
                <span>
          {displayName}
        </span>
            </div>
            <div className="player-item__info">
        <span className="player-item__badge">
          Cards: {player.cardCount}
        </span>
            </div>
        </div>
    );
};

export default PlayerItem;
