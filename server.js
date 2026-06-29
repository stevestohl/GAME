import app from './app.js' // Fixed path typo. This brings in your fully configured Express app!
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import {} from 'dotenv/config'
import mongoose from 'mongoose'


const server = http.createServer(app); // Passes your imported app directly here
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Import your socket room handlers from your controller file
import { createRoomLogic } from './controllers/trivia_controller.js'

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
  socket.on('joinRoom', ({ roomCode }) => {
    const code = roomCode.trim().toUpperCase();

    if (activeRooms[code]) {
      socket.join(code);

      const totalJoinedSoFar = activeRooms[code].players.length;
      const playerData = { id: socket.id, name: `Player ${totalJoinedSoFar + 1}` };
      
      activeRooms[code].players.push(playerData);

      io.to(code).emit('roomUpdated', { roomCode: code, players: activeRooms[code].players });
    } else {
      socket.emit('errorMsg', 'Room not found. Please check the code.');
    }
  });

  // 3. Handle Disconnection 
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
const PORT = process.env.PORT || 5001;

// Using process.env.DB to match your app.js working database configuration string
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