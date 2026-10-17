import { reshuffledSocket } from "../../socket";
import { unlockVoice } from "../../voice.js";
import { startLobbyMusic, stopLobbyMusic } from "../CouchCast/lobbyMusic.js";

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

export function handleCreateReshuffled(playerName, navigate, setIsCreatingRoom, expansion = 'core', totalRounds = 3) {
    const cleanName = 'Caster';
    console.log(`Request Couch Cast Re-Shuffled Room creation from ${cleanName} (deck: ${expansion}, rounds: ${totalRounds})`);

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
        reshuffledSocket.off('roomCreated');
    }, 60000);

    const emitCreate = () => {
        reshuffledSocket.emit('createRoom', { playerName: cleanName, expansion, totalRounds });
    };

    // Sets up the Success Listener
    reshuffledSocket.off('roomCreated');
    reshuffledSocket.once('roomCreated', ({ roomCode }) => {
        clearTimeout(timeout); // Stops timeout on success
        console.log(`Reshuffled room created successfully! Code: ${roomCode}`);
        
        if (setIsCreatingRoom) setIsCreatingRoom(false);

        // 👈 ADDED: Strip away Bootstrap modal scroll locks before React Router takes us away
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';

        navigate(`/reshuffled?room=${roomCode}&role=caster&name=${encodeURIComponent(cleanName)}`);
    });

    // Handle Connection
    if (reshuffledSocket.connected) {
        emitCreate();
    } else {
        console.warn("Socket disconnected! Waiting for connection to emit...");
        reshuffledSocket.connect();
        
        reshuffledSocket.once('connect', () => {
            console.log("Socket connected, now emitting createRoom...");
            emitCreate();
        });
    }
}