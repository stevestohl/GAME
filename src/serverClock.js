// ⏱️ The server's idea of "now". Countdowns end at the server's `endTime`, but a phone or computer
// whose own clock is a few seconds off would count down wrong (and a judge's phone could even
// pick a prompt for them before their time was up). Every room update carries `serverTime`,
// so screens count down with the server's clock instead of their own.

let offset = 0;   // server clock minus this device's clock, in ms

/** Note the server's time from a room update (`room.serverTime`) */
export function syncServerClock(serverTime) {
    if (typeof serverTime === 'number' && Number.isFinite(serverTime)) offset = serverTime - Date.now();
}

/** Like Date.now(), but on the server's clock */
export const serverNow = () => Date.now() + offset;

/** A time on the server's clock (like endTime), as this device's clock would show it */
export const toDeviceTime = (serverTime) => (serverTime ? serverTime - offset : serverTime);

/** Keep the clock in step with a game's room updates */
export function watchServerClock(socket) {
    socket.on('room_updated', (room) => syncServerClock(room?.serverTime));
    socket.on('sync_game_state', (payload) => syncServerClock(payload?.roomData?.serverTime));
}
