import { triviaSocket as socket } from '../../socket.js';
import { QUESTION_OPTIONS } from '../../cardDecks.js';
import { DEFAULT_LEVEL } from '../Menu/LevelPicker.jsx';

/**
 * 📱❔ Starts a Trivia Cast room on just phones (the trivia game): whoever starts it plays too, as the host.
 * Called from the Trivia Cast setup screen when "Just phones" is picked.
 */
export function handleCreateTriviaRoom(playerName, navigate, setIsCreatingRoom, expansion = 'core', totalRounds = QUESTION_OPTIONS[0], level = DEFAULT_LEVEL) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';

    if (!socket) {
        console.error("Socket instance is undefined! Check import path in socket.js");
        alert("Unable to connect to game server. Please refresh and try again.");
        if (setIsCreatingRoom) setIsCreatingRoom(false);
        return;
    }

    if (setIsCreatingRoom) setIsCreatingRoom(true);
    if (!socket.connected) socket.connect();

    // Clean up stale listeners
    socket.off('roomCreated');
    socket.off('connect_error');

    socket.once('connect_error', (err) => {
        console.error("Trivia Socket connection error:", err);
        if (setIsCreatingRoom) setIsCreatingRoom(false);
        alert("Could not connect to the Trivia server.");
    });

    socket.emit('createRoom', { hostName: cleanName, expansion, totalRounds, level });

    socket.once('roomCreated', ({ roomCode }) => {
        navigate(`/trivia?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });
}
