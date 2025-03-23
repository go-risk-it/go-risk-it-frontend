import {createContext, ReactElement, useContext, useEffect, useState} from "react"
import {useAuth} from "../hooks/useAuth.ts"
import {BoardState} from "../api/game/message/boardState.ts"
import {PlayersState, PlayerState} from "../api/game/message/playersState.ts"
import {GameState, GameStateAPI, PhaseState} from "../api/game/message/gameState.ts"
import {WebsocketContext, WebsocketMessage} from "./Websocket.tsx"
import {CardState} from "../api/game/message/cardState.ts"
import {MissionState} from "../api/game/message/missionState.ts";
import {MoveHistory} from "../api/game/message/moveLog.ts";


export const GameStateContext = createContext<{
    boardState: BoardState | null,
    cardState: CardState,
    gameState: GameState | null,
    phaseState: PhaseState | null,
    playersState: PlayersState | null,
    thisPlayerState: PlayerState | null,
    missionState: MissionState | null,
    moveHistory: MoveHistory | null,
}>({
    boardState: null,
    cardState: {cards: []},
    gameState: null,
    phaseState: null,
    playersState: null,
    thisPlayerState: null,
    missionState: null,
    moveHistory: null,
})

// arguments of GameStateProvider are
// children: ReactElement
export const GameStateProvider = ({children}: { children: ReactElement }) => {
    const {subscribe, unsubscribe} = useContext(WebsocketContext)
    const {session} = useAuth()
    // backend states
    const [boardState, setBoardState] = useState<BoardState | null>(null)
    const [cardState, setCardState] = useState<CardState>({cards: []})
    const [playersState, setPlayersState] = useState<PlayersState | null>(null)
    const [thisPlayerState, setThisPlayerState] = useState<PlayerState | null>(null)
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [phaseState, setPhaseState] = useState<PhaseState | null>(null)
    const [missionState, setMissionState] = useState<MissionState | null>(null)
    const [moveHistory, setMoveHistory] = useState<MoveHistory | null>(null)


    useEffect(() => {
        subscribe((msg: WebsocketMessage) => {
            if (msg.type === "boardState") {
                console.log("Received board state: ", msg.data)
                setBoardState(msg.data)
            } else if (msg.type === "cardState") {
                console.log("Received card state: ", msg.data)
                setCardState(msg.data)
            } else if (msg.type === "playerState") {
                console.log("Received player state: ", msg.data)
                setPlayersState(msg.data)
                const ps = msg.data as PlayersState
                const thisPlayer = ps.players.find(player => player.userId === session?.user?.id)
                if (!thisPlayer) {
                    throw Error("This player not found in players state")
                }
                setThisPlayerState(
                    thisPlayer,
                )

            } else if (msg.type === "gameState") {
                console.log("Received game state: ", msg.data)
                const data = msg.data as GameStateAPI
                setGameState({
                    id: data.id,
                    turn: data.turn,
                    phaseType: data.phase.type,
                })
                setPhaseState(data.phase.state)
            } else if (msg.type === "missionState") {
                console.log("Received mission state: ", msg.data)
                const data = msg.data as MissionState
                setMissionState(data)
            } else if (msg.type === "moveHistory") {
                console.log("Received move history: ", msg.data)
                const data = msg.data as MoveHistory
                data.moves.forEach(move => {
                    const moveStr = move.move as unknown as string
                    const resultStr = move.result as unknown as string
                    const decodedMove = atob(moveStr)
                    const decodedResult = atob(resultStr)
                    move.move = JSON.parse(decodedMove)
                    move.result = JSON.parse(decodedResult)
                })
                const newMoveHistory = moveHistory ? {...moveHistory, ...data} : data
                setMoveHistory(newMoveHistory)
            } else {                console.warn("Unhandled message: ", msg)
            }
        })
        return () => {
            unsubscribe()
        }
    }, [moveHistory, session, subscribe, unsubscribe])


    return (
        <GameStateContext.Provider
            value={{
                boardState,
                cardState,
                gameState,
                phaseState,
                playersState,
                thisPlayerState,
                missionState,
                moveHistory,
            }}> {children}
        </GameStateContext.Provider>
    )
}
