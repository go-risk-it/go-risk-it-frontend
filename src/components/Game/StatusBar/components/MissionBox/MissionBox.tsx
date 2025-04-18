import "./MissionBox.css"
import {
    MissionState,
    MissionType,
    TwoContinentMission,
    TwoContinentsPlusOneMission,
    EliminatePlayerMission
} from "../../../../../api/game/message/missionState.ts"
import {PlayersState, PlayerState} from "../../../../../api/game/message/playersState.ts"

interface MissionBoxProps {
    missionState: MissionState
    playersState: PlayersState
    thisPlayerState: PlayerState
}

const MissionBox = ({missionState, playersState, thisPlayerState}: MissionBoxProps) => {
    // Function to get the mission description based on type
    const getMissionDescription = () => {
        if (!missionState) return "Mission not available"

        let twoContinentDetails
        let twoContinentsPlusOneDetails
        let eliminatePlayerDetails: EliminatePlayerMission
        let targetPlayer
        let targetName

        switch (missionState.type) {
            case MissionType.TWO_CONTINENTS:
                twoContinentDetails = missionState.details as TwoContinentMission
                return `Conquer and hold ${twoContinentDetails.continent1} and ${twoContinentDetails.continent2}.`

            case MissionType.TWO_CONTINENTS_PLUS_ONE:
                twoContinentsPlusOneDetails = missionState.details as TwoContinentsPlusOneMission
                return `Conquer and hold ${twoContinentsPlusOneDetails.continent1}, ${twoContinentsPlusOneDetails.continent2}, and any third continent of your choice.`

            case MissionType.EIGHTEEN_TERRITORIES_TWO_TROOPS:
                return "Occupy 18 territories with at least 2 troops in each territory."

            case MissionType.TWENTY_FOUR_TERRITORIES:
                return "Occupy 24 territories of your choice."

            case MissionType.ELIMINATE_PLAYER:
                eliminatePlayerDetails = missionState.details as EliminatePlayerMission
                targetPlayer = playersState.players.find(p => p.userId === eliminatePlayerDetails.targetUserId)
                targetName = targetPlayer ? (targetPlayer.userId === thisPlayerState.userId ? "yourself" : targetPlayer.name) : "another player"
                return `Eliminate ${targetName} from the game. If that's not possible, complete a secondary objective.`

            default:
                return "Complete your secret mission to win."
        }
    }
    return (
        <div className="mission-box">
            <div className="mission-box__content">
                <div className="mission-box__icon">
                    <span role="img" aria-label="mission">🎯</span>
                </div>
                <div className="mission-box__text-container">
                    <p className="mission-box__text">
                        {getMissionDescription()}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default MissionBox;
