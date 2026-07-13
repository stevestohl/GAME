import Prompt2Model from "../../models/Prompt2.js";

// In-memory state storage specific to Prompt2 game rooms
const activePrompt2Rooms = {}; 

export default function registerPrompt2Namespace(promptNS) {
    promptNS.on('connection', (socket) => {
        console.log(`[Prompt2 Socket] Player connected: ${socket.id}`);

        // --- Event: Player Joins a Game Room ---
        socket.on('join_room', ({ roomCode, username }) => {
            socket.join(roomCode);
            
            const isCreator = !activePrompt2Rooms[roomCode];

            if (isCreator) {
                activePrompt2Rooms[roomCode] = {
                    roomCode,
                    gameState: 'lobby', 
                    hostId: socket.id,  
                    currentPrompt: null,
                    players: {}
                };
            }

            activePrompt2Rooms[roomCode].players[socket.id] = {
                username,
                score: 0,
                hasSubmitted: false,
                currentAnswer: ""
            };

            console.log(`[Prompt2] ${username} joined room: ${roomCode}`);
            promptNS.to(roomCode).emit('room_updated', activePrompt2Rooms[roomCode]);
        });

        // --- Event: Game Start Triggered (By Room Creator) ---
        socket.on('start_game', async ({ roomCode }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                try {
                    room.gameState = 'prompt_selection';
                    const randomPrompts = await Prompt2Model.aggregate([{ $sample: { size: 3 } }]);
                    
                    socket.emit('prompt_options', { prompts: randomPrompts });
                    
                    promptNS.to(roomCode).emit('gameState_changed', { 
                        gameState: room.gameState,
                        hostName: room.players[room.hostId]?.username 
                    });
                } catch (err) {
                    console.error("Error fetching random prompts for socket:", err);
                }
            }
        });

        // --- Event: Host Selects 1 of the 3 Prompts ---
        socket.on('select_prompt', ({ roomCode, selectedPrompt }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                room.gameState = 'writing';
                room.currentPrompt = selectedPrompt;

                Object.values(room.players).forEach(p => {
                    p.hasSubmitted = false;
                    p.currentAnswer = "";
                });

                promptNS.to(roomCode).emit('writing_phase_started', {
                    gameState: room.gameState,
                    prompt: room.currentPrompt
                });
            }
        });

        // --- Event: Player Submits Their Answer ---
        socket.on('submit_answer', ({ roomCode, answer }) => {
            const room = activePrompt2Rooms[roomCode];
            const player = room?.players[socket.id];

            if (player && socket.id !== room.hostId) {
                player.currentAnswer = answer;
                player.hasSubmitted = true;
                
                const regularPlayers = Object.keys(room.players).filter(id => id !== room.hostId);
                const allSubmitted = regularPlayers.every(id => room.players[id].hasSubmitted);
                
                if (allSubmitted) {
                    room.gameState = 'judging';

                    const anonymousSubmissions = regularPlayers.map(id => ({
                        playerId: id, 
                        answer: room.players[id].currentAnswer
                    })).sort(() => Math.random() - 0.5); 

                    promptNS.to(roomCode).emit('start_judging', {
                        gameState: room.gameState,
                        submissions: anonymousSubmissions
                    });
                } else {
                    promptNS.to(roomCode).emit('player_submitted', { playerId: socket.id });
                }
            }
        });

        // --- Event: Host Picks the Winning Answer ---
        socket.on('pick_winner', ({ roomCode, winningPlayerId }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                room.gameState = 'scoreboard';
                
                if (room.players[winningPlayerId]) {
                    room.players[winningPlayerId].score += 100; 
                }

                promptNS.to(roomCode).emit('round_ended', {
                    gameState: room.gameState,
                    winner: room.players[winningPlayerId],
                    updatedRoom: room
                });
            }
        });

        // --- Event: Handle Disconnection ---
        socket.on('disconnect', () => {
            for (const roomCode in activePrompt2Rooms) {
                const room = activePrompt2Rooms[roomCode];
                
                if (room.players[socket.id]) {
                    const disconnectedUser = room.players[socket.id].username;
                    delete room.players[socket.id];
                    
                    if (Object.keys(room.players).length === 0) {
                        delete activePrompt2Rooms[roomCode];
                        console.log(`[Prompt2] Room ${roomCode} deleted.`);
                    } else {
                        if (socket.id === room.hostId) {
                            room.hostId = Object.keys(room.players)[0];
                        }

                        promptNS.to(roomCode).emit('player_left', {
                            message: `${disconnectedUser} disconnected.`,
                            updatedRoom: room
                        });
                    }
                }
            }
        });
    });
}