// In-memory state storage for Tic-Tac-Toe game rooms
const activeTictactoeRooms = {};

const generateTttRoomCode = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  let code = '';
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    code += alphabet.charAt(randomIndex);
  }
  return `T${code}`;
};

export default function registerTicTacToeNamespace(namespace) {
  namespace.on('connection', (socket) => {
    console.log("SERVER: A client reached the Tic-Tac-Toe engine!");
    
    // 1. Room Creation
    socket.on('createRoom', ({ hostName }) => {
      const roomCode = generateTttRoomCode();

      activeTictactoeRooms[roomCode] = {
        board: Array(9).fill(''), 
        isNext: true,
        status: 'waiting',         
        hostName: hostName || 'Anonymous',
        hostId: socket.id,
        guestName: '',
        guestId: ''
      };

      console.log(`SERVER: Room ${roomCode} created by ${hostName}`);
      socket.join(roomCode);
      socket.emit('roomCreated', { roomCode });
    });

    // 2. Room Joining
    socket.on('joinRoom', (payload) => {
      const { roomCode, playerName, playerRole } = payload;
      
      if (!roomCode) {
        return socket.emit('errorMsg', 'Room code is missing.');
      }
      
      const code = roomCode.trim().toUpperCase();

      if (playerRole === 'host') {
        socket.join(code);
        if (activeTictactoeRooms[code]) {
          activeTictactoeRooms[code].hostId = socket.id; // Re-sync socket ID
          namespace.to(code).emit('roomUpdate', activeTictactoeRooms[code]);
        }
      } else if (playerRole === 'guest') {
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

    // 3. Gameplay Listeners
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

    socket.on('leaveRoom', ({ roomCode, playerName }) => {
        const code = roomCode?.trim().toUpperCase();
        console.log(`SERVER: Received leaveRoom for code [${code}] from [${playerName}]`);

        if (code && activeTictactoeRooms[code]) {
            console.log(`SERVER: Emitting playerLeft to room channel [${code}]`);
            
            // Broadcasts to all sockets in 'code' EXCEPT the leaver
            socket.to(code).emit('playerLeft', { playerName: playerName || 'Your opponent' });
            
            delete activeTictactoeRooms[code];
        } else {
            console.warn(`SERVER: Could not find room [${code}] to clean up on leave.`);
        }
        
        if (code) socket.leave(code);
    });

    // 5. Disconnection / Tab Closed Handler
    socket.on('disconnect', () => {
      for (const roomCode in activeTictactoeRooms) {
        const room = activeTictactoeRooms[roomCode];
        if (room.hostId === socket.id || room.guestId === socket.id) {
          const leaverName = room.hostId === socket.id ? room.hostName : room.guestName;
          
          // Notify remaining player that opponent disconnected
          socket.to(roomCode).emit('playerLeft', { playerName: leaverName });
          delete activeTictactoeRooms[roomCode];
          break;
        }
      }
    });
  });
}