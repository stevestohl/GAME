// In-memory state storage for Tic-Tac-Toe game rooms
const activeTictactoeRooms = {};

// ==========================================
// Room Code Generator Helper
// ==========================================
const generateTttRoomCode = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  let code = '';
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    code += alphabet.charAt(randomIndex);
  }
  return `T${code}`; // 'T' prefix for Tic-Tac-Toe
};

// Primary Real-Time Namespace Handler (Matches server.js casing)
export default function registerTicTacToeNamespace(namespace) {
  namespace.on('connection', (socket) => {
    console.log("SERVER: A client reached the Tic-Tac-Toe engine!");
    
    // ==========================================
    // 1. Room Creation Logic
    // ==========================================
    socket.on('createRoom', ({ hostName }) => {
      const roomCode = generateTttRoomCode();
    
      // Initialize the core room object layout
      activeTictactoeRooms[roomCode] = {
        board: Array(9).fill(''), 
        isNext: true,
        status: 'waiting',         
        hostName: hostName || 'Anonymous',
        hostId: socket.id,
        guestName: '',
        guestId: ''
      };

      console.log(`SERVER: Room ${roomCode} successfully created by host.`);

      // Host socket into unique room channel
      socket.join(roomCode);

      // Emit the generated code back to the creator socket
      socket.emit('roomCreated', { roomCode });
    });

    // ==========================================
    // 2. Room Joining Logic
    // ==========================================
    socket.on('joinRoom', (payload) => {
      const { roomCode, playerName, playerRole } = payload;
      
      if (!roomCode) {
        console.error("SERVER: Join attempt missing roomCode");
        return socket.emit('errorMsg', 'Room code is missing.');
      }
      
      const code = roomCode.trim().toUpperCase();
      console.log(`SERVER: joinRoom request for: ${code} by ${playerRole}`);

      if (playerRole === 'host') {
        // The room was already constructed by 'createRoom', so just re-sync/join them
        socket.join(code);
        namespace.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
      } else if (playerRole === 'guest') {
        if (activeTictactoeRooms[code]) {
          socket.join(code);
          
          if (activeTictactoeRooms[code].status === 'waiting') {
            activeTictactoeRooms[code].status = 'playing';
            activeTictactoeRooms[code].guestName = playerName || 'Anonymous';
            activeTictactoeRooms[code].guestId = socket.id;
            console.log(`SERVER: Guest joined room ${code}`);
          }
          namespace.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
        } else {
          console.warn(`SERVER: Room ${code} not found for guest.`);
          socket.emit('roomNotFound');
        }
      }
    });

    // ==========================================
    // 3. Gameplay Listeners
    // ==========================================
    socket.on('makeMove', ({ roomCode, board, isNext }) => {
      const code = roomCode?.trim().toUpperCase();
      if (code && activeTictactoeRooms[code]) {
        activeTictactoeRooms[code].board = board;
        activeTictactoeRooms[code].isNext = isNext;
        namespace.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
      }
    });

    socket.on('resetMatch', ({ roomCode }) => {
      const code = roomCode?.trim().toUpperCase();
      if (code && activeTictactoeRooms[code]) {
        activeTictactoeRooms[code].board = Array(9).fill('');
        activeTictactoeRooms[code].isNext = true;
        namespace.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
      }
    });

    // ==========================================
    // 4. Disconnection Handler
    // ==========================================
    socket.on('disconnect', () => {
      console.log(`[Tic-Tac-Toe] User Disconnected: ${socket.id}`);
      
      for (const roomCode in activeTictactoeRooms) {
        const room = activeTictactoeRooms[roomCode];
        if (room.hostId === socket.id || room.guestId === socket.id) {
          console.log(`SERVER: Cleaning up room ${roomCode} due to disconnect.`);
          namespace.to(roomCode).emit('roomNotFound'); 
          delete activeTictactoeRooms[roomCode];
          break;
        }
      }
    });
  });
}