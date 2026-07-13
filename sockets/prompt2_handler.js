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

        //---- Event: Room Creation ------
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
            // FIXED: Extraneous duplicate code that crashed the block has been completely removed from here!
        });
        // --- Event: Game Start Triggered (Matches frontend 'startGame') ---
        socket.on('startGame', async ({ roomCode }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                try {
                    room.gameState = 'prompt_selection';
                    const randomPrompts = await Prompt2Model.aggregate([{ $sample: { size: 3 } }]);
                    
                    // Send options directly to the choosing host
                    socket.emit('prompt_options', { prompts: randomPrompts });
                    
                    // Signal to GameManager to transition states globally
                    promptNS.to(roomCode).emit('game_started');
                    promptNS.to(roomCode).emit('room_updated', room);
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

        // --- Event: Game Start Triggered ---
        socket.on('startGame', ({ roomCode }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                // 1. Set state to rules first!
                room.gameState = 'rules';
                
                // 2. Broadcast the state change to everyone
                promptNS.to(roomCode).emit('room_updated', room);
            }
        });

        // --- NEW Event: Move from Rules to Prompt Selection ---
        socket.on('startPromptSelection', async ({ roomCode }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                try {
                    room.gameState = 'prompt_selection';
                    
                    // Fetch your random cards/prompts from MongoDB
                    const randomPrompts = await Prompt2Model.aggregate([{ $sample: { size: 3 } }]);
                    
                    // Send choices to the host
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