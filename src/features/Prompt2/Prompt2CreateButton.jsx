import { prompt2Socket } from "../../socket";

export function handleCreatePrompt2Room(playerName, navigate, setIsCreatingRoom) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    console.log(`Request Prompt2 Room creation for ${cleanName}`);

    if (setIsCreatingRoom) setIsCreatingRoom(true);

    // 1. Set the timeout
    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        alert("The server is taking too long to wake up. Please try again.");
        prompt2Socket.off('roomcreated');
    }, 60000);

    // 2. Helper to emit the create event
    const emitCreate = () => {
        prompt2Socket.emit('createRoom', { playerName: cleanName });
    };

    // 3. Setup the Success Listener
    prompt2Socket.off('roomcreated'); // Clean slate
    prompt2Socket.once('roomcreated', ({ roomCode }) => {
        clearTimeout(timeout); // IMPORTANT: Stop the timeout if we succeed!
        console.log(`Prompt2 room created successfully! Code: ${roomCode}`);
        if (setIsCreatingRoom) setIsCreatingRoom(false);
        navigate(`/prompt2?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });

    // 4. Handle Connection
    if (prompt2Socket.connected) {
        emitCreate();
    } else {
        console.warn("Socket disconnected! Waiting for connection to emit...");
        prompt2Socket.connect();
        
        // Wait until we are connected, THEN emit
        prompt2Socket.once('connect', () => {
            console.log("Socket connected, now emitting createRoom...");
            emitCreate();
        });
    }
}