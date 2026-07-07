import socket from './socket';

export function handleCreateTriviaRoom(playerName, navigate) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    
    console.log(`Requesting Trivia Room creation for: ${cleanName}`);
    //  Check socket status
    console.log("Is socket connected?", socket.connected); 
    
    if (!socket.connected) {
        console.warn("Socket is disconnected! Attempting to reconnect...");
        socket.connect();
    }
    
    // 📡 Fire the socket request to server.js
    socket.emit('createRoom');

    // 🎣 Listen for the server response acknowledgment to route them
    socket.once('roomCreated', ({ roomCode, players }) => {
        console.log(`Room created successfully! Code: ${roomCode}`);
        navigate(`/TriviaWaitingRoom?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}