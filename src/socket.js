import { io } from 'socket.io-client';

const SOCKET_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://game-temple-backend.onrender.com'; 

// Render handles both polling and websockets
const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: false 
});

export const triviaSocket = io(`${SOCKET_URL}/trivia`, {
    transports: ['websocket', 'polling'],
    autoConnect: false
})

export const prompt2Socket = io(`${SOCKET_URL}/prompt2`, {
    transports: ['websocket', 'polling'],
    autoConnect: false
})
export default socket;