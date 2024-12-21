import React, {useState} from "react"
import {PhaseType} from "../../../api/message/gameState.ts"
import DeployPopup, {DeployPopupProps} from "../Popup/DeployPopup.tsx"
import AttackPopup, {AttackPopupProps} from "../Popup/AttackPopup.tsx"
import ConquerPopup, {ConquerPopupProps} from "../Popup/ConquerPopup.tsx"
import ReinforcePopup, {ReinforcePopupProps} from "../Popup/ReinforcePopup.tsx"
import CardsPopup, {CardsPopupProps} from "../Popup/CardsPopup.tsx"
import {Button} from "@mui/material"
import {useGameState} from "../../../hooks/useGameState.ts"


const PopupManager: React.FC<{
    deployPopupProps: DeployPopupProps
    attackPopupProps: AttackPopupProps
    conquerPopupProps: ConquerPopupProps
    reinforcePopupProps: ReinforcePopupProps
    cardsPopupProps: CardsPopupProps
    handleAdvance: () => void
}> = ({
          deployPopupProps,
          attackPopupProps,
          conquerPopupProps,
          reinforcePopupProps,
          cardsPopupProps,
          handleAdvance,
      }) => {
    const {gameState} = useGameState()
    const [isPopupOpen, setIsPopupOpen] = useState(false)

    const handlePopupOpen = () => setIsPopupOpen(true)
    const handlePopupClose = () => setIsPopupOpen(false)

    if (!gameState) {
        return null
    }

    return (
        <>
            {gameState.phaseType === PhaseType.DEPLOY && (
                <DeployPopup
                    props={deployPopupProps}
                    onOpen={handlePopupOpen}
                    onClose={handlePopupClose}
                />
            )}

            {gameState.phaseType === PhaseType.ATTACK && (
                <AttackPopup
                    props={attackPopupProps}
                    onOpen={handlePopupOpen}
                    onClose={handlePopupClose}
                />
            )}

            {gameState.phaseType === PhaseType.CONQUER && (
                <ConquerPopup
                    props={conquerPopupProps}
                    onOpen={handlePopupOpen}
                    onClose={handlePopupClose}
                />
            )}

            {gameState.phaseType === PhaseType.REINFORCE && (
                <ReinforcePopup
                    props={reinforcePopupProps}
                    onOpen={handlePopupOpen}
                    onClose={handlePopupClose}
                />
            )}

            {gameState.phaseType === PhaseType.CARDS && (
                <CardsPopup
                    props={cardsPopupProps}
                    onOpen={handlePopupOpen}
                    onClose={handlePopupClose}
                />
            )}

            {(gameState.phaseType === PhaseType.ATTACK || gameState.phaseType === PhaseType.REINFORCE || gameState.phaseType === PhaseType.CARDS) && !isPopupOpen && (
                <Button onClick={handleAdvance}>Advance</Button>
            )}
        </>
    )
}

export default PopupManager
