import Prompt2Model from "../models/Prompt2.js";

const activePrompt2Rooms = {}; 

const createRoomLogic = (socket, roomsObject) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = '';
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        randomLetters += alphabet.charAt(randomIndex);
    }
    const finalRoomCode = `P${randomLetters}`;
    roomsObject[finalRoomCode] = {
        roomCode: finalRoomCode,
        gameState: 'lobby',
        hostId: socket.id,
        currentPrompt: null,
        players: {
            [socket.id]: {
                id: socket.id,
                name: 'Host',
                score: 0,
                hasSubmitted: false,
                currentAnswer: "",
                isPlayerHost: true // FIXED: Added flag for frontend badge rendering
            }
        }
    };
    return {
        roomCode: finalRoomCode,
        players: Object.values(roomsObject[finalRoomCode].players)
    };
};

export default function registerPrompt2Namespace(promptNS) {
    promptNS.on('connection', (socket) => {
        console.log(`[Prompt2 Socket] Player connected: ${socket.id}`);

        // ---- Event: Room Creation ------
        socket.on('createRoom', () => {
            const { roomCode, players } = createRoomLogic(socket, activePrompt2Rooms);
            socket.join(roomCode);
            socket.emit('roomcreated', { roomCode, players });
        });

        // --- Event: Room Joining ---
        socket.on('joinRoom', ({ roomCode, playerName }) => {
            if (!roomCode) return;
            const code = roomCode.trim().toUpperCase();
            const currentRoom = activePrompt2Rooms[code];
            if (currentRoom) {
                socket.join(code);
                
                // Add or update the player using unified Object notation
                currentRoom.players[socket.id] = {
                    id: socket.id,
                    name: playerName || 'Anonymous',
                    score: currentRoom.players[socket.id]?.score || 0,
                    hasSubmitted: currentRoom.players[socket.id]?.hasSubmitted || false,
                    currentAnswer: currentRoom.players[socket.id]?.currentAnswer || "",
                    isPlayerHost: socket.id === currentRoom.hostId // FIXED: Dynamically flags the host
                };
                
                console.log(`[Prompt2] ${playerName || 'Anonymous'} joined room: ${code}`);
                
                // Send array format to Lobby for rendering
                promptNS.to(code).emit('roomUpdated', { 
                    roomCode: code, 
                    players: Object.values(currentRoom.players)      
                });
                
                // Send raw object data to GameManager 
                promptNS.to(code).emit('room_updated', currentRoom);
            } else {
                socket.emit('errorMsg', 'Room not found!');
            }
        });
        
// --- Event: Show Rules Triggered (Replaces old startGame workflow) ---
        socket.on('showRules', ({ roomCode }) => {
            console.log(`[BACKEND] showRules received for room: ${roomCode} from socket: ${socket.id}`);
            
            const room = activePrompt2Rooms[roomCode];
            if (!room) {
                console.log(`[BACKEND] Error: Room ${roomCode} not found.`);
                return;
            }
            
            // Check if socket matches hostId OR if this specific connection is flagged as the host player
            const isAuthorizedHost = socket.id === room.hostId || room.players[socket.id]?.isPlayerHost;
            
            console.log(`[BACKEND] Room Host Authorization match: ${isAuthorizedHost}`);
            
            if (isAuthorizedHost) {
                // Heal hostId automatically if it shifted during page transitions
                room.hostId = socket.id; 
                room.gameState = 'rules';
                
                console.log(`[BACKEND] Success! State set to 'rules'. Broadcasting updates to room...`);
                
                // Broadcast the global state change to all connected players
                promptNS.to(roomCode).emit('room_updated', room);
            } else {
                console.log(`[BACKEND] Action blocked: Unauthorized socket attempted to show rules.`);
            }
        });
        // // --- Event: Game Start Triggered ---
        // socket.on('startGame', async ({ roomCode }) => {
        //     console.log(`[BACKEND] startGame received for room: ${roomCode} from socket: ${socket.id}`);
            
        //     const room = activePrompt2Rooms[roomCode];
        //     if (!room) {
        //         console.log(`[BACKEND] Error: Room ${roomCode} not found.`);
        //         return;
        //     }
            
        //     console.log(`[BACKEND] Room Host ID is: ${room.hostId}. Matching socket: ${socket.id === room.hostId}`);
        //     if (socket.id === room.hostId) {
        //         try {
        //             // Set state to rules first and skip database queries for this initial transition!
        //             room.gameState = 'rules';
                    
        //             console.log(`[BACKEND] Success! State set to 'rules'. Broadcasting updates to room...`);
                    
        //             // Broadcast the global state change to all connected players
        //             promptNS.to(roomCode).emit('room_updated', room);
        //         } catch (err) {
        //             console.error("[BACKEND] Critical error during startGame flow:", err);
        //         }
        //     } else {
        //         console.log(`[BACKEND] Action blocked: Unauthorized socket attempted to start the game.`);
        //     }
        // });

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
                promptNS.to(roomCode).emit('room_updated', room);
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
                promptNS.to(roomCode).emit('room_updated', room);
            }
        });


        // --- Event: Reveal Choices (for the judge) ---
        socket.on('reveal_choices', ({ roomCode }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                // Logic to transition the game state to judging or reveal results
                room.gameState = 'judging'; 
                console.log(`[BACKEND] Host revealing choices for room: ${roomCode}`);
                
                // Broadcast to all players that it's time to judge
                promptNS.to(roomCode).emit('room_updated', room);
            }
        });


        // --- NEW Event: Move from Rules to Prompt Selection ---
        socket.on('startPromptSelection', async ({ roomCode }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                try {
                    room.gameState = 'prompt_selection';
                    
                    // Fetch random cards/prompts from MongoDB
                    const randomPrompts = await Prompt2Model.aggregate([{ $sample: { size: 3 } }]);
                    
                    // Send choices directly to the host
                    socket.emit('prompt_options', { prompts: randomPrompts });
                    
                    // Update the room phase globally
                    promptNS.to(roomCode).emit('room_updated', room);
                } catch (err) {
                    console.error("Error transitioning to prompt selection:", err);
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
                promptNS.to(roomCode).emit('room_updated', room);
            }
        });

        // --- Event: Handle Disconnection ---
        socket.on('disconnect', () => {
            for (const roomCode in activePrompt2Rooms) {
                const room = activePrompt2Rooms[roomCode];
                
                if (room.players[socket.id]) {
                    const disconnectedUser = room.players[socket.id].name;
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
                        promptNS.to(roomCode).emit('room_updated', room);
                    }
                }
            }
        });

    });
}