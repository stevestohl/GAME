import { triviaSocket } from '../../socket.js'; 

export function handleCreateTriviaRoom(playerName, navigate) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    
    console.log(`Requesting Trivia Room creation for: ${cleanName}`);
    
    // Ensure the shared socket instance is open
    if (!triviaSocket.connected) {
        console.warn("Trivia socket is disconnected! Connecting...");
        triviaSocket.connect();
    }

    // Clean up any stale listeners on the shared socket
    triviaSocket.off('roomCreated');

    // Fire the creation event
    triviaSocket.emit('createRoom');

    // Listen once for the backend room blueprint assignment
    triviaSocket.once('roomCreated', ({ roomCode }) => {
        console.log(`🎉 Trivia room created successfully! Code: ${roomCode}`);
        navigate(`/TriviaWaitingRoom?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}