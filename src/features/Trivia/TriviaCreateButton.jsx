import { triviaSocket } from '../../socket.js'; 

export function handleCreateTriviaRoom(playerName, navigate, setIsCreatingRoom) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    
    if(setIsCreatingRoom) setIsCreatingRoom(true)
    
    console.log(`Requesting Trivia Room creation for: ${cleanName}`);
    
    // Ensure the shared socket instance is open
    if (!triviaSocket.connected) {
        console.warn("Trivia socket is disconnected! Connecting...");
        triviaSocket.connect();
    }

    // Clean up any stale listeners on the shared socket
    triviaSocket.off('roomCreated');
    triviaSocket.off('connect_error')

    // Close Modal if connection fails
    triviaSocket.once('connect_error', (err)=> {
        console.error("Trivia Socket connection error:", err)
        if (setIsCreatingRoom) setIsCreatingRoom(false)
        alert("Could not connect to the Trivia server.")
    })

    // Fire the creation event
    triviaSocket.emit('createRoom', {hostName: cleanName});

    // Listen once for the backend room blueprint assignment
    triviaSocket.once('roomCreated', ({ roomCode }) => {
        console.log(`Trivia room created successfully! Code: ${roomCode}`);
        navigate(`/TriviaWaitingRoom?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}