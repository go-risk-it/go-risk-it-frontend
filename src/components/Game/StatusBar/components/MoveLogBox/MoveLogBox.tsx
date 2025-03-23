import "./MoveLogBox.css";
import {PlayersState} from "../../../../../api/game/message/playersState.ts";
import {
    AttackMove,
    AttackResult,
    CardsResult,
    ConquerMove,
    DeployMove,
    MoveHistory,
    MovePerformed,
    PhaseType,
    ReinforceMove
} from "../../../../../api/game/message/moveLog.ts";

interface MoveLogBoxProps {
    moveHistory: MoveHistory;
    playersState: PlayersState;
    maxMoves: number;
}

const MoveLogBox = ({moveHistory, playersState, maxMoves}: MoveLogBoxProps) => {
    console.log("MoveLogBox props:", moveHistory, playersState, maxMoves);
    // Function to get a human-readable description of a move
    const getMoveDescription = (move: MovePerformed): string => {
        const player = playersState.players.find(p => p.userId === move.userId);
        const playerName = player ? player.name : "Unknown player";

        try {
            switch (move.phase) {
                case PhaseType.DEPLOY: {
                    const deployMove = move.move as DeployMove;
                    const troopsAdded = deployMove.desiredTroops - deployMove.currentTroops;
                    return `${playerName} deployed ${troopsAdded} troops to ${formatRegionId(deployMove.regionId)}.`;
                }

                case PhaseType.ATTACK: {
                    const attackMove = move.move as AttackMove;
                    if (move.result && Object.keys(move.result).length > 0) {
                        const result = move.result as AttackResult;
                        return `${playerName} successfully attacked ${formatRegionId(attackMove.defendingRegionId)} from ${formatRegionId(attackMove.attackingRegionId)} with ${attackMove.attackingTroops} troops, conquering it with ${result.conqueringTroops} troops.`;
                    } else {
                        return `${playerName} attacked ${formatRegionId(attackMove.defendingRegionId)} from ${formatRegionId(attackMove.attackingRegionId)} with ${attackMove.attackingTroops} troops.`;
                    }
                }

                case PhaseType.CONQUER: {
                    const conquerMove = move.move as ConquerMove;
                    return `${playerName} moved ${conquerMove.troops} troops into conquered territory.`;
                }

                case PhaseType.REINFORCE: {
                    const reinforceMove = move.move as ReinforceMove;
                    return `${playerName} moved ${reinforceMove.movingTroops} troops from ${formatRegionId(reinforceMove.sourceRegionId)} to ${formatRegionId(reinforceMove.targetRegionId)}.`;
                }

                case PhaseType.CARDS: {
                    const cardsResult = move.result as CardsResult;
                    return `${playerName} traded cards for ${cardsResult.extraDeployableTroops} additional troops.`;
                }

                default:
                    return `${playerName} performed a ${move.phase} move.`;
            }
        } catch (error) {
            console.error("Error parsing move:", error, move);
            return `${playerName} performed a ${move.phase} move.`;
        }
    };
    // Format region IDs to be more readable (e.g., "eastern_united_states" -> "Eastern United States")
    const formatRegionId = (regionId: string): string => {
        return regionId
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Get the latest moves, limited by maxMoves
    const latestMoves = [...moveHistory.moves]
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
        .slice(0, maxMoves);

    return (
        <div className="move-log-box">
            <div className="move-log-box__header">
                <h3>Recent Moves</h3>
            </div>
            <div className="move-log-box__content">
                {latestMoves.length === 0 ? (
                    <p className="move-log-box__empty-message">No moves yet</p>
                ) : (
                    <ul className="move-log-box__list">
                        {latestMoves.map((move, index) => (
                            <li key={index} className="move-log-box__item">
                                <span className="move-log-box__timestamp">
                                    {new Date(move.created).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                                <span className="move-log-box__description">
                                    {getMoveDescription(move)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MoveLogBox;