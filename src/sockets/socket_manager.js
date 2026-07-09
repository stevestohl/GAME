import registerTriviaHandlers from './trivia_handler.js';
import registerTicTacToeHandlers from './tictactoe_handler.js';
import registerPrompt2Handlers from './prompt2_handler.js';

export default function initializeSockets(io) {
  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Delegate events based on the room prefix
    socket.on('joinRoom', (payload) => {
      const { roomCode } = payload;
      if (!roomCode) return socket.emit('errorMsg', 'Room code missing.');

      const code = roomCode.trim().toUpperCase();

      if (code.startsWith('T')) {
        registerTicTacToeHandlers(io, socket, payload);
      } else if (code.startsWith('R')) {
        registerTriviaHandlers(io, socket, payload);
      } else if (code.startsWith('P')) { // New game prefix
        registerPrompt2Handlers(io, socket, payload);
      } else {
        socket.emit('errorMsg', 'Invalid room code format.');
      }
    });

    socket.on('disconnect', () => {
       console.log(`User Disconnected: ${socket.id}`);
       // You can emit a global disconnect event here that individual handlers listen to for cleanup
    });
  });
}