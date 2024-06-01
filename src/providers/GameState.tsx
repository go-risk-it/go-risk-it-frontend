import {createContext, ReactElement, useContext, useEffect, useState} from "react";
import {useAuth} from "../hooks/useAuth.tsx";
import {BoardState} from "../api/message/boardState.ts";
import {PlayersState, PlayerState} from "../api/message/playersState.ts";
import {GameState} from "../api/message/gameState.ts";
import {WebsocketContext, WebsocketMessage} from "./Websocket.tsx";


export const GameStateContext = createContext<{
    boardState: BoardState | null,
    playersState: PlayersState | null,
    thisPlayerState: PlayerState | null,
    gameState: GameState | null,
}>({
    boardState: null,
    playersState: null,
    thisPlayerState: null,
    gameState: null,
});

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

    useEffect(() => {
        subscribe("game", gameId, (msg: WebsocketMessage) => {
            if (msg.type === "boardState") {
                console.log("Received board state: ", msg.data)
                setBoardState(msg.data)
            } else if (msg.type === "playerState") {
                console.log("Received player state: ", msg.data)
                setPlayersState(msg.data)
                const ps: PlayersState = msg.data
                setThisPlayerState(
                    ps.players.find(player => player.userId === session?.user?.id) || null
                )

            } else if (msg.type === "gameState") {
                console.log("Received game state: ", msg.data)
                setGameState(msg.data)
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
                playersState,
                thisPlayerState,
                gameState
            }}> {children}
        </GameStateContext.Provider>
    );
};
