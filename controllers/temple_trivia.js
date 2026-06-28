import Temple_Trivia from "../models/Temple_Trivia.js";

// Centralized logic for managing rooms
const activeRooms = new Map();

exports.generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

exports.createRoomLogic = (socket) => {
  const roomCode = this.generateRoomCode();
  activeRooms[roomCode] = { players: [] };
  
  const playerData = { id: socket.id, name: `Player 1` };
  activeRooms[roomCode].players.push(playerData);
  
  return { roomCode, players: activeRooms[roomCode].players };
};

// You can also export functions here to fetch trivia questions from MongoDB later!