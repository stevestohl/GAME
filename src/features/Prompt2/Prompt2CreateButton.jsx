import { prompt2Socket } from "../../socket";

export function handleCreatePrompt2Room (playerName, navigate) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    console.log(`Request Prompt2 Room creation for ${cleanName}`);
    
    if (!prompt2Socket.connected) {
        console.warn("Trivia socket is disconnected! Connecting...");
        prompt2Socket.connect();
    }

    prompt2Socket.off('roomcreated');
    
    // Create the room/event
    prompt2Socket.emit('createRoom');
    prompt2Socket.once('roomcreated', ({ roomCode }) => {
        console.log(`Prompt2 room created successfully! Code: ${roomCode}`);
        // FIXED: Route changed from /TriviaWaitingRoom to /prompt2
        navigate(`/prompt2?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}