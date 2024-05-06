import {useContext, useEffect, useState} from 'react'
import Map from "../Map/Map.tsx";
import StatusBar from "../StatusBar/StatusBar.tsx";

import {BoardState} from "../../../api/message/boardState.ts"
import {PlayersState} from "../../../api/message/playersState.ts"
import {GameState, Phase} from "../../../api/message/gameState.ts"
import {DeployAction} from "../../../api/message/deployAction.ts"
import DeployPopup from "../DeployPopup/DeployPopup.tsx"

import './Game.css'
import Button from "@mui/material/Button";
import {useAuth} from "../../../hooks/useAuth.tsx";
import "./Game.css"
import {WebsocketContext, WebsocketMessage} from "../../../hooks/Websocket.tsx";


function Game() {
    const {session, signout} = useAuth()
    const {subscribe, unsubscribe} = useContext(WebsocketContext)
    // backend states
    const [boardState, setBoardState] = useState<BoardState>({regions: []})
    const [gameState, setGameState] = useState<GameState>({gameId: 1, currentTurn: 0, currentPhase: Phase.DEPLOY})
    const [playersState, setPlayersState] = useState<PlayersState>({players: []})

    // UI states
    const [deployAction, setDeployAction] = useState<DeployAction>({regionId: null, playerId: "francesco", troops: 0})


    const playerIndex = 0
    const playerState = playersState.players[playerIndex]

    useEffect(() => {
        if (!session) {
            throw new Error("User is not authenticated")
        }

        subscribe("game", 1, (msg: WebsocketMessage) => {
            if (msg.type === "boardState") {
                setBoardState(msg.data)
            } else if (msg.type === "playerState") {
                setPlayersState(msg.data)
            } else if (msg.type === "gameState") {
                setGameState(msg.data)
            }
        })

        return () => {
            unsubscribe("game")
        }
    }, [session, subscribe, unsubscribe])

    return (
        <div>
            <h1>Go risk it!</h1>
            {/*logout button*/}
            <Button onClick={signout}>Sign out</Button>
            <StatusBar gameState={gameState} playersState={playersState}/>
            <Map boardState={boardState} gameState={gameState} playersState={playersState} playerState={playerState}
                 deployAction={deployAction} setDeployAction={setDeployAction}/>
            <DeployPopup deployAction={deployAction} setDeployAction={setDeployAction}
                         gameState={gameState} playerState={playerState}/>
        </div>
    )
}

export default Game