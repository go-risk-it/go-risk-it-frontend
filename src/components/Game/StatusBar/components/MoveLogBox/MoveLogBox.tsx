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
import {useEffect, useRef, useState} from "react";

interface MoveLogBoxProps {
    moveHistory: MoveHistory;
    playersState: PlayersState;
    maxMoves: number;
}

const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
        return `${seconds} seconds ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
};

const MoveLogBox = ({moveHistory, playersState, maxMoves}: MoveLogBoxProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [, setTimeUpdate] = useState(0);

    useEffect(() => {
        // Update every minute instead of every second
        const timer = setInterval(() => {
            setTimeUpdate(prev => prev + 1);
        }, 60000); // 60 seconds

        return () => clearInterval(timer);
    }, []);

    // For very recent moves (< 1 minute), we can use a separate effect
    useEffect(() => {
        const recentMoves = moveHistory.moves.filter(
            move => (Date.now() - new Date(move.created).getTime()) < 60000
        );

        if (recentMoves.length === 0) return;

        const secondTimer = setInterval(() => {
            setTimeUpdate(prev => prev + 1);
        }, 1000);

        return () => clearInterval(secondTimer);
    }, [moveHistory.moves]);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [moveHistory.moves]);
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
                    const attackResult = move.result as AttackResult;
                    return `${playerName} attacked ${formatRegionId(attackMove.defendingRegionId)} from ${formatRegionId(attackMove.attackingRegionId)} with ${attackMove.attackingTroops} troops, conquering it with ${attackResult.conqueringTroops} troops.`;
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

    // Get the moves in chronological order (oldest to newest)
    const latestMoves = [...moveHistory.moves]
        .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
        .slice(-maxMoves);
    return (
        <div className="move-log-box">
            <div className="move-log-box__header">
                <h3>Recent Moves</h3>
            </div>
            <div className="move-log-box__content" ref={contentRef}>
                {latestMoves.length === 0 ? (
                    <p className="move-log-box__empty-message">No moves yet</p>
                ) : (
                    <ul className="move-log-box__list">
                        {latestMoves.map((move, index) => (
                            <li key={index} className="move-log-box__item">
                                <span className="move-log-box__timestamp">
                                    {getRelativeTime(move.created)}
                                </span>
                                <span className="move-log-box__description">
                                    {getMoveDescription(move)}
                                </span>
                            </li>))}
                    </ul>
                )}
            </div>
        </div>
    );
};
export default MoveLogBox;