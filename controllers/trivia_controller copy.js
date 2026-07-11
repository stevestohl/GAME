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
    
  return { roomCode, players: activeRooms[roomCode].players };
};


// This is the Default Export your server.js is looking for!
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
      const currentRoom = activeRooms[code];
      
      if (currentRoom) {
        socket.join(code);
        
        // FIX: Check if this player socket is already in the room array
        const playerExists = currentRoom.players.some(p => p.id === socket.id);
        
        if (!playerExists) {
          // Add them safely if they aren't tracked yet
          currentRoom.players.push({ 
            id: socket.id, 
            name: playerName || 'Anonymous', 
            score: 0 
          });
        } else {
          // If they already exist (due to double-mounts), simply update their name 
          const index = currentRoom.players.findIndex(p => p.id === socket.id);
          currentRoom.players[index].name = playerName || 'Anonymous';
        }
        
        namespace.to(code).emit('roomUpdated', { 
          roomCode: code, 
          players: currentRoom.players 
        });
      } else {
        socket.emit('errorMsg', 'Trivia room not found.');
      }
    }
  );
    // ==========================================
    // Phase Transitions (Moving from Rules to Question)
    // ==========================================
    socket.on('nextRound', ({ roomCode }) => {
      if (!roomCode) return;
      
      const code = roomCode.trim().toUpperCase();
      const currentRoom = activeRooms[code];

      if (!currentRoom) {
        return socket.emit('errorMsg', 'Room not found.');
      }

      console.log(`🏁 Transitioning room ${code} to QUESTION phase (Round ${currentRoom.currentRound + 1})`);

      // 1. Clear any player answers left over from prior testing or rounds
      currentRoom.playerAnswers = {};

      // 2. Advance the UI phase state to 'QUESTION'
      currentRoom.phase = 'QUESTION';

      // 3. Broadcast the updated state out to all players in the match room
      namespace.to(code).emit('roomStateUpdated', currentRoom);
    });
    // ==========================================
    // Gameplay Lifecycle Initialization
    // ==========================================
    socket.on('startGame', async ({ roomCode }) => {
      if (!roomCode) return;
      const code = roomCode.trim().toUpperCase();
      const currentRoom = activeRooms[code];

      if (!currentRoom) {
        return socket.emit('errorMsg', 'Cannot start a match for a non-existent room.');
      }

      try {
        console.log(`🎮 Launching match for room: ${code}`);

        // 1. Fetch a pool of trivia questions from your MongoDB collection
        // Adjust the .limit() number based on how many questions you want per match
        const questionPool = await Temple_Trivia.find({}).limit(5);

        if (!questionPool || questionPool.length === 0) {
          return socket.emit('errorMsg', 'No trivia questions found in the database database.');
        }

        // 2. Populate the room's core state object
        currentRoom.gameState = 'active';
        currentRoom.phase = 'RULES'; // Change phase from lobby to RULES
        currentRoom.questions = questionPool;
        currentRoom.currentRound = 0;
        currentRoom.playerAnswers = {}; // Reset tracking map for submissions

        // Initialize everyone's base scores to 0 if not already handled
        currentRoom.players.forEach(player => {
          player.score = player.score || 0;
        });

        // 3. Broadcast the synchronized gameplay state update to all players in the room
        namespace.to(code).emit('roomStateUpdated', currentRoom);
        
        console.log(`📢 Room state initialized to RULES phase for room ${code}`);

      } catch (err) {
        console.error("Failed to safely initialize game room state:", err);
        socket.emit('errorMsg', 'Server error initializing match question context.');
      }
    });

  // ==========================================
    // Answer Submission & Scoring Engine
    // ==========================================
    socket.on('submitAnswers', ({ roomCode, answer }) => {
      if (!roomCode) return;
      
      const code = roomCode.trim().toUpperCase();
      const currentRoom = activeRooms[code];

      if (!currentRoom) {
        return socket.emit('errorMsg', 'Room not found.');
      }

      // 1. Record this specific player's answer text string
      currentRoom.playerAnswers[socket.id] = answer;

      // 2. Evaluate answer correctness against current round question context
      const currentQuestion = currentRoom.questions[currentRoom.currentRound];
      if (currentQuestion && currentQuestion.correct_answer === answer) {
        // Find the player object and increment score safely
        const player = currentRoom.players.find(p => p.id === socket.id);
        if (player) {
          player.score = (player.score || 0) + 1;
          console.log(`✨ Correct answer by ${player.name}! Score is now: ${player.score}`);
        }
      }

      // 3. Automated Phase Controller: Check if all active players have submitted
      const totalPlayersInRoom = currentRoom.players.length;
      const totalAnswersLogged = Object.keys(currentRoom.playerAnswers).length;

      console.log(`📝 Answer logged for room ${code} (${totalAnswersLogged}/${totalPlayersInRoom})`);

      if (totalAnswersLogged >= totalPlayersInRoom) {
        console.log(`📊 All answers collected for room ${code}. Shifting to SCOREBOARD phase.`);
        
        // Update the game room phase status
        currentRoom.phase = 'SCOREBOARD';
      }

      // 4. Synchronize the room state data back down to all clients
      namespace.to(code).emit('roomStateUpdated', currentRoom);
    });

    // ==========================================
    // Scoreboard to Next Round / End Game Controller
    // ==========================================
    socket.on('advanceFromScoreboard', ({ roomCode }) => {
      if (!roomCode) return;
      
      const code = roomCode.trim().toUpperCase();
      const currentRoom = activeRooms[code];

      if (!currentRoom) {
        return socket.emit('errorMsg', 'Room not found.');
      }

      // Increment the round index tracker
      currentRoom.currentRound += 1;

      // Define your match cap condition (e.g., 3 rounds max)
      const MAX_ROUNDS = 3;

      if (currentRoom.currentRound >= MAX_ROUNDS) {
        console.log(`🏆 Match completed for room ${code}. Transitioning to FINAL_RESULTS.`);
        
        // Change the UI phase to trigger your podium layouts
        currentRoom.phase = 'FINAL_RESULTS';
        currentRoom.gameState = 'completed';
      } else {
        console.log(`➡️ Advancing room ${code} to Round ${currentRoom.currentRound + 1}`);
        
        // Clear old answer map and go back to the question card
        currentRoom.playerAnswers = {};
        currentRoom.phase = 'QUESTION';
      }

      // Broadcast the state change to all clients
      namespace.to(code).emit('roomStateUpdated', currentRoom);
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