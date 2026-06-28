const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { rand } = require('firebase/firestore/pipelines');
require('dotenv').config(); // Ready to read your root .env file

const app = express();
app.use(cors());

// Optional: Link your existing express routes if needed
// const apiRoutes = require('./routes/routes');
// app.use('/api', apiRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allows connections from local dev or your deployed live site
    methods: ["GET", "POST"]
  }
});

// Real-time room tracking state
const activeRooms = {};

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. Handle Room Creation
  socket.on('createRoom', () => {
    // Generate a random 4-letter uppercase code
    const randomThree = Math.random().toString(36).substring(2, 5).toUpperCase();
    const roomCode = `R${randomThree}`
    
    activeRooms[roomCode] = {
      players: [],
      currentRound: 0,
      gameState: 'lobby' // lobby, playing, leaderboard
    };

    // Host joins as Player 1
    const playerData = { id: socket.id, name: `Player 1` };
    activeRooms[roomCode].players.push(playerData);
    
    socket.join(roomCode);
    socket.emit('roomCreated', { roomCode, players: activeRooms[roomCode].players });
  });

  // 2. Handle Joining an Existing Room
  socket.on('joinRoom', ({ roomCode }) => {
    const code = roomCode.trim().toUpperCase();

    if (activeRooms[code]) {
      socket.join(code);

      // Total count helps us determine the NEXT player number without shifting existing ones
      const totalJoinedSoFar = activeRooms[code].players.length;
      const playerData = { id: socket.id, name: `Player ${totalJoinedSoFar + 1}` };
      
      activeRooms[code].players.push(playerData);

      // Sync the room for everyone inside
      io.to(code).emit('roomUpdated', { roomCode: code, players: activeRooms[code].players });
    } else {
      socket.emit('errorMsg', 'Room not found. Please check the code.');
    }
  });

  // 3. Handle Disconnection (No Re-indexing)
  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
    
    for (const roomCode in activeRooms) {
      const room = activeRooms[roomCode];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // Remove the disconnected player
        room.players.splice(playerIndex, 1);
        
        // Kill the room if entirely empty; otherwise just notify the survivors
        if (room.players.length === 0) {
          delete activeRooms[roomCode];
        } else {
          // Send updated list out WITHOUT renaming anyone
          io.to(roomCode).emit('roomUpdated', { roomCode, players: room.players });
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Trivia-Temple server running on port ${PORT}`);
});