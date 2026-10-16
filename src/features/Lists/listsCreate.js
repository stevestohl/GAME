import { listsSocket } from "../../socket.js";
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

/**
 * Creates a List Cast or Listopia room, then opens it.
 *   mode 'cast'   -> this device becomes the TV
 *   mode 'phones' -> this device joins as the first player (the room leader)
 */
export function createListRoom(navigate, setIsCreatingRoom, { mode, expansion = 'core', totalRounds = 5, playerName = 'Host' }) {
    const isCast = mode === 'cast';

    // We're inside a tap: the moment browsers allow fullscreen and sound to be switched on
    if (isCast) {
        enterFullscreen();
        unlockVoice();
        startLobbyMusic();
    }

    setIsCreatingRoom(true);

    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        if (isCast) stopLobbyMusic();
        alert("The server is taking too long to wake up. Please try again.");
        listsSocket.off('roomCreated');
    }, 60000);

    const emitCreate = () => {
        listsSocket.emit('createRoom', { mode, playerName: isCast ? 'Caster' : playerName, expansion, totalRounds });
    };

    listsSocket.off('roomCreated');
    listsSocket.once('roomCreated', ({ roomCode }) => {
        clearTimeout(timeout);
        setIsCreatingRoom(false);

        // Strip away Bootstrap modal scroll locks before React Router takes us away
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';

        if (isCast) navigate(`/listcast?room=${roomCode}&role=caster&name=Caster`);
        else navigate(`/listopia?room=${roomCode}&name=${encodeURIComponent(playerName)}`);
    });

    if (listsSocket.connected) {
        emitCreate();
    } else {
        listsSocket.connect();
        listsSocket.once('connect', emitCreate);
    }
}
