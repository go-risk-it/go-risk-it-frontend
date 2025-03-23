import React from "react"
import {PhaseType} from "../../../api/game/message/gameState.ts"
import DeployPopup, {DeployPopupProps} from "../Popup/DeployPopup.tsx"
import AttackPopup, {AttackPopupProps} from "../Popup/AttackPopup.tsx"
import ConquerPopup, {ConquerPopupProps} from "../Popup/ConquerPopup.tsx"
import ReinforcePopup, {ReinforcePopupProps} from "../Popup/ReinforcePopup.tsx"
import CardsPopup, {CardsPopupProps} from "../Popup/CardsPopup.tsx"
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
          handleAdvance: _handleAdvance, // Renamed to indicate it's unused
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
        </>
    )
}

export default PopupManager
