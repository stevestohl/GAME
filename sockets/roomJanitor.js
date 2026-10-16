// 🧹 Room janitor: keeps the server's memory clean.
//
// Every game keeps its rooms in memory. Without this, a room could hang around
// forever (a TV left on after the game, a game nobody finished, a game where
// everyone just closed their browser). Every few minutes the janitor closes:
//
//   - EMPTY rooms:    no device connected at all for EMPTY_LIMIT
//   - FINISHED games: sitting on the final scores for FINISHED_LIMIT
//   - IDLE rooms:     nobody has tapped anything for IDLE_LIMIT
//
// A game that's being played is never touched: any tap from any player
// counts as activity. Devices still in a closed room get the 'room_closed'
// message, which sends them back to the menu.
// (Finished games are already saved for the stats, so nothing is lost.)

const MINUTE = 60 * 1000;
const EMPTY_LIMIT = 10 * MINUTE;
const FINISHED_LIMIT = 30 * MINUTE;
const IDLE_LIMIT = 2 * 60 * MINUTE;
const SWEEP_EVERY = 5 * MINUTE;

/**
 * @param {object}   options
 * @param {string}   options.label       name for the server log, e.g. 'Couch Cast'
 * @param {object}   options.namespace   the Socket.IO namespace the game runs in
 * @param {object}   options.rooms       the game's rooms (room code -> room)
 * @param {Function} [options.isFinished] room => true when the game is over
 * @param {Function} [options.closeRoom]  (roomCode, message) => void, if the game has its own
 */
export function startRoomJanitor({ label, namespace, rooms, isFinished = () => false, closeRoom }) {
    const touch = (code) => {
        const room = typeof code === 'string' ? rooms[code.trim().toUpperCase()] : null;
        if (room) room.lastActivity = Date.now();
    };

    // Any event from a device counts as activity in the rooms it's in (or names)
    namespace.on('connection', (socket) => {
        socket.onAny((event, payload) => {
            socket.rooms.forEach(touch);
            if (payload && typeof payload === 'object') touch(payload.roomCode);
        });
    });

    const close = (code, message) => {
        if (closeRoom) {
            closeRoom(code, message);
        } else {
            const room = rooms[code];
            if (room?.timerId) clearTimeout(room.timerId);
            if (room?.destroyTimer) clearTimeout(room.destroyTimer);
            namespace.to(code).emit('room_closed', { roomCode: code, message });
            namespace.in(code).socketsLeave(code);
        }
        delete rooms[code]; // in case the game's own closeRoom left it behind
    };

    const sweep = () => {
        const now = Date.now();
        Object.keys(rooms).forEach((code) => {
            const room = rooms[code];
            if (!room || typeof room !== 'object') return;

            // Rooms made before the janitor first saw them start their clocks now
            room.lastActivity = room.lastActivity || now;

            const connected = namespace.adapter.rooms.get(code)?.size || 0;
            room.emptySince = connected === 0 ? (room.emptySince || now) : null;

            let finished = false;
            try { finished = !!isFinished(room); } catch { finished = false; }
            room.finishedAt = finished ? (room.finishedAt || now) : null;

            let reason = null;
            if (room.emptySince && now - room.emptySince >= EMPTY_LIMIT) reason = 'empty';
            else if (room.finishedAt && now - room.finishedAt >= FINISHED_LIMIT) reason = 'finished';
            else if (now - room.lastActivity >= IDLE_LIMIT) reason = 'idle';
            if (!reason) return;

            console.log(`[Room Janitor] ${label}: closing ${code} (${reason}).`);
            close(code, reason === 'finished' ? 'That game has ended.' : 'That game was closed because it sat idle.');
        });
    };

    // unref(): the sweep never keeps the server running on its own
    setInterval(sweep, SWEEP_EVERY).unref();
    return { sweep };
}
