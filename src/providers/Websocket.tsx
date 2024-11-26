import {createContext, ReactElement, useCallback, useEffect, useRef} from "react"
import {useAuth} from "../hooks/useAuth.tsx"

export interface WebsocketMessage {
    type: string;
    data: never;
}

export const WebsocketContext = createContext<{
    subscribe: (callback: (message: WebsocketMessage) => void) => void;
    unsubscribe: () => void;
}>({
    subscribe: () => {
    },
    unsubscribe: () => {
    },
})

export const WebsocketProvider = ({gameId, children}: { gameId: number, children: ReactElement }) => {
    const socketUrl = process.env.REACT_APP_WS_URL! + "?gameID=" + gameId
    const {session} = useAuth()
    const ws = useRef<WebSocket | null>(null)
    const messageConsumer = useRef<(message: WebsocketMessage) => void>(() => {
    })

    const setupWebSocket = useCallback(() => {
        if (ws.current) return
        if (!session) throw new Error("User is not authenticated")

        console.log("Connecting to:", socketUrl)

        ws.current = new WebSocket(socketUrl, ["risk-it.websocket.auth.token", session.access_token])

        ws.current.onopen = () => {
            console.log("WebSocket connection opened")
        }

        ws.current.onclose = () => {
            console.log("WebSocket connection closed")
            ws.current = null
        }

        ws.current.onmessage = (message: MessageEvent) => {
            try {
                const msg = JSON.parse(message.data) as WebsocketMessage
                console.log("Received message:", msg)

                if (messageConsumer.current) {
                    messageConsumer.current(msg)
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", message.data)
            }
        }
    }, [session, socketUrl])

    const teardownWebSocket = useCallback(() => {
        if (ws.current) {
            console.log("Closing WebSocket...")
            ws.current.close()
            ws.current = null
        }
    }, [])

    const subscribe = useCallback((callback: (message: WebsocketMessage) => void) => {
        messageConsumer.current = callback
        console.log("Subscribed to WebSocket messages")
        setupWebSocket()
    }, [setupWebSocket])

    const unsubscribe = useCallback(() => {
        messageConsumer.current = () => {
        }
        console.log("Unsubscribed from WebSocket messages")
    }, [])

    useEffect(() => {
        return () => {
            teardownWebSocket() // Clean up WebSocket on unmount
        }
    }, [teardownWebSocket])

    return (
        <WebsocketContext.Provider
            value={{
                subscribe,
                unsubscribe,
            }}
        >
            {children}
        </WebsocketContext.Provider>
    )
}
