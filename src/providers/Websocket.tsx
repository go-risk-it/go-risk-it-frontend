import {createContext, ReactElement, useEffect, useRef, useState} from "react"
import {useAuth} from "../hooks/useAuth.tsx"


export interface WebsocketMessage {
    type: string;
    data: never;
}

export const WebsocketContext = createContext<{
    subscribe: (callback: (message: WebsocketMessage) => void) => void
    unsubscribe: () => void
}>({
    subscribe: () => {
    },
    unsubscribe: () => {
    },
})

export const WebsocketProvider = ({gameId, children}: { gameId: number, children: ReactElement }) => {
    const socketUrl = process.env.REACT_APP_WS_URL! + "?gameID=" + gameId;
    const {session} = useAuth()
    const ws = useRef<WebSocket | null>(null)
    const messageConsumer = useRef<(message: WebsocketMessage) => void>(() => {
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!session) {
            throw new Error("User is not authenticated")
        }
        if (!ws.current) {
            console.log("Connecting to: ", socketUrl, ", session: ", session)
            ws.current = new WebSocket(socketUrl, ["risk-it.websocket.auth.token", session.access_token])

            ws.current.onopen = () => {
                console.log("WS open")
                setLoading(false)
            }
            ws.current.onclose = () => {
                console.log("WS close")
            }
            ws.current.onmessage = (message: MessageEvent) => {
                try {
                    const msg = JSON.parse(message.data) as WebsocketMessage
                    console.log("Parsed message: ", msg)
                    messageConsumer.current(msg)
                } catch (e) {
                    console.log("Invalid JSON: ", message.data)
                }
            }
        }
        return () => {
            if (!session) {
                ws.current?.close()
            }
        }
    }, [session, socketUrl])

    return (
        <WebsocketContext.Provider
            value={{
                subscribe: (callback: (message: WebsocketMessage) => void) => {
                    messageConsumer.current = callback
                },
                unsubscribe: () => {
                    messageConsumer.current = () => {
                    }
                },
            }}> {!loading && children}
        </WebsocketContext.Provider>
    )
}
