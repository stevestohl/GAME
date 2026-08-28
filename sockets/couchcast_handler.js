// Couch-Cast will share the same database and model as Prompt2
import Prompt2Model from "../models/Prompt2.js"

// HELPER: Strips out Node.js objects so Socket.IO doesn't crash!
const getSafeRoom = (room) => {
    if (!room) return null;
    const { timerId, destroyTimer, ...safeRoom } = room;
    return safeRoom;
};

const activeCCRooms = {};

// Set your writing phase time limit here (e.g., 60 seconds)
const WRITING_TIME_LIMIT = 60 * 1000; 

const createRoomLogic = (socket, roomsObject, playerName) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = '';
    
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        randomLetters += alphabet.charAt(randomIndex);
    }
    
    const finalRoomCode = `C${randomLetters}`;
    
    roomsObject[finalRoomCode] = {
        roomCode: finalRoomCode,
        gameState: 'lobby',
        casterId: socket.id,
        hostId: null, 
        currentHostIndex: 1,
        currentRound: 1,
        currentPrompt: null,
        playerCount: 0, 
        endTime: null, 
        timerId: null, 
        players: {
            [socket.id]: {
                id: socket.id,
                name: playerName || 'Caster',
                score: 0,
                hasSubmitted: false,
                currentAnswer: "",
                isCaster: true,
                isPlayerHost: false,
                isConnected: true,
                joinOrder: -1 
            }
        }
    };
    
    return {
        roomCode: finalRoomCode,
        players: Object.values(roomsObject[finalRoomCode].players)
    };
}

