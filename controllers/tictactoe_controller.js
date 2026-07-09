// Localized state for Tic-Tac-Toe only
const activeTictactoeRooms = {};

export default function registerTictactoeNamespace(namespace) {
  namespace.on('connection', (socket) => {
    console.log(`Tic-Tac-Toe User Connected: ${socket.id}`);

    // ==========================================
    // Room Joining Logic
    // ==========================================
    socket.on('joinRoom', ({ roomCode, playerName, playerRole }) => {
      if (!roomCode) return socket.emit('errorMsg', 'Room code is missing.');
      
      const code = roomCode.trim().toUpperCase();

      if (playerRole === 'host') {
        socket.join(code);
        if (!activeTictactoeRooms[code]) {
          activeTictactoeRooms[code] = {
            board: Array(9).fill(''),
            isNext: true,
            status: 'waiting',
            hostName: playerName || 'Anonymous',
            hostId: socket.id,
            guestName: '',
            guestId: ''
          };
        }
        namespace.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
      } 
      else if (playerRole === 'guest') {
        if (activeTictactoeRooms[code]) {
          socket.join(code);
          if (activeTictactoeRooms[code].status === 'waiting') {
            activeTictactoeRooms[code].status = 'playing';
            activeTictactoeRooms[code].guestName = playerName || 'Anonymous';
            activeTictactoeRooms[code].guestId = socket.id;
          }
          namespace.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
        } else {
          socket.emit('roomNotFound');
        }
      }
    });

    // ==========================================
    // Gameplay Listeners
    // ==========================================
    socket.on('makeMove', ({ roomCode, board, isNext }) => {
      const code = roomCode.trim().toUpperCase();
      if (activeTictactoeRooms[code]) {
        activeTictactoeRooms[code].board = board;
        activeTictactoeRooms[code].isNext = isNext;
        namespace.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
      }
    });

    socket.on('resetMatch', ({ roomCode }) => {
      const code = roomCode.trim().toUpperCase();
      if (activeTictactoeRooms[code]) {
        activeTictactoeRooms[code].board = Array(9).fill('');
        activeTictactoeRooms[code].isNext = true;
        namespace.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
      }
    });

    // ==========================================
    // Disconnection Handler (Tic-Tac-Toe Only)
    // ==========================================
    socket.on('disconnect', () => {
      console.log(`Tic-Tac-Toe User Disconnected: ${socket.id}`);
      
      // Cleanup Tic-Tac-Toe Rooms specific to this namespace
      for (const roomCode in activeTictactoeRooms) {
        const room = activeTictactoeRooms[roomCode];
        if (room.hostId === socket.id || room.guestId === socket.id) {
          namespace.to(roomCode).emit('roomNotFound'); 
          delete activeTictactoeRooms[roomCode];
          break;
        }
      }
    });
  });
}