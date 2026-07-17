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
        currentHostIndex: 0,
        currentRound:1,
        currentPrompt: null,
        players: {
            [socket.id]: {
                id: socket.id,
                name: 'Host',
                score: 0,
                hasSubmitted: false,
                currentAnswer: "",
                isPlayerHost: true
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
socket.on('joinRoom', ({ roomCode, playerName, playerId }) => {
    if (!roomCode) return;
    const code = roomCode.trim().toUpperCase();
    const currentRoom = activePrompt2Rooms[code];

    if (currentRoom) {
        socket.join(code);

        // 1. Construct the Payload (Inside the success block)
        const syncPayload = {
            gameState: currentRoom.gameState,
            roomData: currentRoom,
            // Use logical OR || to ensure empty arrays/objects if data doesn't exist yet
            currentPrompt: currentRoom.currentPrompt || null,
            promptOptions: currentRoom.promptOptions || [],
            submissions: currentRoom.submissions || [],
            roundResults: currentRoom.roundResults || null,
            playerStatus: currentRoom.players[playerId] || null
        };

        // 2. Emit the sync to the user who just joined
        socket.emit('sync_game_state', syncPayload);

        // 3. Handle Reconnection vs New Player Logic
        const existingPlayerKey = Object.keys(currentRoom.players).find(
            (key) => currentRoom.players[key].playerId === playerId
        );

        if (existingPlayerKey) {
            console.log(`[Reconnection] Player ${playerName} reconnected.`);
            const playerData = currentRoom.players[existingPlayerKey];
            playerData.id = socket.id;
            
            if (currentRoom.hostId === existingPlayerKey) {
                currentRoom.hostId = socket.id;
            }
            
            delete currentRoom.players[existingPlayerKey];
            currentRoom.players[socket.id] = playerData;
        } else {
            console.log(`[New Player] ${playerName} joined.`);
            currentRoom.players[socket.id] = {
                playerId: playerId,
                id: socket.id,
                name: playerName || 'Anonymous',
                score: 0,
                hasSubmitted: false,
                currentAnswer: "",
                isPlayerHost: socket.id === currentRoom.hostId 
            };
        }
        
        // Broadcast the update to everyone else
        promptNS.to(code).emit('room_updated', currentRoom);
    } else {
        // If room doesn't exist
        socket.emit('errorMsg', 'Room not found!');
    }
});
            

        // --- Event: Show Rules ---
        socket.on('showRules', ({ roomCode }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && (socket.id === room.hostId || room.players[socket.id]?.isPlayerHost)) {
                room.hostId = socket.id; 
                room.gameState = 'rules';
                promptNS.to(roomCode).emit('room_updated', room);
            }
        });

        // --- Event: Start Prompt Selection (from Rules) ---
        socket.on('startPromptSelection', async ({ roomCode }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                try {
                    room.gameState = 'prompt_selection';
                    const randomPrompts = await Prompt2Model.aggregate([{ $sample: { size: 3 } }]);
                    socket.emit('prompt_options', { prompts: randomPrompts });
                    promptNS.to(roomCode).emit('room_updated', room);
                } catch (err) { console.error(err); }
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
                }
                promptNS.to(roomCode).emit('room_updated', room);
            }
        });

        // --- Event: Reveal Choices (for the judge) ---
        socket.on('reveal_choices', ({ roomCode }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                room.gameState = 'judging'; 
                promptNS.to(roomCode).emit('room_updated', room);
            }
        });

        // --- Event: Host Picks the Winning Answer ---
        socket.on('pick_winner', ({ roomCode, winningPlayerId }) => {
            const room = activePrompt2Rooms[roomCode];
            if (!room || socket.id !== room.hostId) return;

            // 1. Calculate next host index
            const playerIds = Object.keys(room.players);
            room.currentHostIndex = (room.currentHostIndex + 1) % playerIds.length;
            const nextHostId = playerIds[room.currentHostIndex];
            const nextHost = room.players[nextHostId];

            // 2. Award points
            if (room.players[winningPlayerId]) {
                room.players[winningPlayerId].score += 100; 
            }

            // 3. Determine if game is over (Cap at 3 rounds)
            const isGameOver = room.currentRound >= 3;

            // 4. Update Game State
            if (isGameOver) {
                room.gameState = 'scoreboard';
            } else {
                room.gameState = 'winner_reveal';
                room.currentRound += 1; // Only increment if we are continuing
            }

            // 5. Update host info
            Object.values(room.players).forEach(player => {
                player.isPlayerHost = (player.id === nextHostId);
            });
            room.hostId = nextHostId; 

            // 6. Emit result
            promptNS.to(roomCode).emit('round_ended', {
                gameState: room.gameState,
                winner: room.players[winningPlayerId],
                nextHostName: nextHost.name,
                isGameOver: isGameOver // <--- Your client-side listener uses this!
            });

            promptNS.to(roomCode).emit('room_updated', room);
        });

        // --- Event: Host Starts the Next Round ---
        socket.on('nextRound', async ({ roomCode }) => {
            const room = activePrompt2Rooms[roomCode];
            if (room && socket.id === room.hostId) {
                try {
                    room.gameState = 'prompt_selection';
                    
                    Object.values(room.players).forEach(p => {
                        p.hasSubmitted = false;
                        p.currentAnswer = "";
                    });

                    const randomPrompts = await Prompt2Model.aggregate([{ $sample: { size: 3 } }]);
                    
                    socket.emit('prompt_options', { prompts: randomPrompts });
                    promptNS.to(roomCode).emit('room_updated', room);
                    
                    console.log(`[BACKEND] Next round started for ${roomCode}.`);
                } catch (err) {
                    console.error("Error starting next round:", err);
                }
            }
        });

        // --- Event: Handle Disconnection ---
        socket.on('disconnect', () => {
            // ... (Your existing disconnect logic)
        });
    });
}