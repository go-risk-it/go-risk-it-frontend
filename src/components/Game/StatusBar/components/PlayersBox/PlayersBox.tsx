import "./PlayersBox.css";
import PlayerItem from "./PlayerItem/PlayerItem";
import {PlayerState} from "../../../../../api/game/message/playersState.ts";

interface PlayersBoxProps {
    players: PlayerState[];
    currentTurnPlayer: PlayerState;
    thisPlayerState: PlayerState;
}

const PlayersBox = ({players, currentTurnPlayer, thisPlayerState}: PlayersBoxProps) => {
    return (
        <div className="players-box">
            <h2 className="players-box__heading">Players</h2>
            <div className="players-box__list">
                {players
                    .sort((a, b) => a.index - b.index)
                    .map(player => (
                        <PlayerItem
                            key={player.userId}
                            player={player}
                            isCurrentTurn={player.userId === currentTurnPlayer.userId}
                            thisPlayerState={thisPlayerState}
                        />
                    ))}
            </div>
        </div>
    );
};

export default PlayersBox;
