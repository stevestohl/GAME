import app from './app.js';
import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import mongoose from 'mongoose';

// Import Namespace Controllers
import registerTriviaNamespace from './controllers/trivia_controller.js';
import registerTictactoeNamespace from './controllers/tictactoe_controller.js';
import registerPrompt2Namespace from './controllers/prompt2_controller.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Initialize Namespaces
// Each function takes the specific namespace instance
registerTriviaNamespace(io.of('/trivia'));
registerTictactoeNamespace(io.of('/tictactoe'));
registerPrompt2Namespace(io.of('/prompt2'));

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