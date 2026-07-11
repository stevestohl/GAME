import { io } from 'socket.io-client';

// 1. Define the unique URL for this specific game namespace
const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/trivia' 
    : 'https://game-temple-backend.onrender.com/trivia';

// 2. Instantiate the socket connection once at the module level
export const triviaSocket = io(BACKEND_URL, { 
    autoConnect: false,
    transports: ['websocket', 'polling']
});

// 3. Click handler function (Notice: triviaSocket is no longer a required parameter!)
export function handleCreateTriviaRoom(playerName, navigate) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    
    console.log(`📡 Requesting Trivia Room creation for: ${cleanName}`);
    
    // Check connection status
    console.log("Is trivia socket connected?", triviaSocket.connected);     
    
    if (!triviaSocket.connected) {
        console.warn("Trivia socket is disconnected! Attempting to reconnect...");
        triviaSocket.connect();
    }

    // Clears other listeners to prevent memory leaks
    triviaSocket.off('roomCreated');

    // Fire the socket request to the /trivia namespace backend handlers
    triviaSocket.emit('createRoom');

    // Listen for the server response acknowledgment to route them
    triviaSocket.once('roomCreated', ({ roomCode }) => {
        console.log(`🎉 Trivia room created successfully! Code: ${roomCode}`);
        navigate(`/TriviaWaitingRoom?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}