import {createContext, ReactElement, useContext, useEffect, useState} from "react"
import {useAuth} from "../hooks/useAuth.tsx"
import {BoardState} from "../api/message/boardState.ts"
import {PlayersState, PlayerState} from "../api/message/playersState.ts"
import {GameState, GameStateAPI, PhaseState} from "../api/message/gameState.ts"
import {WebsocketContext, WebsocketMessage} from "./Websocket.tsx"
import {CardState} from "../api/message/cardState.ts"


export const GameStateContext = createContext<{
    boardState: BoardState | null,
    cardState: CardState,
    gameState: GameState | null,
    phaseState: PhaseState | null,
    playersState: PlayersState | null,
    thisPlayerState: PlayerState | null,
}>({
    boardState: null,
    cardState: {cards: []},
    gameState: null,
    phaseState: null,
    playersState: null,
    thisPlayerState: null,
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
            } else {
                console.warn("Unhandled message: ", msg)
            }
        })
        return () => {
            unsubscribe()
        }
    }, [session, subscribe, unsubscribe])


    return (
        <GameStateContext.Provider
            value={{
                boardState,
                cardState,
                gameState,
                phaseState,
                playersState,
                thisPlayerState,
            }}> {children}
        </GameStateContext.Provider>
    )
}
