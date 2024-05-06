import {createContext, ReactElement, useEffect, useRef, useState} from "react";
import {useAuth} from "./useAuth.tsx";


export interface WebsocketMessage {
    type: string;
    data: never;
}

const gameTopics: Set<string> = new Set<string>(["boardState", "playerState", "gameState"]);

export const WebsocketContext = createContext<{
    subscribe: (topic: string, gameId: number, callback: (data: WebsocketMessage) => void) => void
    unsubscribe: (topic: string) => void
}>({
    subscribe: () => {
    },
    unsubscribe: () => {
    }
});

export const WebsocketProvider = ({children}: { children: ReactElement }) => {
    const {session} = useAuth()
    const ws = useRef<WebSocket | null>(null)
    const topics = useRef<Map<string, (data: WebsocketMessage) => void>>(new Map<string, (data: WebsocketMessage) => void>())
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!session) {
            throw new Error("User is not authenticated")
        }

        ws.current = new WebSocket("ws://localhost:8000/ws", ["risk-it.websocket.auth.token", session.access_token])

        ws.current.onopen = () => {
            console.log('WS open')
            setLoading(false)
            ws.current?.send(JSON.stringify({type: "subscribe", data: {gameId: 1}}))
        }
        ws.current.onclose = () => {
            console.log('WS close')
        }
        ws.current.onmessage = (message: MessageEvent) => {
            try {
                const msg = JSON.parse(message.data) as WebsocketMessage
                console.log("Parsed message: ", msg)

                // if this is a game message, call the "game" callback
                if (gameTopics.has(msg.type)) {
                    topics.current.get("game")?.(msg)
                }
            } catch (e) {
                console.log("Invalid JSON: ", message.data)
            }
        }
        return () => {
            ws.current?.close()
        }
    }, [session])

    return (
        <WebsocketContext.Provider
            value={{
                subscribe: (topic: string, gameId: number, callback: (data: WebsocketMessage) => void) => {
                    topics.current.set(topic, callback)
                },
                unsubscribe: (topic: string) => {
                    topics.current.delete(topic)
                }
            }}> {!loading && children}
        </WebsocketContext.Provider>
    );
};
