import { townSocket } from "../../socket.js";
import { unlockVoice } from "../../voice.js";
import { enterFullscreen } from "../../fullscreen.js";
import { startLobbyMusic, stopLobbyMusic, lobbyTrackFor } from "../CouchCast/lobbyMusic.js";

/** Creates a Temple Town room (this device becomes the TV), then opens it */
export function createTownRoom(navigate, setIsCreatingRoom, { totalRounds = 8 } = {}) {
    // We're inside a tap: the moment browsers allow fullscreen and sound to be switched on
    enterFullscreen();
    unlockVoice();
    startLobbyMusic(lobbyTrackFor('town'));
    setIsCreatingRoom(true);

    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        stopLobbyMusic();
        townSocket.off('roomCreated');
        alert("The server is taking too long to wake up. Please try again.");
    }, 60000);

    const emitCreate = () => townSocket.emit('createRoom', { playerName: 'Caster', totalRounds });

    townSocket.off('roomCreated');
    townSocket.once('roomCreated', ({ roomCode }) => {
        clearTimeout(timeout);
        setIsCreatingRoom(false);
        // Strip away Bootstrap modal scroll locks before React Router takes us away
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
        navigate(`/town?room=${roomCode}&role=caster&name=Caster`);
    });

    if (townSocket.connected) emitCreate();
    else {
        townSocket.connect();
        townSocket.once('connect', emitCreate);
    }
}
