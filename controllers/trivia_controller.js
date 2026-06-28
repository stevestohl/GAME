import Temple_Trivia from "../models/Temple_Trivia.js";

const activeRooms = {}

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
  const randomThree =  Math.random().toString(36).substring(2, 5).toUpperCase()
  return `R${randomThree}`
};

const createRoomLogic = (socket) => {
  const roomCode = generateRoomCode();


  activeRooms[roomCode] = { 
    players: [],
    currentRound: 0,
    gameState: 'Lobby'
  };
  
  const playerData = { id: socket.id, name: `Player 1` };
  activeRooms[roomCode].players.push(playerData);
  
  return { roomCode, players: activeRooms[roomCode].players };
};

// You can also export functions here to fetch trivia questions from MongoDB later!


export{
  getAllTrivia,
  getTriviaBackendStatus,
  generateRoomCode,
  createRoomLogic
}