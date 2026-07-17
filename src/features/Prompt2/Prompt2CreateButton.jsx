import { prompt2Socket } from "../../socket";

export function handleCreatePrompt2Room (playerName, navigate, setIsCreatingRoom) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    console.log(`Request Prompt2 Room creation for ${cleanName}`);

    if(setIsCreatingRoom) setIsCreatingRoom(true)

    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        alert("The server is taking too long to wake up. Please try again.");
        prompt2Socket.off('roomcreated'); // Clean up the listener
    }, 60000);
    
    if (!prompt2Socket.connected) {
        console.warn("Prompt2Socket socket is disconnected! Connecting...");
        prompt2Socket.connect();
    }

    prompt2Socket.off('roomcreated');
    
    // Create the room/event
    prompt2Socket.emit('createRoom');
    prompt2Socket.once('roomcreated', ({ roomCode }) => {
        console.log(`Prompt2 room created successfully! Code: ${roomCode}`);
        if(setIsCreatingRoom)setIsCreatingRoom(false)
        navigate(`/prompt2?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}