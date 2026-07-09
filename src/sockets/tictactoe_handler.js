// Local state for Tic-Tac-Toe only
const activeTictactoeRooms = {};

export default function registerTicTacToeHandlers(io, socket, { roomCode, playerName, playerRole }) {
    const code = roomCode.trim().toUpperCase();
    
    // Join logic...
    socket.join(code);
    // ... insert your existing Tic-Tac-Toe join logic here ...

    // Register game-specific listeners for this socket
    socket.on('makeMove', ({ board, isNext }) => {
      if (activeTictactoeRooms[code]) {
        activeTictactoeRooms[code].board = board;
        activeTictactoeRooms[code].isNext = isNext;
        io.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
      }
    });

    socket.on('resetMatch', () => {
      // reset logic
    });
}