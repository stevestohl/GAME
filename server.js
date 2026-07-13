import app from './app.js';
import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import mongoose from 'mongoose';

// Import Namespace Controllers
import registerTriviaNamespace from './sockets/trivia_handler.js';
import registerTicTacToeNamespace from './sockets/tictactoe_handler.js';
import registerPrompt2Namespace from './sockets/prompt2_handler.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Initialize Namespaces
const triviaNS = io.of('/trivia');
registerTriviaNamespace(triviaNS); 
console.log("Namespace '/trivia' registered.");

const tttNS = io.of('/tictactoe');
registerTicTacToeNamespace(tttNS); 
console.log("Namespace '/tictactoe' registered.");

const promptNS = io.of('/prompt2');
registerPrompt2Namespace(promptNS); 
console.log("Namespace '/prompt2' registered.");

// Database Connection & Server Startup
mongoose.connect(process.env.DB || process.env.DATABASE_ACCESS)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
    server.listen(PORT, () => {
      console.log(`Game-Temple server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("It must have been the water Jeff spilled...Database connection failed:", err.message);
  });