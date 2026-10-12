import { triviaCastSocket } from "../../socket.js";
import { unlockVoice } from "../../voice.js";
import { startLobbyMusic, stopLobbyMusic } from "../CouchCast/lobbyMusic.js";

// Ask for fullscreen; phones that don't allow it (iOS Safari) just carry on
const enterFullscreen = async () => {
    try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
    } catch (err) {
        console.warn("Fullscreen bypassed:", err.message);
    }
};

// Called from the tap on a deck: creates the room and opens the TV screen
export function handleCreateTriviaCast(navigate, setIsCreatingRoom, expansion = 'core', totalRounds = 5) {
    console.log(`Request Trivia Cast room (deck: ${expansion}, questions: ${totalRounds})`);

    // We're inside a tap: the moment browsers allow fullscreen and sound to be switched on
    enterFullscreen();
    unlockVoice();
    startLobbyMusic();

    setIsCreatingRoom(true);

    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        stopLobbyMusic();
        alert("The server is taking too long to wake up. Please try again.");
        triviaCastSocket.off('roomCreated');
    }, 60000);

    const emitCreate = () => {
        triviaCastSocket.emit('createRoom', { playerName: 'Caster', expansion, totalRounds });
    };

    triviaCastSocket.off('roomCreated');
    triviaCastSocket.once('roomCreated', ({ roomCode }) => {
        clearTimeout(timeout);
        setIsCreatingRoom(false);

        // Strip away Bootstrap modal scroll locks before React Router takes us away
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';

        navigate(`/triviacast?room=${roomCode}&role=caster&name=Caster`);
    });

    if (triviaCastSocket.connected) {
        emitCreate();
    } else {
        triviaCastSocket.connect();
        triviaCastSocket.once('connect', emitCreate);
    }
}
