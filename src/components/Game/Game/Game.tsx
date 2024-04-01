import {useEffect, useRef, useState} from 'react'
import Map from "../Map/Map.tsx";
import StatusBar from "../StatusBar/StatusBar.tsx";

import {BoardState} from "../../../api/message/boardState.ts";
import {PlayersState} from "../../../api/message/playersState.ts";
import {GameState, Phase} from "../../../api/message/gameState.ts";
import {DeployAction} from "../../../api/message/deployAction.ts";
import DeployPopup from "../DeployPopup/DeployPopup.tsx";

import './Game.css'


function Game() {
    // backend states
    const [boardState, setBoardState] = useState<BoardState>({regions: []})
    const [gameState, setGameState] = useState<GameState>({gameId: 1, currentTurn: 0, currentPhase: Phase.DEPLOY})
    const [playersState, setPlayersState] = useState<PlayersState>({players: []})

    // UI states
    const [deployAction, setDeployAction] = useState<DeployAction>({regionId: null, troops: 0})


    const playerIndex = 0
    const playerState = playersState.players[playerIndex]
    const ws = useRef<WebSocket | null>(null)

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8080/ws")
        if (!ws.current) {
            throw new Error("Websocket is not initialized")
        }

        ws.current.onopen = (event: Event) => {
            console.log("Connected to server", event)
            ws.current?.send(JSON.stringify({type: "subscribe", data: {gameId: gameState.gameId}}))
        }

        ws.current.onmessage = async (event: MessageEvent) => {
            console.log("Message received: ", event.data.text)
            try {
                const msg = JSON.parse(event.data)
                console.log("Parsed message: ", msg)
                if (msg.type === "boardState") {
                    setBoardState(msg.data)
                } else if (msg.type === "playerState") {
                    setPlayersState(msg.data)
                } else if (msg.type === "gameState") {
                    setGameState(msg.data)
                }
            } catch (e) {
                console.log("Invalid JSON: ", event.data)
            }
        }

        ws.current.onclose = (event: CloseEvent) => {
            console.log("Connection closed: ", event)
        }

        const wsCurrent = ws.current

        return () => {
            wsCurrent?.close()
        }
    }, [])


    return (
        <div>
            <h1>Go risk it!</h1>
            <StatusBar gameState={gameState} playersState={playersState}/>
            <Map boardState={boardState} gameState={gameState} playersState={playersState} playerState={playerState}
                 deployAction={deployAction} setDeployAction={setDeployAction}/>
            <DeployPopup deployAction={deployAction} setDeployAction={setDeployAction}
                         gameState={gameState} playerState={playerState}/>
        </div>
    )
}


export default Game
