// controllers/prompt2_controller.js
// Import your Prompt2 Mongoose model once created (e.g., import Prompt2Card from '../models/Prompt2Card.js')

// ==========================================
// 1. HTTP REST API Controllers
// ==========================================

export const getAllPrompt2Cards = async (req, res) => {
    try {
        // Placeholder until you build the schema/model:
        // const cards = await Prompt2Card.find({});
        // res.status(200).json({ success: true, cards });
        
        res.status(200).json({ 
            success: true, 
            message: "HTTP endpoint hit! Prompt2 cards route is ready to rock." 
        });
    } catch (error) {
        console.error("Error in getAllPrompt2Cards:", error.message);
        res.status(500).json({ success: false, message: "Server Error fetching prompt cards." });
    }
};


// ==========================================
// 2. Real-Time Socket.io Namespace Handler
// ==========================================

// In-memory state storage for Prompt2 game rooms (tracks active players, rounds, etc.)
const rooms = {}; 

export default function registerPrompt2Namespace(promptNS) {
    promptNS.on('connection', (socket) => {
        console.log(`[Prompt2] New player connected: ${socket.id}`);

        // --- Event: Player Joins a Game Room ---
        socket.on('join_room', ({ roomCode, username }) => {
            socket.join(roomCode);
            
            // Initialize room tracking state if it doesn't exist
            if (!rooms[roomCode]) {
                rooms[roomCode] = {
                    roomCode,
                    gameState: 'lobby', // lobby, writing, voting, scoreboard
                    players: {}
                };
            }

            // Save player details to room state
            rooms[roomCode].players[socket.id] = {
                username,
                score: 0,
                hasSubmitted: false,
                currentAnswer: ""
            };

            console.log(`[Prompt2] ${username} (${socket.id}) joined room: ${roomCode}`);

            // Broadcast the updated player list back to everyone in the room
            promptNS.to(roomCode).emit('room_updated', rooms[roomCode]);
        });

        // --- Event: Game Start Triggered ---
        socket.on('start_game', ({ roomCode }) => {
            if (rooms[roomCode]) {
                rooms[roomCode].gameState = 'writing';
                
                // Example broadcast to switch everyone's UI to game view
                promptNS.to(roomCode).emit('game_started', {
                    gameState: rooms[roomCode].gameState,
                    prompt: "What is the worst thing to say right after a first kiss?" // Demo prompt
                });
            }
        });

        // --- Event: Player Submits Their Answer ---
        socket.on('submit_answer', ({ roomCode, answer }) => {
            const room = rooms[roomCode];
            const player = room?.players[socket.id];

            if (player) {
                player.currentAnswer = answer;
                player.hasSubmitted = true;
                
                console.log(`[Prompt2] ${player.username} submitted an answer in room ${roomCode}`);

                // Check if ALL active players have finalized their responses
                const allSubmitted = Object.values(room.players).every(p => p.hasSubmitted);
                
                if (allSubmitted) {
                    room.gameState = 'voting';
                    promptNS.to(roomCode).emit('start_voting', room);
                } else {
                    // Otherwise, just update the lobby on who is ready
                    promptNS.to(roomCode).emit('player_submitted', { playerId: socket.id });
                }
            }
        });

        // --- Event: Handle Disconnection ---
        socket.on('disconnect', () => {
            console.log(`[Prompt2] Player disconnected: ${socket.id}`);
            
            // Clean up player from any rooms they were lurking in
            for (const roomCode in rooms) {
                if (rooms[roomCode].players[socket.id]) {
                    const disconnectedUser = rooms[roomCode].players[socket.id].username;
                    delete rooms[roomCode].players[socket.id];
                    
                    // If room becomes totally ghosted, scrub the room from memory entirely
                    if (Object.keys(rooms[roomCode].players).length === 0) {
                        delete rooms[roomCode];
                        console.log(`[Prompt2] Room ${roomCode} emptied and deleted.`);
                    } else {
                        // Otherwise, inform the surviving players
                        promptNS.to(roomCode).emit('player_left', {
                            message: `${disconnectedUser} dropped connection.`,
                            updatedRoom: rooms[roomCode]
                        });
                    }
                }
            }
        });
    });
}