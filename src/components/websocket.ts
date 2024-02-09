import {WebSocket} from "undici-types";

interface WebSocketMessage {
    type: string;
    data: any;
}

interface GameStateRequestMessage extends WebSocketMessage {
    type: 'game_state_request';
}

interface BoardStateResponseMessage extends WebSocketMessage {
    type: 'board_state_request';
}

// Define other message types as needed
type AllMessageTypes = GameStateRequestMessage | BoardStateResponseMessage;

const WebSocketService = () => {
    let ws = new WebSocket('ws://localhost:8080/ws');

    ws.send('{"type": "game_state_request", "data": {"userId": "10", "gameId": "11"}}')
    const handleMessage = (message: AllMessageTypes) => {
        switch (message.type) {
            case 'game_state_request':
                handleGameStateRequest(message);
                break;
            case 'board_state_request':
                handleBoardStateRequest(message);
                break;
            default:
                break;
        }
    };
    const handleGameStateRequest = (message: GameStateRequestMessage) => {
        console.log("handle game state: " + message);
    };

    const handleBoardStateRequest = (message: BoardStateResponseMessage) => {
        console.log("handle board state: " + message)
    };

    ws.onmessage = m => {
        console.log("processing message: ", m)
        handleMessage(m.data)
    };

    return {
        ws
    };
};

export default WebSocketService;