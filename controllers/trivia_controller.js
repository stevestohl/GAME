import Temple_Trivia from "../models/Temple_Trivia.js";

// const activeRooms = {}

const activeRooms = {};

const getAllTrivia = async (req, res) => {
  try {
    const triviaDocs = await Temple_Trivia.find({})

    res.status(200).json({
      success: true,
      count: triviaDocs.length,
      data:triviaDocs,
      console: "Get Trivia Working"
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      console: err.message
    })
  }
}

// Fetch Trivia document by MongoDB ObjectID
const getTriviaByID = async (req, res) => {
  try {
    const triviaDoc = await Temple_Trivia.findById(req.params.id)

    if(!triviaDoc) {
      return res.status(404).json({ 
        success: false,
        message: "Trivia question not found"
      })
    }
    res.status(200).json({
      success: true,
      data: triviaDoc
    })

  } catch (err) {
    res.status(500).json({
      success: false,
      console: err.message
    })
  }
}

// Health check for Trivia Socket
const getTriviaBackendStatus = async (req, res) => {
  try {
    res.status(200).json({
      status:"online",
      message: "Welcome to the Trivia-Temple API!"
    })
  } catch (err) {
      res.status(500).json({ error: err.message })
  }
}

// Socket Room Helper: Code Generator
const generateRoomCode = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  let code = '';

  for (let i=0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length)
    code += alphabet.charAt(randomIndex)
  }

  return `R${code}`
};

const createRoomLogic = (socket, activeRooms) => {
  const roomCode = generateRoomCode();


  activeRooms[roomCode] = { 
    players: [],
    currentRound: 0,
    gameState: 'lobby'
  };
  
  const playerData = { id: socket.id, name: `Player 1` };
  activeRooms[roomCode].players.push(playerData);
  
  return { roomCode, players: activeRooms[roomCode].players };
};


// ✅ This is the Default Export your server.js is looking for!
export default function registerTriviaNamespace(namespace) {
  namespace.on('connection', (socket) => {
    console.log(`Trivia User Connected: ${socket.id}`);

    // ==========================================
    // Room Creation & Joining
    // ==========================================
    socket.on('createRoom', () => {
      const { roomCode, players } = createRoomLogic(socket, activeRooms);
      
      socket.join(roomCode);
      // Notice we use the socket directly to emit back to the creator
      socket.emit('roomCreated', { roomCode, players });
    });

    socket.on('joinRoom', ({ roomCode, playerName }) => {
      if (!roomCode) return socket.emit('errorMsg', 'Room code is missing.');
      
      const code = roomCode.trim().toUpperCase();
      
      if (activeRooms[code]) {
        socket.join(code);
        activeRooms[code].players.push({ id: socket.id, name: playerName || 'Anonymous', score: 0 });
        
        namespace.to(code).emit('roomUpdated', { 
          roomCode: code, 
          players: activeRooms[code].players 
        });
      } else {
        socket.emit('errorMsg', 'Trivia room not found.');
      }
    });

    // ==========================================
    // Disconnection Handler (Trivia Only)
    // ==========================================
    socket.on('disconnect', () => {
      console.log(`Trivia User Disconnected: ${socket.id}`);
      
      // Cleanup Trivia Rooms specific to this namespace
      for (const roomCode in activeRooms) {
        const room = activeRooms[roomCode];
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          
          if (room.players.length === 0) {
            delete activeRooms[roomCode]; // Delete empty rooms
          } else {
            namespace.to(roomCode).emit('roomUpdated', { 
              roomCode, 
              players: room.players 
            });
          }
          break;
        }
      }
    });

  });
}

export{
  getAllTrivia,
  getTriviaBackendStatus,
  getTriviaByID,
  generateRoomCode,
  createRoomLogic
}