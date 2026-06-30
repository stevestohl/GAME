import app from './app.js'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import {} from 'dotenv/config'
import mongoose from 'mongoose'
import { createRoomLogic } from './controllers/trivia_controller.js'
import TriviaTemple from './models/Temple_Trivia.js' // FIX: Removed curly braces for default export

const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Real-time room tracking state. Matches activeRooms object in controller
const activeRooms = {};

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. Handle Room Creation with controller
  socket.on('createRoom', () => {
    const { roomCode, players } = createRoomLogic(socket, activeRooms)
    
    socket.join(roomCode)
    socket.emit('roomCreated', { roomCode, players })
  });

  // 2. Handle Joining an Existing Room
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const code = roomCode.trim().toUpperCase();

    // Safety Guard: Check if the room actually exists first
    if (activeRooms[code]) {
      socket.join(code);

      const chosenName = playerName && playerName.trim() ? playerName : 'Host';
      const existingPlayer = activeRooms[code].players.find(p => p.id === socket.id);

      if (existingPlayer) {
        // If the player connection is already tracked (like the Host), update their display name
        existingPlayer.name = chosenName;
      } else {
        // If it's a brand new connection (a guest joining), push them to the array
        activeRooms[code].players.push({ id: socket.id, name: chosenName, score: 0 });
      }
      // Broadcast the clean synchronized list back out (Only emit ONCE here)
      io.to(code).emit('roomUpdated', { roomCode: code, players: activeRooms[code].players });
      
    } else {
      // Handles missing rooms gracefully without crashing the server node
      socket.emit('errorMsg', 'Room not found. Please check the code.');
    }
  });

  // ==========================================
  // Game Play Loop Listeners
  // ==========================================

  // Host starts the game
  socket.on('startGame', async ({ roomCode }) => {
    const code = roomCode.trim().toUpperCase();
    const room = activeRooms[code];
    if (!room) return;

    try {
      // Fetching 3 random questions from MongoDB via aggregation pipeline
      const questions = await TriviaTemple.aggregate([{ $sample: { size: 3 } }]);

      // Initialize fresh real-time match parameters
      room.questions = questions;
      room.currentRound = 0;
      room.phase = 'RULES';
      room.playerAnswers = {};

      room.players.forEach(player => player.score = 0); // FIX: Fixed typo 'forEarch' to 'forEach'

      // Send the completed structural update to everyone in room
      io.to(code).emit('roomStateUpdated', room); // FIX: Fixed parenthesis syntax nesting error

    } catch (err) {
      console.error("Failed to compile match data from MongoDB:", err); // FIX: Fixed variable reference mismatch
      socket.emit('errorMsg', 'Could not fetch game questions.');
    }
  });

  // Player Submits an Answer
  // Note: Ensure your frontend code emits 'submitAnswers' with a plural 's' to match this name!
  socket.on('submitAnswers', ({ roomCode, answer }) => {
    const code = roomCode.trim().toUpperCase(); // FIX: Added execution parentheses () to toUpperCase
    const room = activeRooms[code];
    if (!room || room.phase !== 'QUESTION') return;

    // Save the player's choice by their socket ID
    room.playerAnswers[socket.id] = answer;

    // Checks if answers are right
    const currentQuestion = room.questions[room.currentRound];
    
    // FIX: Swapped 'correctAnswer' to 'correct_answer' to match your Mongoose Schema property
    if (answer === currentQuestion.correct_answer) {
      const activePlayer = room.players.find(p => p.id === socket.id);
      if (activePlayer) {
        activePlayer.score += 1; // award points... just one per right answer, don't get crazy
      }
    }
    const totalPlayers = room.players.length;
    const totalAnswersSubmitted = Object.keys(room.playerAnswers).length;

    if (totalAnswersSubmitted === totalPlayers) {
      room.phase = 'SCOREBOARD';
    }
    io.to(code).emit('roomStateUpdated', room);
  });

  // Host advances to next stage
  socket.on('nextRound', ({ roomCode }) => {
    const code = roomCode.trim().toUpperCase();
    const room = activeRooms[code];
    if (!room) return;

    room.playerAnswers = {};
    room.currentRound += 1;

    // Cap structural loop to 3 rounds
    if (room.currentRound >= 3) {
      room.phase = 'FINAL_RESULTS';
    } else {
      room.phase = 'QUESTION';
    }

    io.to(code).emit('roomStateUpdated', room);
  });

  // Handle Disconnection 
  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
    
    for (const roomCode in activeRooms) {
      const room = activeRooms[roomCode];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          delete activeRooms[roomCode];
        } else {
          io.to(roomCode).emit('roomUpdated', { roomCode, players: room.players });
        }
        break;
      }
    }
  });
});

// Database Connection & Server Startup
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DB || process.env.DATABASE_ACCESS)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
    server.listen(PORT, () => {
      console.log(`Trivia-Temple server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });