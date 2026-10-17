import { mixupSocket } from "../../socket.js";
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

/** Creates a Temple Mix Up room (this device becomes the TV), then opens it */
export function createMixupRoom(navigate, setIsCreatingRoom, { totalRounds = 9 } = {}) {
    // We're inside a tap: the moment browsers allow fullscreen and sound to be switched on
    enterFullscreen();
    unlockVoice();
    startLobbyMusic();
    setIsCreatingRoom(true);

    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        stopLobbyMusic();
        mixupSocket.off('roomCreated');
        alert("The server is taking too long to wake up. Please try again.");
    }, 60000);

    const emitCreate = () => mixupSocket.emit('createRoom', { playerName: 'Caster', totalRounds });

    mixupSocket.off('roomCreated');
    mixupSocket.once('roomCreated', ({ roomCode }) => {
        clearTimeout(timeout);
        setIsCreatingRoom(false);
        // Strip away Bootstrap modal scroll locks before React Router takes us away
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
        navigate(`/mixup?room=${roomCode}&role=caster&name=Caster`);
    });

    if (mixupSocket.connected) emitCreate();
    else {
        mixupSocket.connect();
        mixupSocket.once('connect', emitCreate);
    }
}
