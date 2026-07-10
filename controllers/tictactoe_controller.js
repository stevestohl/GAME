const activeTictactoeRooms = {};

export default function registerTictactoeNamespace(io) {
  io.on('connection', (socket) => {
    console.log("SERVER: A client reached the Tic-Tac-Toe engine!");

    // ==========================================
    // Room Joining Logic
    // ==========================================
    socket.on('joinRoom', (payload) => {
      const { roomCode, playerName, playerRole } = payload;
      
      // CHECK: Data presence
      if (!roomCode) {
        console.error("SERVER: Join attempt missing roomCode");
        return socket.emit('errorMsg', 'Room code is missing.');
      }
      
      const code = roomCode.trim().toUpperCase();
      console.log(`SERVER: joinRoom request for: ${code} by ${playerRole}`);

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
          console.log(`SERVER: Room ${code} created by host.`);
        }
        io.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
      } 
      else if (playerRole === 'guest') {
        // CHECK: Room existence
        if (activeTictactoeRooms[code]) {
          socket.join(code);
          
          // CHECK: Prevent joining full rooms
          if (activeTictactoeRooms[code].status === 'waiting') {
            activeTictactoeRooms[code].status = 'playing';
            activeTictactoeRooms[code].guestName = playerName || 'Anonymous';
            activeTictactoeRooms[code].guestId = socket.id;
            console.log(`SERVER: Guest joined room ${code}`);
          }
          io.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
        } else {
          console.warn(`SERVER: Room ${code} not found for guest.`);
          socket.emit('roomNotFound');
        }
      }
    });

    // ==========================================
    // Gameplay Listeners
    // ==========================================
    socket.on('makeMove', ({ roomCode, board, isNext }) => {
      const code = roomCode?.trim().toUpperCase();
      if (code && activeTictactoeRooms[code]) {
        activeTictactoeRooms[code].board = board;
        activeTictactoeRooms[code].isNext = isNext;
        io.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
      }
    });

    socket.on('resetMatch', ({ roomCode }) => {
      const code = roomCode?.trim().toUpperCase();
      if (code && activeTictactoeRooms[code]) {
        activeTictactoeRooms[code].board = Array(9).fill('');
        activeTictactoeRooms[code].isNext = true;
        io.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
      }
    });

    // ==========================================
    // Disconnection Handler
    // ==========================================
    socket.on('disconnect', () => {
      console.log(`[Tic-Tac-Toe] User Disconnected: ${socket.id}`);
      
      for (const roomCode in activeTictactoeRooms) {
        const room = activeTictactoeRooms[roomCode];
        if (room.hostId === socket.id || room.guestId === socket.id) {
          console.log(`SERVER: Cleaning up room ${roomCode} due to disconnect.`);
          io.to(roomCode).emit('roomNotFound'); 
          delete activeTictactoeRooms[roomCode];
          break;
        }
      }
    });
  });
}