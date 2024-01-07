import WebSocket from 'ws';

const ws = new WebSocket('http://localhost:8080/ws');

ws.on('open', () => {
    console.log('Connected to server');
    ws.send("{\"player_id\":1,\"game_id\":2,\"payload\":{\"start_region_id\":10,\"end_region_id\":20,\"num_troops\":30}}");
});

ws.on('message', (message: string) => {
    console.log(`Received message from server: ${message}`);
});

ws.on('close', () => {
    console.log('Disconnected from server');
});