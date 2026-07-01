// TriviaCreateButton.jsx
import { socket } from './socket'; // Or wherever your client-side socket instance is initialized

export function handleCreateTriviaRoom(playerName, navigate) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    
    console.log(`Requesting Trivia Room creation for: ${cleanName}`);
    
    // 📡 Fire the socket request to server.js
    socket.emit('createRoom');

    // 🎣 Listen for the server response acknowledgment to route them
    socket.once('roomCreated', ({ roomCode, players }) => {
        navigate(`/TriviaWaitingRoom?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}