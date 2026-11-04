import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const ROOM_NOT_FOUND = 'Room not found!';

// 📱 Where a player's phone goes when its room doesn't exist: a new name wouldn't help, the code is the problem.
// Use it as navigate(...joinAgain(roomCode)). The join page starts empty, so they can type the right code.
export const joinAgain = (roomCode) => ['/join', {
    replace: true,
    state: { toastMessage: `We couldn't find room ${roomCode}. It may have ended, so double-check the code.` },
}];

// How long a TV waits to hear about its room before giving up (a refresh of a live game answers right away)
const NO_ANSWER_MS = 15000;

// 📺 Browsers love to bring back the last page, so a TV link can come back long after its game ended.
// When this TV's room is gone (or never answers), head to the menu instead of "Powering up" forever.
// `replace` keeps the dead link out of the history, so Back doesn't land on it again.
export default function useRoomGone(socket, roomCode, hasRoom) {
    const navigate = useNavigate();
    const hasLeft = useRef(false);

    useEffect(() => {
        const goHome = (message) => {
            // Some TVs read the code from the address bar, so leaving makes it look like there's no code at all:
            // only the first trip home counts, or that second one would wipe out the message
            if (hasLeft.current) return;
            hasLeft.current = true;
            navigate('/home', { replace: true, state: { toastMessage: message } });
        };
        if (!roomCode) {
            goHome();
            return undefined;
        }

        const handleJoinError = (msg) => {
            if (msg === ROOM_NOT_FOUND) goHome('That game has ended.');
        };
        // A device that just started a new game can still hear its old room closing: only ours counts
        const handleRoomClosed = ({ roomCode: closedCode, message } = {}) => {
            if (closedCode?.toUpperCase() === roomCode.toUpperCase()) goHome(message || 'That game has ended.');
        };
        socket.on('joinError', handleJoinError);
        socket.on('room_closed', handleRoomClosed);
        const noAnswer = hasRoom ? null : setTimeout(() => goHome("We couldn't find that game."), NO_ANSWER_MS);

        return () => {
            socket.off('joinError', handleJoinError);
            socket.off('room_closed', handleRoomClosed);
            clearTimeout(noAnswer);
        };
    }, [socket, roomCode, hasRoom, navigate]);
}
