// CouchCastCreate.jsx

// Correctly importing the specific CouchCast namespace socket
import { couchCastSocket } from "../../socket";

export function handleCreateCouchCast(playerName, navigate, setIsCreatingRoom) {
    const cleanName = 'Caster';
    console.log(`Request Couch Cast Room creation from ${cleanName}`);

    if (setIsCreatingRoom) setIsCreatingRoom(true);

    // Set the timeout
    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        alert("The server is taking too long to wake up. Please try again.");
        couchCastSocket.off('roomCreated');
    }, 60000);

    const emitCreate = () => {
        couchCastSocket.emit('createRoom', { playerName: cleanName });
    };

    // Sets up the Success Listener
    couchCastSocket.off('roomCreated');
    couchCastSocket.once('roomCreated', ({ roomCode }) => {
        clearTimeout(timeout); // Stops timeout on success
        console.log(`CouchCast room created successfully! Code: ${roomCode}`);
        if (setIsCreatingRoom) setIsCreatingRoom(false);
        navigate(`/couchcast?room=${roomCode}&role=caster&name=${encodeURIComponent(cleanName)}`);
    });

    // Handle Connection
    if (couchCastSocket.connected) {
        emitCreate();
    } else {
        console.warn("Socket disconnected! Waiting for connection to emit...");
        couchCastSocket.connect();
        
        couchCastSocket.once('connect', () => {
            console.log("Socket connected, now emitting createRoom...");
            emitCreate();
        });
    }
}