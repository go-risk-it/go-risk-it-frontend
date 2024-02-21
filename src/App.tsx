import {useEffect, useRef, useState} from 'react'
import './App.css'
import Map from "./components/map.tsx";
import {BoardState} from "./api/message/boardState.ts";

function App() {
    // create a state containing the message
    const [message, setMessage] = useState("")
    const [boardState, setBoardState] = useState({regions: []} as BoardState)
    const ws = useRef<WebSocket | null>(null)

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8080/ws")
        if (!ws.current) {
            throw new Error("Websocket is not initialized")
        }

        ws.current.onopen = (event: Event) => {
            console.log("Connected to server", event)
        }

        ws.current.onmessage = async (event: MessageEvent) => {
            console.log("Message received: ", event.data.text)
            try {
                const msg = JSON.parse(event.data)
                console.log("Parsed message: ", msg)
                setMessage(msg)
                if (msg.type === "boardState") {
                    setBoardState(msg.data)
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
            <h1>Websocket example</h1>
            <Button onClick={() => ws.current?.send(
                JSON.stringify({type: "game_state_request", data: {"userId": 10, "gameId": 11}})
            )}/>
            <pre>{JSON.stringify(message, null, 2)}</pre>
            <Map boardState={boardState}/>
        </div>
    )
}

function Button({onClick}: { onClick: () => void }) {
    return (
        <button onClick={onClick}>Click me!</button>
    );
}


export default App
