import { io } from 'socket.io-client'

const SOCKET_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://game-temple.org'

const socket = io(SOCKET_URL, {
    transports: window.location.hostname === 'Localhost'
    ? ['polling', 'websocket']
    : ['websocket']

})

export default socket