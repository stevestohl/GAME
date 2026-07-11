import Prompt2 from "../models/Prompt2.js";

// -----Get All Prompt2 Cards (HTTP Express Route) -----
const getAllPrompt2Cards = async (req, res) => {
    try {
        const prompt2Cards = await Prompt2.find({});
        res.status(200).json({ prompt2Cards, count: prompt2Cards.length });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}

// Localized state for Prompt2 only
const activePrompt2Rooms = {};

export default function registerPrompt2Namespace(namespace) {
  namespace.on('connection', (socket) => {
    console.log(`Prompt2 User Connected: ${socket.id}`);

    // Room logic is now specific to this namespace
    socket.on('createRoom', async ({ roomCode, hostName }) => {
      activePrompt2Rooms[roomCode] = {
        host: hostName,
        players: [{ id: socket.id, name: hostName }],
        status: 'lobby'
      };
      
      socket.join(roomCode);
      namespace.to(roomCode).emit('roomCreated', activePrompt2Rooms[roomCode]);
    });

    socket.on('submitPrompt', async ({ roomCode, promptData }) => {
      try {
        // ✅ FIXED: Using the imported 'Prompt2' variable
        const newEntry = new Prompt2(promptData);
        await newEntry.save();
        
        namespace.to(roomCode).emit('promptReceived', newEntry);
      } catch (error) {
        socket.emit('errorMsg', 'Failed to save prompt.');
      }
    });

    // Namespace-specific disconnect handling
    socket.on('disconnect', () => {
      console.log(`Prompt2 User Disconnected: ${socket.id}`);
      // Loop through activePrompt2Rooms to clean up this specific user
    });
  });
}

export {
    getAllPrompt2Cards,
}