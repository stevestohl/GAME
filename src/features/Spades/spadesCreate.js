import { spadesSocket } from "../../socket.js";
import { unlockVoice } from "../../voice.js";
import { enterFullscreen } from "../../fullscreen.js";
import { startLobbyMusic, stopLobbyMusic, lobbyTrackFor } from "../CouchCast/lobbyMusic.js";

/** Creates a Spades room (this device becomes the TV), then opens it */
export function createSpadesRoom(navigate, setIsCreatingRoom, { target = 300 } = {}) {
    // We're inside a tap: the moment browsers allow fullscreen and sound to be switched on
    enterFullscreen();
    unlockVoice();
    startLobbyMusic(lobbyTrackFor('spades'));
    setIsCreatingRoom(true);

    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        stopLobbyMusic();
        spadesSocket.off('roomCreated');
        alert("The server is taking too long to wake up. Please try again.");
    }, 60000);

    const emitCreate = () => spadesSocket.emit('createRoom', { playerName: 'Caster', target });

    spadesSocket.off('roomCreated');
    spadesSocket.once('roomCreated', ({ roomCode }) => {
        clearTimeout(timeout);
        setIsCreatingRoom(false);
        // Strip away Bootstrap modal scroll locks before React Router takes us away
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
        navigate(`/spades?room=${roomCode}&role=caster&name=Caster`);
    });

    if (spadesSocket.connected) emitCreate();
    else {
        spadesSocket.connect();
        spadesSocket.once('connect', emitCreate);
    }
}
