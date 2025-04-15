import React, {useState} from "react"
import {PhaseType} from "../../../api/game/message/gameState.ts"
import DeployPopup, {DeployPopupProps} from "../Popup/DeployPopup.tsx"
import AttackPopup, {AttackPopupProps} from "../Popup/AttackPopup.tsx"
import ConquerPopup, {ConquerPopupProps} from "../Popup/ConquerPopup.tsx"
import ReinforcePopup, {ReinforcePopupProps} from "../Popup/ReinforcePopup.tsx"
import CardsPopup, {CardsPopupProps} from "../Popup/CardsPopup.tsx"
import {useGameState} from "../../../hooks/useGameState.ts"
import VictoryPopup from "./VictoryPopup.tsx"

const PopupManager: React.FC<{
    deployPopupProps: DeployPopupProps
    attackPopupProps: AttackPopupProps
    conquerPopupProps: ConquerPopupProps
    reinforcePopupProps: ReinforcePopupProps
    cardsPopupProps: CardsPopupProps
}> = ({
          deployPopupProps,
          attackPopupProps,
          conquerPopupProps,
          reinforcePopupProps,
          cardsPopupProps,
      }) => {
    const {gameState, playersState, thisPlayerState} = useGameState()
    const [showVictoryPopup, setShowVictoryPopup] = useState(true)


    if (!gameState || !playersState || !thisPlayerState) {
        return null
    }

    const isPlayerTurn = gameState.turn % playersState.players.length === thisPlayerState.index


    if (gameState.winnerUserId && showVictoryPopup) {
        const winner = playersState.players.find(player => player.userId === gameState.winnerUserId)
        if (!winner) {
            throw new Error("Winner not found in players state")
        }
        return <>
            <VictoryPopup
                winner={winner}
                thisPlayer={thisPlayerState}
                onClose={() => setShowVictoryPopup(false)}
            ></VictoryPopup>
        </>
    }

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
