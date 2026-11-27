import { wordWeaveSocket } from "../../socket.js";
import { unlockVoice } from "../../voice.js";
import { enterFullscreen } from "../../fullscreen.js";
import { startLobbyMusic, stopLobbyMusic, lobbyTrackFor } from "../CouchCast/lobbyMusic.js";

/**
 * Creates a Word Weave room, then opens it.
 *   mode 'tv'     -> this device becomes the TV
 *   mode 'phones' -> this device joins as the first player (the room leader)
 */
export function createWordWeaveRoom(navigate, setIsCreatingRoom, { mode, size, roundSeconds, totalRounds, playerName = 'Host' }) {
    const onTv = mode === 'tv';

    // We're inside a tap: the moment browsers allow fullscreen and sound to be switched on
    if (onTv) {
        enterFullscreen();
        unlockVoice();
        startLobbyMusic(lobbyTrackFor('wordweave'));
    }
    setIsCreatingRoom(true);

    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        if (onTv) stopLobbyMusic();
        wordWeaveSocket.off('roomCreated');
        alert("The server is taking too long to wake up. Please try again.");
    }, 60000);

    const emitCreate = () => wordWeaveSocket.emit('createRoom', {
        mode, size, roundSeconds, totalRounds, playerName: onTv ? 'Caster' : playerName,
    });

    wordWeaveSocket.off('roomCreated');
    wordWeaveSocket.once('roomCreated', ({ roomCode }) => {
        clearTimeout(timeout);
        setIsCreatingRoom(false);
        // Strip away Bootstrap modal scroll locks before React Router takes us away
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
        if (onTv) navigate(`/wordweave?room=${roomCode}&role=caster&name=Caster`);
        else navigate(`/wordweave?room=${roomCode}&role=guest&name=${encodeURIComponent(playerName)}`);
    });

    if (wordWeaveSocket.connected) emitCreate();
    else {
        wordWeaveSocket.connect();
        wordWeaveSocket.once('connect', emitCreate);
    }
}
