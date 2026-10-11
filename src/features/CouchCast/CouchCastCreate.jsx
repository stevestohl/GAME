import { couchCastSocket } from "../../socket";
import { unlockVoice } from "../../voice.js";
import { startLobbyMusic, stopLobbyMusic } from "./lobbyMusic.js";

// Helper function to request fullscreen (Orientation lock removed)
const enterFullscreen = async () => {
    try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
    } catch (err) {
        console.warn("Fullscreen bypassed (likely an unsupported device or iOS Safari):", err.message);
    }
};

export function handleCreateCouchCast(playerName, navigate, setIsCreatingRoom, expansion = 'core') {
    const cleanName = 'Caster';
    console.log(`Request Couch Cast Room creation from ${cleanName} (deck: ${expansion})`);

    // Trigger fullscreen without locking orientation or scroll
    enterFullscreen();

    // We're inside the tap that starts the game: the moment browsers allow sound to be switched on
    unlockVoice();
    startLobbyMusic();

    if (setIsCreatingRoom) setIsCreatingRoom(true);

    // Set the timeout
    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        stopLobbyMusic();
        alert("The server is taking too long to wake up. Please try again.");
        couchCastSocket.off('roomCreated');
    }, 60000);

    const emitCreate = () => {
        couchCastSocket.emit('createRoom', { playerName: cleanName, expansion });
    };

    // Sets up the Success Listener
    couchCastSocket.off('roomCreated');
    couchCastSocket.once('roomCreated', ({ roomCode }) => {
        clearTimeout(timeout); // Stops timeout on success
        console.log(`CouchCast room created successfully! Code: ${roomCode}`);
        
        if (setIsCreatingRoom) setIsCreatingRoom(false);

        // 👈 ADDED: Strip away Bootstrap modal scroll locks before React Router takes us away
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';

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