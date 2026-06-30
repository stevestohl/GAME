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
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const code = roomCode.trim().toUpperCase();

    if (activeRooms[code]) {
      socket.join(code);

      const chosenName=playerName && playerName.trim() ? playerName : 'Host'

      const existingPlayer = activeRooms[code].plaoyers.find(p=> p.id === socket.id)

      if(existingPlayer) {
        existingPlayer.name = chosenName
      } else {
        activeRooms[code].players.push( { id: socket.id, name: chosenName })
      }

    // Broadcast the clean synchronized list back out
        io.to(code).emit('roomUpdated', { roomCode: code, players: activeRooms[code].players });
      } else {
        socket.emit('errorMsg', 'Room not found. Please check the code.');
      }

      // // This stops React StrictMode double-mounting from creating duplicate "ghost" players.
      const isAlreadyInRoom = activeRooms[code].players.some(p => p.id === socket.id);

      if (!isAlreadyInRoom) {
        const totalJoinedSoFar = activeRooms[code].players.length;
        const chosenName = playerName && playerName.trim() ? playerName : `Player ${totalJoinedSoFar + 1}`;
        const playerData = { id: socket.id, name: chosenName };
        
        activeRooms[code].players.push(playerData);
      } else {
        console.log(`Connection ${socket.id} already exists in room ${code}. Skipping duplicate entry calculation.`);
      }
      
      // Always emit the room updated message to make sure the UI stays completely synchronized
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
const PORT = process.env.PORT || 5000;

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