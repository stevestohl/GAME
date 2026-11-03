import { io } from 'socket.io-client';
import { watchServerClock } from './serverClock.js';
import { getToken } from './auth.js';

const SOCKET_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5005'
    : 'https://game-temple-backend.onrender.com'; 

// Render handles both polling and websockets
const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: false 
});

export const tictactoeSocket = io(`${SOCKET_URL}/tictactoe`, {
    transports: ['websocket', 'polling'],
    autoConnect: false
})

export const triviaSocket = io(`${SOCKET_URL}/trivia`, {
    transports: ['websocket', 'polling'],
    autoConnect: false
})

export const prompt2Socket = io(`${SOCKET_URL}/prompt2`, {
    transports: ['websocket', 'polling'],
    autoConnect: false
})

export const couchCastSocket = io(`${SOCKET_URL}/couchcast`, {
    transports: ['websocket', 'polling'],
    autoConnect: false
})
// ⏱️ Couch Cast's countdowns follow the server's clock (see serverClock.js)
watchServerClock(couchCastSocket)
export const triviaCastSocket = io(`${SOCKET_URL}/triviacast`, {
    transports: ['websocket', 'polling'],
    autoConnect: false
})
// 🔀 Couch Cast Re-Shuffled (experimental)
export const reshuffledSocket = io(`${SOCKET_URL}/reshuffled`, {
    transports: ['websocket', 'polling'],
    autoConnect: false
})
// 🎪 Temple Mix Up
export const mixupSocket = io(`${SOCKET_URL}/mixup`, {
    transports: ['websocket', 'polling'],
    autoConnect: false
})
// List Cast and Listopia
export const listsSocket = io(`${SOCKET_URL}/lists`, {
    transports: ['websocket', 'polling'],
    autoConnect: false
})

// 🔑 Starting a room: every game's createRoom carries the sign-in token (if any), and a refused host
// (a game or deck hidden from the public, see db/gameVisibility.js on the server) goes back to the menu
const allSockets = [socket, tictactoeSocket, triviaSocket, prompt2Socket, couchCastSocket, triviaCastSocket, reshuffledSocket, mixupSocket, listsSocket];
allSockets.forEach((s) => {
    const send = s.emit.bind(s);
    s.emit = (event, data, ...rest) => (event === 'createRoom' ? send(event, { ...data, authToken: getToken() }, ...rest) : send(event, data, ...rest));
    s.on('gameHidden', () => {
        window.alert("That game isn't available right now.");
        window.location.assign('/home');
    });
});

export default socket;