export default function registerCCNamespace(CCNS) {
    
    // --- HELPER: Advance to Judging Phase ---
    const advanceToJudging = (roomCode) => {
        const room = activeCCRooms[roomCode];
        if (!room || room.gameState !== 'writing') return;

        if (room.timerId) {
            clearTimeout(room.timerId);
            room.timerId = null;
        }

        room.gameState = 'judging';

        const activeRegularPlayers = Object.keys(room.players).filter(
            id => id !== room.hostId && !room.players[id].isCaster
        );

        const anonymousSubmissions = activeRegularPlayers
            .filter(id => room.players[id].hasSubmitted)
            .map(id => ({
                playerId: id,
                answer: room.players[id].currentAnswer
            }))
            .sort(() => Math.random() - 0.5);

        CCNS.to(roomCode).emit('start_judging', {
            gameState: room.gameState,
            submissions: anonymousSubmissions
        });
        CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
    };

    CCNS.on('connection', (socket) => {
        console.log(`[CastCouch Socket]\n Player Connected: ${socket.id}`);

        // ----------Event: Room Creation-----------
        socket.on('createRoom', (data) => {
            const nameToUse = data.playerName || 'Caster';
            const { roomCode, players } = createRoomLogic(socket, activeCCRooms, nameToUse);
            socket.join(roomCode);
            socket.emit('roomCreated', { roomCode, players });
        });

        // --- Event: Room Joining ---
        socket.on('joinRoom', ({ roomCode, playerName, playerId }) => {
            if(!roomCode) return;
            const code = roomCode.trim().toUpperCase();
            const currentRoom = activeCCRooms[code];
            // Cancel the destruct timer if someone comes back!

            if (currentRoom) {
                socket.join(code);
                if (currentRoom.destroyTimer) {
                    clearTimeout(currentRoom.destroyTimer);
                    currentRoom.destroyTimer = null;
                }                
                const syncPayload = {
                    gameState: currentRoom.gameState, 
                    roomData: getSafeRoom(currentRoom),
                    currentPrompt: currentRoom.currentPrompt || null,
                    promptOptions: currentRoom.promptOptions || null, 
                    submissions: currentRoom.promptSubmissions || null,
                    roundResults: currentRoom.roundResults || null,
                    playerStatus: currentRoom.players[socket.id] || null,
                    endTime: currentRoom.endTime || null 
                };
                
                socket.emit('sync_game_state', syncPayload);
                
                const existingPlayerKey = Object.keys(currentRoom.players).find(
                    (key) => currentRoom.players[key].playerId === playerId
                );
                
                if (existingPlayerKey){
                    console.log(`[Reconnection] Player ${playerName} reconnected.`);
                    const playerData = currentRoom.players[existingPlayerKey];
                    playerData.id = socket.id;
                    playerData.isConnected = true; 
                    
                    if (currentRoom.hostId === existingPlayerKey) {
                        currentRoom.hostId = socket.id;
                    }
                    
                    delete currentRoom.players[existingPlayerKey];
                    currentRoom.players[socket.id] = playerData;

                } else {
                    console.log(`[New Player] ${playerName} joined.`);
                    const isFirstActualPlayer = Object.keys(currentRoom.players).length === 1;
                    
                    currentRoom.players[socket.id] = {
                        playerId: playerId,
                        id: socket.id,
                        name: playerName || 'Anonymous',
                        score: 0,
                        hasSubmitted: false,
                        currentAnswer: "",
                        isCaster: false,
                        isPlayerHost: isFirstActualPlayer,
                        isConnected: true,
                        joinOrder: currentRoom.playerCount,
                        hasUsedWriteIn: false
                    };

                    currentRoom.playerCount++; 

                    if (isFirstActualPlayer) {
                        currentRoom.hostId = socket.id;
                    }
                }
                
                CCNS.to(code).emit('room_updated', getSafeRoom(currentRoom));
            } else {
                socket.emit('errorMsg', 'Room not found!');
            }
        });

        // --- Event: Show Rules ---
        socket.on('showRules', ({ roomCode }) => {
            const room = activeCCRooms[roomCode];
            if (room && (socket.id === room.hostId || room.players[socket.id]?.isPlayerHost)) {
                room.hostId = socket.id; 
                room.gameState = 'rules';
                CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
            }
        });

        // --- Event: Start Prompt Selection (from Rules) ---
        socket.on('startPromptSelection', async ({ roomCode }) => {
            const room = activeCCRooms[roomCode];
            
            // Allow EITHER the Host or the Caster (TV) to start this phase
            if (room && (socket.id === room.hostId || room.players[socket.id]?.isCaster)) {
                try {
                    room.gameState = 'prompt_selection';
                    const randomPrompts = await Prompt2Model.aggregate([{ $sample: { size: 3 } }]);
                    
                    // Store the prompts in the room state so the mobile host can access them
                    room.promptOptions = randomPrompts;
                    
                    CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
                    // // Explicitly broadcast the 3 prompts to the room so the TV and Judge receive them
                    // CCNS.to(roomCode).emit('prompt_options', { prompts: randomPrompts });
                    
                } catch (err) { console.error(err); }
            }
        });

        // --- Event: Host Selects Prompt -> STARTS TIMER ---
        socket.on('select_prompt', ({ roomCode, selectedPrompt }) => {
            const room = activeCCRooms[roomCode];
            if (room && socket.id === room.hostId) {
                room.gameState = 'writing';
                room.currentPrompt = selectedPrompt;
                
                Object.values(room.players).forEach(p => {
                    if (!p.isCaster && p.id !== room.hostId) {
                        p.hasSubmitted = false;
                        p.currentAnswer = "";
                    }
                });

                room.endTime = Date.now() + WRITING_TIME_LIMIT;

                room.timerId = setTimeout(() => {
                    advanceToJudging(roomCode);
                }, WRITING_TIME_LIMIT);

                CCNS.to(roomCode).emit('writing_phase_started', {
                    gameState: room.gameState,
                    prompt: room.currentPrompt,
                    endTime: room.endTime 
                });
                CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
            }
        });

        // --- Event: Player Submits Their Answer ---
        socket.on('submit_answer', ({ roomCode, answer, usedWriteIn }) => { // 👈 Catch it here
            const room = activeCCRooms[roomCode];
            const player = room?.players[socket.id];
            
            if (player && socket.id !== room.hostId && !player.isCaster) {
                player.currentAnswer = answer;
                player.hasSubmitted = true;

                // Flags writin answer as used
                if (usedWriteIn) {
                    player.hasUsedWriteIn = true; 
                }
                
                const activeRegularPlayers = Object.keys(room.players).filter(
                    id => id !== room.hostId && !room.players[id].isCaster && room.players[id].isConnected
                );
                
                const allSubmitted = activeRegularPlayers.every(id => room.players[id].hasSubmitted);
                
                if (allSubmitted && activeRegularPlayers.length > 0) {
                    advanceToJudging(roomCode);
                } else {
                    CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
                }
            }
        });
        // --- Event: Reveal Choices (for the judge) ---
        socket.on('reveal_choices', ({ roomCode }) => {
            const room = activeCCRooms[roomCode];
            if (room && socket.id === room.hostId) {
                room.gameState = 'judging'; 
                CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
            }
        });

        // --- Event: Host Picks the Winning Answer ---
        socket.on('pick_winner', ({ roomCode, winningPlayerId }) => {
            const room = activeCCRooms[roomCode];
            if (!room || socket.id !== room.hostId) return;

            // 1. Identify winner and update score
            const winningPlayer = room.players[winningPlayerId];
            let winningAnswerText = "Unknown Answer";

            if (winningPlayer) {
                winningPlayer.score += 100; 
                winningAnswerText = winningPlayer.currentAnswer; 
            }

            // 2. Host Rotation Logic 
            const eligiblePlayers = Object.values(room.players)
                .filter(p => !p.isCaster)
                .sort((a, b) => a.joinOrder - b.joinOrder); 
            
            const playerIds = eligiblePlayers.map(p => p.id);
            let currentIndex = playerIds.indexOf(room.hostId);
            if (currentIndex === -1) currentIndex = 0;
            
            room.currentHostIndex = (currentIndex + 1) % playerIds.length;
            const nextHostId = playerIds[room.currentHostIndex];
            const nextHost = room.players[nextHostId];

            Object.values(room.players).forEach(player => {
                player.isPlayerHost = (player.id === nextHostId);
            });
            room.hostId = nextHostId; 

            // 3. Set state to REVEAL the funny answer
            const isGameOver = room.currentRound >= 3;
            room.gameState = 'winner_reveal'; 

            // Send the reveal data to the TV
            CCNS.to(roomCode).emit('round_ended', {
                gameState: room.gameState,
                winner: winningPlayer,
                winningSubmission: {
                    playerName: winningPlayer?.name || "Anonymous",
                    answer: winningAnswerText
                },
                nextHostName: nextHost.name,
                isGameOver: isGameOver 
            });
            CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));


            // ==========================================
            // THE AUTOMATIC TV TIMERS
            // ==========================================
            
            // TIMER 1: After 10 seconds of laughing at the winner... show the Scoreboard!
            setTimeout(() => {
                room.gameState = 'scoreboard';
                CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));

                // TIMER 2: If the game IS NOT over, wait 7 more seconds on the scoreboard, 
                // then start the next round automatically.
                if (!isGameOver) {
                    setTimeout(async () => {
                        room.gameState = 'prompt_selection';
                        room.currentRound += 1; 
                        room.endTime = null; 
                        
                        // Reset submissions for the new round
                        Object.values(room.players).forEach(p => {
                            if (!p.isCaster && p.id !== room.hostId) {
                                p.hasSubmitted = false;
                                p.currentAnswer = "";
                            }
                        });

                        try {
                            const randomPrompts = await Prompt2Model.aggregate([{ $sample: { size: 3 } }]);
                            CCNS.to(roomCode).emit('prompt_options', { prompts: randomPrompts });
                        } catch (err) {
                            console.error(err);
                        }
                        
                        CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));

                    }, 7000); // 7 seconds looking at the scoreboard
                } 
                // If the game IS over, we just stay on the scoreboard permanently!
                
            }, 10000); // 10 seconds looking at the winning answer (add fireworks here on the frontend!)
        });
        // --- Event: Host Starts the Next Round ---
        socket.on('nextRound', async ({ roomCode }) => {
            const room = activeCCRooms[roomCode];
            if (room && socket.id === room.hostId) {
                try {
                    room.gameState = 'prompt_selection';
                    room.endTime = null; 
                    
                    Object.values(room.players).forEach(p => {
                        if (!p.isCaster && p.id !== room.hostId) {
                            p.hasSubmitted = false;
                            p.currentAnswer = "";
                        }
                    });
                    
                    const randomPrompts = await Prompt2Model.aggregate([{ $sample: { size: 3 } }]);
                    
                    socket.emit('prompt_options', { prompts: randomPrompts });
                    CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
                    
                } catch (err) {
                    console.error("Error starting next round:", err);
                }
            }
        });

        // --- Event: Handle Disconnection ---
        socket.on('disconnect', () => {
            let foundRoomCode = null;
            let disconnectedPlayer = null;
            
            for (const code in activeCCRooms) {
                if (activeCCRooms[code].players[socket.id]) {
                    foundRoomCode = code;
                    disconnectedPlayer = activeCCRooms[code].players[socket.id];
                    break;
                }
            }
        
            if (!foundRoomCode || !disconnectedPlayer) return;
            const room = activeCCRooms[foundRoomCode];
            
            disconnectedPlayer.isConnected = false;
            console.log(`[Disconnect] ${disconnectedPlayer.name} left room ${foundRoomCode}`);
        
            // 1. If TV disconnects, don't break the game, but start a self-destruct timer
            const activePlayers = Object.values(room.players).filter(p => p.isConnected);
            
            if (activePlayers.length === 0) {
                console.log(`[Room Cleanup] Room ${foundRoomCode} is empty. Setting 5-min destroy timer.`);
                room.destroyTimer = setTimeout(() => {
                    console.log(`[Room Cleanup] Destroying abandoned room ${foundRoomCode}`);
                    delete activeCCRooms[foundRoomCode];
                }, 5 * 60 * 1000); // 5 minutes
            }

            // 2. Writing Phase: Did this player's exit mean everyone else is ready?
            if (room.gameState === 'writing' && !disconnectedPlayer.isCaster && socket.id !== room.hostId) {
                const activeRegularPlayers = Object.keys(room.players).filter(
                    id => id !== room.hostId && !room.players[id].isCaster && room.players[id].isConnected
                );
                
                if (activeRegularPlayers.length > 0 && activeRegularPlayers.every(id => room.players[id].hasSubmitted)) {
                    advanceToJudging(foundRoomCode);
                }
            }
        
            // 3. Host Migration: If the Judge left, give the crown to someone else
            if (socket.id === room.hostId) {
                const connectedPlayers = Object.values(room.players)
                    .filter(p => !p.isCaster && p.isConnected)
                    .sort((a, b) => a.joinOrder - b.joinOrder);
                    
                if (connectedPlayers.length > 0) {
                    const newHost = connectedPlayers[0];
                    room.hostId = newHost.id;
                    
                    Object.values(room.players).forEach(p => {
                        p.isPlayerHost = (p.id === newHost.id);
                    });
                    
                    console.log(`[Host Migration] Host disconnected. ${newHost.name} is the new host.`);
                }
            }
        
            CCNS.to(foundRoomCode).emit('room_updated', getSafeRoom(room));
        });
    });
}