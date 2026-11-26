import { prompt2Socket } from '../../socket.js';

/**
 * 📱🃏 Starts a Couch Cast room on just phones (the prompt2 game): whoever starts it plays too, as the host.
 * Called from the Couch Cast setup screen when "Just phones" is picked.
 */
export function handleCreatePrompt2Room(playerName, navigate, setIsCreatingRoom, expansion = 'core', totalRounds) {
    const cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
    setIsCreatingRoom(true);

    const timeout = setTimeout(() => {
        setIsCreatingRoom(false);
        alert("The server is taking too long to wake up. Please try again.");
        prompt2Socket.off('roomcreated');
    }, 60000);

    const emitCreate = () => prompt2Socket.emit('createRoom', { playerName: cleanName, expansion, totalRounds });

    prompt2Socket.off('roomcreated');
    prompt2Socket.once('roomcreated', ({ roomCode }) => {
        clearTimeout(timeout);
        setIsCreatingRoom(false);
        navigate(`/prompt2?room=${roomCode}&role=host&name=${encodeURIComponent(cleanName)}`);
    });

    if (prompt2Socket.connected) emitCreate();
    else {
        prompt2Socket.connect();
        prompt2Socket.once('connect', emitCreate);
    }
}
