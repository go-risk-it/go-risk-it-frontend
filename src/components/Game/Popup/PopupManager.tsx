import React from "react"
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
    const {gameState, playersState, thisPlayerState} = useGameState()

    if (!gameState || !playersState || !thisPlayerState) {
        return null
    }

    const isPlayerTurn = gameState.turn % playersState.players.length === thisPlayerState.index

    if (!isPlayerTurn) {
        return <></>
    }

    return (
        <>
            {gameState.phaseType === PhaseType.DEPLOY && (
                <DeployPopup {...deployPopupProps} />
            )}

            {gameState.phaseType === PhaseType.ATTACK && (
                <AttackPopup {...attackPopupProps} />
            )}

            {gameState.phaseType === PhaseType.CONQUER && (
                <ConquerPopup {...conquerPopupProps} />
            )}

            {gameState.phaseType === PhaseType.REINFORCE && (
                <ReinforcePopup {...reinforcePopupProps} />
            )}

            {gameState.phaseType === PhaseType.CARDS && (
                <CardsPopup {...cardsPopupProps} />
            )}

            {(gameState.phaseType === PhaseType.ATTACK ||
                    gameState.phaseType === PhaseType.REINFORCE ||
                    gameState.phaseType === PhaseType.CARDS
                ) &&
                <Button onClick={handleAdvance}>Advance</Button>
            }
        </>
    )
}

export default PopupManager
