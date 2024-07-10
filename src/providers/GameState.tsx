import {createContext, ReactElement, useContext, useEffect, useState} from "react"
import {useAuth} from "../hooks/useAuth.tsx"
import {BoardState} from "../api/message/boardState.ts"
import {PlayersState, PlayerState} from "../api/message/playersState.ts"
import {GameState, GameStateAPI, PhaseState} from "../api/message/gameState.ts"
import {WebsocketContext, WebsocketMessage} from "./Websocket.tsx"


export const GameStateContext = createContext<{
    boardState: BoardState | null,
    gameState: GameState | null,
    phaseState: PhaseState | null,
    playersState: PlayersState | null,
    thisPlayerState: PlayerState | null,
}>({
    boardState: null,
    gameState: null,
    phaseState: null,
    playersState: null,
    thisPlayerState: null,
})

// arguments of GameStateProvider are
// gameId: int
// children: ReactElement
export const GameStateProvider = ({gameId, children}: { gameId: number, children: ReactElement }) => {
    const {subscribe, unsubscribe} = useContext(WebsocketContext)
    const {session} = useAuth()
    // backend states
    const [boardState, setBoardState] = useState<BoardState | null>(null)
    const [playersState, setPlayersState] = useState<PlayersState | null>(null)
    const [thisPlayerState, setThisPlayerState] = useState<PlayerState | null>(null)
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [phaseState, setPhaseState] = useState<PhaseState | null>(null)

    useEffect(() => {
        subscribe("game", gameId, (msg: WebsocketMessage) => {
            if (msg.type === "boardState") {
                console.log("Received board state: ", msg.data)
                setBoardState(msg.data)
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
            }
        })
        return () => {
            unsubscribe("game")
        }
    }, [session, gameId, subscribe, unsubscribe])


    return (
        <GameStateContext.Provider
            value={{
                boardState,
                gameState,
                phaseState,
                playersState,
                thisPlayerState,
            }}> {children}
        </GameStateContext.Provider>
    )
}
