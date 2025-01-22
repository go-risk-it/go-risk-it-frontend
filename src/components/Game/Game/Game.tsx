import React from "react"

import "./Game.css"
import Button from "@mui/material/Button"
import {useAuth} from "../../../hooks/useAuth.ts"
import {useGameState} from "../../../hooks/useGameState.ts"
import {ConquerPhaseState, DeployPhaseState, PhaseType} from "../../../api/message/gameState.ts"
import {useDeployMoveReducer} from "../../../hooks/useDeployMoveReducer.ts"
import {getDeployPopupProps, onRegionClickDeploy} from "./deploy.ts"
import {useAttackMoveReducer} from "../../../hooks/useAttackMoveReducer.ts"
import {getAttackPopupProps, onRegionClickAttack} from "./attack.ts"
import {useConquerMoveReducer} from "../../../hooks/useConquerMoveReducer.ts"
import {getConquerPopupProps} from "./conquer.ts"
import {useReinforceMoveReducer} from "../../../hooks/useReinforceMoveReducer.ts"
import {getReinforcePopupProps, onRegionClickReinforce} from "./reinforce.ts"
import {useCardMoveReducer} from "../../../hooks/useCardMoveReducer.ts"
import {getCardsPopupProps} from "./cards.ts"
import {AdvanceMove} from "../../../api/message/advanceMove.ts"
import MapContainer from "../Map/MapContainer.tsx"
import PopupManager from "../Popup/PopupManager.tsx"
import {MapProvider} from "../../../providers/Map.tsx"
import {useServerQuerier} from "../../../hooks/useServerQuerier.ts"
import CardsStatus from "../Cards/CardsStatus.tsx"
import StatusBar from "../StatusBar/StatusBar.tsx"


const Game: React.FC = () => {
    const {signout} = useAuth()


    const {deployMove, dispatchDeployMove} = useDeployMoveReducer()
    const {attackMove, dispatchAttackMove} = useAttackMoveReducer()
    const {conquerMove, dispatchConquerMove} = useConquerMoveReducer()
    const {reinforceMove, dispatchReinforceMove} = useReinforceMoveReducer()
    const {cardMove, dispatchCardMove} = useCardMoveReducer()
    const {doDeploy, doAttack, doConquer, doReinforce, doAdvance, doPlayCards} = useServerQuerier()


    const {boardState, cardState, gameState, phaseState, playersState, thisPlayerState} = useGameState()
    if (!boardState || !playersState || !thisPlayerState || !gameState || !phaseState || !cardState) {
        return null
    }

    const handleAdvance = () => {
        const advanceMove: AdvanceMove = {
            currentPhase: gameState.phaseType,
        }
        doAdvance(advanceMove, gameState)
    }

    return (
        <MapProvider boardState={boardState} thisPlayerState={thisPlayerState}>
            <div className="game-container">
                <Button className="signout-button" onClick={signout}>Sign out</Button>
                <StatusBar/>
                <div className="right-side-container">
                    <MapContainer
                        onRegionClick={(graph, region) => {
                            if (gameState.turn % playersState.players.length !== thisPlayerState.index) {
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
                        cardsPopupProps={getCardsPopupProps(doPlayCards, gameState, cardState, cardMove, dispatchCardMove)}
                        handleAdvance={handleAdvance}
                    />
                    <CardsStatus/>
                </div>
            </div>        </MapProvider>
    )}
export default Game