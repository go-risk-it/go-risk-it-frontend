import "./GameInfoBox.css";
import {PhaseType, DeployPhaseState, PhaseState} from "../../../../../api/game/message/gameState.ts";

interface GameInfoBoxProps {
  phaseType: PhaseType;
  phaseState: PhaseState; // Replace with proper type
}

const GameInfoBox = ({ phaseType, phaseState }: GameInfoBoxProps) => {
  return (
    <div className="game-info-box">
      <div className="game-info-box__section game-info-box__phase">
        <div>
          <span className="game-info-box__heading">
            {phaseType.toUpperCase()} phase
          </span>
          {phaseType === PhaseType.DEPLOY && (
            <span className="game-info-box__troops">
              Deployable Troops: {(phaseState as DeployPhaseState).deployableTroops}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameInfoBox;
