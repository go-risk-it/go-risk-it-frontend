import React, { useState } from "react"

import "./Game.css"
import Button from "@mui/material/Button"
import { useAuth } from "../../../hooks/useAuth.ts"
import { useGameState } from "../../../hooks/useGameState.ts"
import { ConquerPhaseState, DeployPhaseState, PhaseType } from "../../../api/game/message/gameState.ts"
import { useDeployMoveReducer } from "../../../hooks/useDeployMoveReducer.ts"
import { getDeployPopupProps, onRegionClickDeploy } from "./deploy.ts"
import { useAttackMoveReducer } from "../../../hooks/useAttackMoveReducer.ts"
import { getAttackPopupProps, onRegionClickAttack } from "./attack.ts"
import { useConquerMoveReducer } from "../../../hooks/useConquerMoveReducer.ts"
import { getConquerPopupProps } from "./conquer.ts"
import { useReinforceMoveReducer } from "../../../hooks/useReinforceMoveReducer.ts"
import { getReinforcePopupProps, onRegionClickReinforce } from "./reinforce.ts"
import { useCardMoveReducer } from "../../../hooks/useCardMoveReducer.ts"
import { getCardsPopupProps } from "./cards.ts"
import { AdvanceMove } from "../../../api/game/message/advanceMove.ts"
import MapContainer from "../Map/MapContainer.tsx"
import PopupManager from "../Popup/PopupManager.tsx"
import { MapProvider } from "../../../providers/Map.tsx"
import { useServerQuerier } from "../../../hooks/useServerQuerier.ts"
import CardsStatus from "../Cards/CardsStatus.tsx"
import StatusBar from "../StatusBar/StatusBar.tsx"
import { FaCrosshairs, FaFlag, FaScroll, FaShieldAlt } from "react-icons/fa"
import AdvancePopup from "../Popup/AdvancePopup.tsx"

const Game: React.FC = () => {
    const { signout } = useAuth()
    const [showAdvancePopup, setShowAdvancePopup] = useState(false)

    const { deployMove, dispatchDeployMove } = useDeployMoveReducer()
    const { attackMove, dispatchAttackMove } = useAttackMoveReducer()
    const { conquerMove, dispatchConquerMove } = useConquerMoveReducer()
    const { reinforceMove, dispatchReinforceMove } = useReinforceMoveReducer()
    const { cardMove, dispatchCardMove } = useCardMoveReducer()
    const { doDeploy, doAttack, doConquer, doReinforce, doAdvance, doPlayCards } = useServerQuerier()

    const { boardState, cardState, gameState, phaseState, playersState, thisPlayerState } = useGameState()
    if (!boardState || !playersState || !thisPlayerState || !gameState || !phaseState || !cardState) {
        return null
    }

    const handleAdvance = () => {
        const advanceMove: AdvanceMove = {
            currentPhase: gameState.phaseType,
        }
        doAdvance(advanceMove, gameState)
        setShowAdvancePopup(false)
    }

    const handleAdvanceClick = () => {
        setShowAdvancePopup(true)
    }

    const handleAdvanceCancel = () => {
        setShowAdvancePopup(false)
    }

    const getPhaseIcon = () => {
        switch (gameState.phaseType) {
            case PhaseType.DEPLOY:
                return <FaFlag className="phase-indicator__phase-icon" />
            case PhaseType.ATTACK:
                return <FaCrosshairs className="phase-indicator__phase-icon" />
            case PhaseType.REINFORCE:
                return <FaShieldAlt className="phase-indicator__phase-icon" />
            default:
                return null
        }
    }

    const currentPlayer = playersState.players[gameState.turn % playersState.players.length]
    const isCurrentPlayerTurn = currentPlayer.userId === thisPlayerState.userId

    return (
        <MapProvider boardState={boardState} thisPlayerState={thisPlayerState}>
            <div className="game-container">
                {/* Left Sidebar */}
                <div className="game-sidebar">
                    <StatusBar />
                </div>

                {/* Top Phase Bar */}
                <div className="game-phase-bar">
                    <div className="phase-indicator">
                        <div className="phase-indicator__turn">
                            <div className={`phase-indicator__player-avatar player-${currentPlayer.index}-bg`}>
                                {currentPlayer.name[0].toUpperCase()}
                            </div>
                            <span>{currentPlayer.name}'s Turn</span>
                        </div>
                        <div className="phase-indicator__phase">
                            {getPhaseIcon()}
                            <span className="phase-indicator__text">
                                {gameState.phaseType} Phase
                            </span>
                        </div>
                        {isCurrentPlayerTurn && (gameState.phaseType === PhaseType.ATTACK ||
                            gameState.phaseType === PhaseType.REINFORCE ||
                            gameState.phaseType === PhaseType.CARDS
                        ) && (
                                <Button
                                    variant="contained"
                                    onClick={handleAdvanceClick}
                                    className="advance-button"
                                >
                                    Advance
                                </Button>
                            )}
                        {isCurrentPlayerTurn && (gameState.phaseType === PhaseType.DEPLOY) && (
                            <span>{(phaseState as DeployPhaseState).deployableTroops} left to deploy</span>
                        )}
                    </div>
                </div>

                {/* Main Map Area */}
                <div className="map-container">
                    <MapContainer
                        onRegionClick={(graph, region) => {
                            if (!isCurrentPlayerTurn) {
                                return null
                            }
                            switch (gameState.phaseType) {
                                case PhaseType.DEPLOY:
                                    return onRegionClickDeploy(thisPlayerState, region, deployMove, dispatchDeployMove)
                                case PhaseType.ATTACK:
                                    return onRegionClickAttack(thisPlayerState, region, attackMove, dispatchAttackMove, graph)
                                case PhaseType.REINFORCE:
                                    return onRegionClickReinforce(thisPlayerState, region, reinforceMove, dispatchReinforceMove, graph)
                                default:
                                    return null
                            }
                        }}
                    />
                </div>

                {/* Cards Section */}
                {cardState.cards.length > 0 && (
                    <div className="cards-section">
                        <div className="cards-section__header">
                            <div className="cards-section__title">
                                <FaScroll /> Your Cards ({cardState.cards.length})
                            </div>
                        </div>
                        <div className="cards-container">
                            <CardsStatus />
                        </div>
                    </div>
                )}

                {/* Sign out button */}
                <Button className="signout-button" onClick={signout}>
                    Sign out
                </Button>

                {/* Popups */}
                <PopupManager
                    deployPopupProps={getDeployPopupProps(
                        doDeploy, gameState, phaseState as DeployPhaseState, deployMove, dispatchDeployMove, thisPlayerState.index,
                    )}
                    attackPopupProps={getAttackPopupProps(
                        doAttack, gameState, attackMove, dispatchAttackMove, boardState, playersState,
                    )}
                    conquerPopupProps={getConquerPopupProps(
                        doConquer, gameState, phaseState as ConquerPhaseState, boardState, conquerMove, dispatchConquerMove, playersState,
                    )}
                    reinforcePopupProps={getReinforcePopupProps(doReinforce, gameState, reinforceMove, dispatchReinforceMove, thisPlayerState.index)}
                    cardsPopupProps={getCardsPopupProps(doPlayCards, gameState, cardState, cardMove, dispatchCardMove, handleAdvance)}
                    handleAdvance={handleAdvance}
                />

                {/* Advance Confirmation Popup */}
                <AdvancePopup
                    isVisible={showAdvancePopup}
                    onConfirm={handleAdvance}
                    onCancel={handleAdvanceCancel}
                />
            </div>
        </MapProvider>
    )
}

export default Game