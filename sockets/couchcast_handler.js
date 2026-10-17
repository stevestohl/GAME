// Couch-Cast will share the same database and model as Prompt2
import { randomUUID } from "crypto"
import { drawCards, normalizeExpansion, normalizeRounds } from "../db/drawCards.js"
import { recordPromptRound } from "../db/recordPromptRound.js"
import { startRoomJanitor } from "./roomJanitor.js";

// HELPER: Strips out Node.js objects so Socket.IO doesn't crash!
const getSafeRoom = (room) => {
    if (!room) return null;
    // `hands` (the cards each player was dealt) stays on the server too: it's only for the saved stats
    // `playedCards` (which card each player played, to be swapped out next round) is server-only too
    const { timerId, destroyTimer, hands, playedCards, ...safeRoom } = room;
    return safeRoom;
};

const activeCCRooms = {};

// Set your writing phase time limit here (e.g., 60 seconds)
const WRITING_TIME_LIMIT = 60 * 1000; 

// How long the judge has to crown a winner before one is picked at random
const JUDGING_TIME_LIMIT = 30 * 1000;

// Extra moment after the clock hits zero, so a last-second tap from the judge still counts
const JUDGING_GRACE = 1 * 1000;

// How long the judge has to pick a prompt (the phone and TV count down 15s; the extra
// moment lets the judge's own phone make the pick first). After that the server picks.
const PROMPT_TIME_LIMIT = 15 * 1000;
const PROMPT_GRACE = 3 * 1000;

// Cards in each player's hand. With the write-in that's 7 choices; once a player
// has used their one write-in, it's swapped for a 7th card so there are still 7.
const HAND_SIZE = 6;

// A hand being dealt right now (roomCode:socketId -> Promise), so a double request only deals once
const handDeals = new Map();

// How many rounds make a game when the caster doesn't choose
const DEFAULT_ROUNDS = 3;

// How long the TV shows "No one submitted anything!" before the next round starts
const NO_SUBMISSIONS_DELAY = 5 * 1000;

// Lets the HTTP side (voice-overs) check that a room is real and still open
export const getCouchCastRoom = (roomCode) => activeCCRooms[roomCode] || null;

// HELPER: Finds the room a socket is playing in
const findRoomBySocket = (socketId) => {
    return Object.values(activeCCRooms).find(room => room.players[socketId]);
};

const createRoomLogic = (socket, roomsObject, playerName, expansion, totalRounds) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let finalRoomCode;
    do {   // never hand out a code that's already being played
        let randomLetters = '';
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * alphabet.length);
            randomLetters += alphabet.charAt(randomIndex);
        }
        finalRoomCode = `C${randomLetters}`;
    } while (roomsObject[finalRoomCode]);
    
    roomsObject[finalRoomCode] = {
        roomCode: finalRoomCode,
        gameId: randomUUID(),   // ties this game's saved answers together
        gameState: 'lobby',
        expansion: expansion,
        totalRounds: totalRounds,
        hands: {},         // socket id -> the cards in that player's hand (kept from round to round)
        playedCards: {},   // socket id -> id of the card they played this round (replaced next round)
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

            // Save compliled submissions to room state
            room.promptSubmissions = anonymousSubmissions;

        // Nobody answered: let the TV show the "no one submitted" message, then move on
        if (anonymousSubmissions.length === 0) {
            room.endTime = null;
            setTimeout(() => skipRound(roomCode), NO_SUBMISSIONS_DELAY);
        } else {
            // Judge is on the clock: no pick in time means a random answer wins
            room.endTime = Date.now() + JUDGING_TIME_LIMIT;
            room.timerId = setTimeout(() => {
                const randomPick = anonymousSubmissions[Math.floor(Math.random() * anonymousSubmissions.length)];
                console.log(`[Judging Timeout] Room ${roomCode}: picking a random winner.`);
                crownWinner(roomCode, randomPick.playerId, 'random');
            }, JUDGING_TIME_LIMIT + JUDGING_GRACE);
        }

        CCNS.to(roomCode).emit('start_judging', {
            gameState: room.gameState,
            submissions: anonymousSubmissions,
            endTime: room.endTime
        });
        CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
    };

    // --- HELPER: Pass the judge role to the next player in join order ---
    const rotateHost = (room) => {
        const eligiblePlayers = Object.values(room.players)
            .filter(p => !p.isCaster)
            .sort((a, b) => a.joinOrder - b.joinOrder); 
        
        const playerIds = eligiblePlayers.map(p => p.id);
        let currentIndex = playerIds.indexOf(room.hostId);
        if (currentIndex === -1) currentIndex = 0;
        
        room.currentHostIndex = (currentIndex + 1) % playerIds.length;
        const nextHostId = playerIds[room.currentHostIndex];

        Object.values(room.players).forEach(player => {
            player.isPlayerHost = (player.id === nextHostId);
        });
        room.hostId = nextHostId; 

        return room.players[nextHostId];
    };

    // --- HELPER: The judge has a limited time to pick a prompt; if their phone never
    // makes a pick (asleep, locked, wandered off), pick one for them so the game keeps going ---
    const startPromptTimer = (roomCode) => {
        const room = activeCCRooms[roomCode];
        if (!room) return;
        if (room.timerId) clearTimeout(room.timerId);
        room.timerId = setTimeout(() => {
            room.timerId = null;
            const options = room.promptOptions || [];
            if (activeCCRooms[roomCode] !== room || room.gameState !== 'prompt_selection' || options.length === 0) return;
            console.log(`[Prompt Timeout] Room ${roomCode}: picking a prompt for the judge.`);
            startWriting(roomCode, options[Math.floor(Math.random() * options.length)], true);
        }, PROMPT_TIME_LIMIT + PROMPT_GRACE);
    };

    // --- HELPER: A prompt was picked (by the judge, or for them): start the writing clock ---
    const startWriting = (roomCode, selectedPrompt, autoPicked = false) => {
        const room = activeCCRooms[roomCode];
        if (!room || room.gameState !== 'prompt_selection') return;

        if (room.timerId) clearTimeout(room.timerId);

        room.gameState = 'writing';
        room.currentPrompt = selectedPrompt;
        room.promptAutoPicked = !!autoPicked;

        Object.values(room.players).forEach(p => {
            if (!p.isCaster && p.id !== room.hostId) {
                p.hasSubmitted = false;
                p.currentAnswer = "";
            }
            p.answeredAt = null;
            p.currentIsWriteIn = false;
        });

        room.writingStartedAt = Date.now();
        room.endTime = room.writingStartedAt + WRITING_TIME_LIMIT;

        room.timerId = setTimeout(() => {
            advanceToJudging(roomCode);
        }, WRITING_TIME_LIMIT);

        CCNS.to(roomCode).emit('writing_phase_started', {
            gameState: room.gameState,
            prompt: room.currentPrompt,
            endTime: room.endTime,
            autoPicked: room.promptAutoPicked
        });
        CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
    };

    // --- HELPER: Deal a player's hand. Cards they kept stay; only the card they played
    // last round is swapped for a fresh one (like a real card game) ---
    const dealHand = async (room, socketId) => {
        let hand = room.hands[socketId] || [];
        const played = room.playedCards[socketId];
        if (played) {
            hand = hand.filter((card) => String(card._id) !== played);
            delete room.playedCards[socketId];
        }

        const handSize = HAND_SIZE + (room.players[socketId]?.hasUsedWriteIn ? 1 : 0);
        const needed = handSize - hand.length;
        if (needed > 0) {
            // Don't deal a card that's already in someone's hand
            const inPlay = Object.values(room.hands).flat().map((card) => card._id).filter(Boolean);
            const fresh = await drawCards('response', room.expansion, needed, inPlay);
            hand = [...hand, ...fresh];
        }

        room.hands[socketId] = hand;
        return hand;
    };

    // --- HELPER: Start the next round with 3 fresh prompts ---
    const startNextRound = async (roomCode) => {
        const room = activeCCRooms[roomCode];
        if (!room) return;

        room.gameState = 'prompt_selection';
        room.currentRound += 1; 
        room.endTime = null; 
        
        // Reset submissions for the new round
        Object.values(room.players).forEach(p => {
            if (!p.isCaster) {
                p.hasSubmitted = false;
                p.currentAnswer = "";
            }
        });

        try {
            const randomPrompts = await drawCards('prompt', room.expansion, 3);
            room.promptOptions = randomPrompts;
            CCNS.to(roomCode).emit('prompt_options', { prompts: randomPrompts });
            startPromptTimer(roomCode);
        } catch (err) {
            console.error(err);
        }
        
        CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
    };

    // --- HELPER: Save this round's answers for later analysis (promptanswers collection) ---
    const saveRound = (room, winningPlayerId, pickedBy) => {
        recordPromptRound({
            game: 'couchcast',
            room,
            judge: room.players[room.hostId],
            players: Object.values(room.players).filter(p => !p.isCaster && p.id !== room.hostId),
            winningPlayerId,
            pickedBy,
            timeLimitMs: WRITING_TIME_LIMIT,
            pointsForWin: 100,
            hands: room.hands,
        });
    };

    // --- HELPER: Crown the round's winner (picked by the judge, or at random when time runs out) ---
    const crownWinner = (roomCode, winningPlayerId, pickedBy = 'judge') => {
        const room = activeCCRooms[roomCode];
        // Only one winner per round: ignore anything after judging has ended
        if (!room || room.gameState !== 'judging') return;

        if (room.timerId) {
            clearTimeout(room.timerId);
            room.timerId = null;
        }
        room.endTime = null;

        // 1. Identify winner and update score
        const winningPlayer = room.players[winningPlayerId];
        let winningAnswerText = "Unknown Answer";

        if (winningPlayer) {
            winningPlayer.score += 100; 
            winningAnswerText = winningPlayer.currentAnswer; 
        }

        // 📊 Save the round before the judge's seat moves on
        saveRound(room, winningPlayerId, pickedBy);

        // 2. Host Rotation Logic 
        const nextHost = rotateHost(room);

        // 3. Set state to REVEAL the funny answer
        const isGameOver = room.currentRound >= room.totalRounds;
        room.gameState = 'winner_reveal'; 

        // Send the reveal data to the TV and the phones (kept on the room so a phone that reconnects still sees it)
        room.roundResults = {
            winner: winningPlayer,
            winningSubmission: {
                playerName: winningPlayer?.name || "Anonymous",
                answer: winningAnswerText
            },
            nextHostName: nextHost.name,
            isGameOver: isGameOver
        };
        CCNS.to(roomCode).emit('round_ended', {
            gameState: room.gameState,
            ...room.roundResults
        });
        CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));


        // ==========================================
        // THE AUTOMATIC TV TIMERS
        // ==========================================
        
        // TIMER 1: After 10 seconds of laughing at the winner... show the Scoreboard!
        setTimeout(() => {
            if (activeCCRooms[roomCode] !== room) return; // room was closed in the meantime
            room.gameState = 'scoreboard';
            CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));

            // TIMER 2: If the game IS NOT over, wait 7 more seconds on the scoreboard, 
            // then start the next round automatically.
            if (!isGameOver) {
                setTimeout(() => {
                    if (activeCCRooms[roomCode] !== room) return;
                    startNextRound(roomCode);
                }, 7000); // 7 seconds looking at the scoreboard
            } 
            // If the game IS over, we just stay on the scoreboard permanently!
            
        }, 10000); // 10 seconds looking at the winning answer (add fireworks here on the frontend!)
    };

    // --- HELPER: Nobody submitted an answer, so skip judging and keep the game going ---
    const skipRound = (roomCode) => {
        const room = activeCCRooms[roomCode];
        if (!room || room.gameState !== 'judging') return;

        saveRound(room, null, 'none');
        const nextHost = rotateHost(room);

        // The skipped round still counts, so an idle room can't play forever
        if (room.currentRound >= room.totalRounds) {
            room.gameState = 'scoreboard';
            CCNS.to(roomCode).emit('round_ended', {
                gameState: room.gameState,
                winner: null,
                winningSubmission: null,
                nextHostName: nextHost?.name,
                isGameOver: true
            });
            CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
            return;
        }

        startNextRound(roomCode);
    };

    // --- HELPER: A player's phone (or the TV) dropped out of a room ---
    // Used for lost connections and for players who leave to join another game.
    const playerLeftRoom = (socketId, roomCode) => {
        const room = activeCCRooms[roomCode];
        const disconnectedPlayer = room?.players[socketId];
        if (!room || !disconnectedPlayer) return;
        
        disconnectedPlayer.isConnected = false;
        console.log(`[Disconnect] ${disconnectedPlayer.name} left room ${roomCode}`);
    
        // 1. If TV disconnects, don't break the game, but start a self-destruct timer
        const activePlayers = Object.values(room.players).filter(p => p.isConnected);
        
        if (activePlayers.length === 0) {
            console.log(`[Room Cleanup] Room ${roomCode} is empty. Setting 5-min destroy timer.`);
            room.destroyTimer = setTimeout(() => {
                console.log(`[Room Cleanup] Destroying abandoned room ${roomCode}`);
                delete activeCCRooms[roomCode];
            }, 5 * 60 * 1000); // 5 minutes
        }

        // 2. Writing Phase: Did this player's exit mean everyone else is ready?
        if (room.gameState === 'writing' && !disconnectedPlayer.isCaster && socketId !== room.hostId) {
            const activeRegularPlayers = Object.keys(room.players).filter(
                id => id !== room.hostId && !room.players[id].isCaster && room.players[id].isConnected
            );
            
            if (activeRegularPlayers.length > 0 && activeRegularPlayers.every(id => room.players[id].hasSubmitted)) {
                advanceToJudging(roomCode);
            }
        }
    
        // 3. Host Migration: If the Judge left, give the crown to someone else
        if (socketId === room.hostId) {
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

        CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
    };

    // --- HELPER: End a game for everyone still in it ---
    const closeRoom = (roomCode, message) => {
        const room = activeCCRooms[roomCode];
        if (!room) return;

        if (room.timerId) clearTimeout(room.timerId);
        if (room.destroyTimer) clearTimeout(room.destroyTimer);

        console.log(`[Room Closed] ${roomCode}: ${message}`);
        CCNS.to(roomCode).emit('room_closed', { roomCode, message });
        CCNS.in(roomCode).socketsLeave(roomCode);
        delete activeCCRooms[roomCode];
    };

    // --- HELPER: Same players, fresh game (the caster tapped "Play Again" on the final scores) ---
    const resetForNewGame = (roomCode) => {
        const room = activeCCRooms[roomCode];
        if (!room) return;

        if (room.timerId) clearTimeout(room.timerId);
        room.timerId = null;

        // Players who left during the last game don't come along
        Object.keys(room.players).forEach((id) => {
            const p = room.players[id];
            if (!p.isCaster && !p.isConnected) delete room.players[id];
        });

        Object.values(room.players).forEach((p) => {
            p.score = 0;
            p.hasSubmitted = false;
            p.currentAnswer = "";
            p.hasUsedWriteIn = false;
            p.answeredAt = null;
            p.currentIsWriteIn = false;
            p.isPlayerHost = false;
        });

        // The first player still here leads again (they get the "All in!" button)
        const leader = Object.values(room.players)
            .filter((p) => !p.isCaster)
            .sort((a, b) => a.joinOrder - b.joinOrder)[0];
        if (leader) leader.isPlayerHost = true;
        room.hostId = leader ? leader.id : null;

        room.gameId = randomUUID();   // a new game in the saved stats
        room.gameState = 'lobby';
        room.currentRound = 1;
        room.currentHostIndex = 1;
        room.currentPrompt = null;
        room.promptOptions = null;
        room.promptSubmissions = null;
        room.promptAutoPicked = false;
        room.roundResults = null;
        room.endTime = null;
        room.writingStartedAt = null;
        room.hands = {};
        room.playedCards = {};

        console.log(`[Couch Cast] Room ${roomCode}: playing again.`);
        CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
    };

    // --- HELPER: One device, one game ---
    // Before a device starts or joins a game, take it out of any other game it was in.
    // Without this it keeps receiving the old game's screens and the two fight for the display.
    // If that device was the old game's TV, the old game is over: nobody can see it any more.
    const leaveOtherRooms = (socket, exceptCode) => {
        Object.keys(activeCCRooms).forEach((code) => {
            if (code === exceptCode) return;
            const player = activeCCRooms[code].players[socket.id];
            if (!player) return;

            socket.leave(code);
            if (player.isCaster) {
                closeRoom(code, 'The host ended that game.');
            } else {
                playerLeftRoom(socket.id, code);
            }
        });
    };

    // 🧹 Close rooms that are empty, finished or idle
    startRoomJanitor({
        label: 'Couch Cast',
        namespace: CCNS,
        rooms: activeCCRooms,
        isFinished: (room) => room.gameState === 'scoreboard' && room.currentRound >= room.totalRounds,
        closeRoom,
    });

    CCNS.on('connection', (socket) => {
        console.log(`[CastCouch Socket]\n Player Connected: ${socket.id}`);

        // ----------Event: Room Creation-----------
        socket.on('createRoom', (data) => {
            const nameToUse = data.playerName || 'Caster';
            const expansion = normalizeExpansion(data.expansion);
            leaveOtherRooms(socket);
            const { roomCode, players } = createRoomLogic(socket, activeCCRooms, nameToUse, expansion, normalizeRounds(data.totalRounds, DEFAULT_ROUNDS));
            socket.join(roomCode);
            socket.emit('roomCreated', { roomCode, players });
        });

        // --- Event: Room Joining ---
        socket.on('joinRoom', ({ roomCode, playerName, playerId }) => {
            if(!roomCode) return;
            const code = roomCode.trim().toUpperCase();
            const currentRoom = activeCCRooms[code];

            if (currentRoom) {
                leaveOtherRooms(socket, code);

                // 1. Check if this is an existing player trying to reconnect.
                // The saved ID lives in the browser, so every tab/window of one browser shares it:
                // the name has to match too, or a second tab would take over the first tab's seat.
                const joiningName = (playerName || 'Anonymous').trim().toLowerCase();
                const existingPlayerKey = Object.keys(currentRoom.players).find(
                    (key) => currentRoom.players[key].playerId === playerId
                        && currentRoom.players[key].name.trim().toLowerCase() === joiningName
                );

                // 2. NEW: Name Uniqueness Check (Only for brand-new players)
                if (!existingPlayerKey) {
                    const requestedName = (playerName || 'Anonymous').trim();
                    const normalizedName = requestedName.toLowerCase();
                    
                    const isNameTaken = Object.values(currentRoom.players).some(
                        (p) => p.name.trim().toLowerCase() === normalizedName
                    );

                    if (isNameTaken) {
                        // Reject the join request and send error to trigger frontend toast
                        return socket.emit('joinError', 'That name is already taken in this room. Pick another!');
                    }
                }

                // 3. Name is safe (or it's a reconnecting player). Let them join the socket room!
                socket.join(code);
                
                // Cancel the destruct timer if someone comes back!
                if (currentRoom.destroyTimer) {
                    clearTimeout(currentRoom.destroyTimer);
                    currentRoom.destroyTimer = null;
                }                
                
                // Sync State
                const syncPayload = {
                    gameState: currentRoom.gameState, 
                    roomData: getSafeRoom(currentRoom),
                    currentPrompt: currentRoom.currentPrompt || null,
                    promptOptions: currentRoom.promptOptions || null, 
                    submissions: currentRoom.promptSubmissions || null,
                    roundResults: currentRoom.roundResults || null,
                    playerStatus: currentRoom.players[existingPlayerKey || socket.id] || null, // Updated to use correct player status
                    endTime: currentRoom.endTime || null 
                };
                
                socket.emit('sync_game_state', syncPayload);
                
                // 4. Handle Reconnect vs New Player state mapping
                if (existingPlayerKey){
                    console.log(`[Reconnection] Player ${playerName} reconnected.`);
                    const playerData = currentRoom.players[existingPlayerKey];
                    playerData.id = socket.id;
                    playerData.isConnected = true; 
                    
                    if (currentRoom.hostId === existingPlayerKey) {
                        currentRoom.hostId = socket.id;
                    }

                    // Their hand comes with them
                    if (currentRoom.hands[existingPlayerKey]) {
                        currentRoom.hands[socket.id] = currentRoom.hands[existingPlayerKey];
                        delete currentRoom.hands[existingPlayerKey];
                    }
                    if (currentRoom.playedCards[existingPlayerKey]) {
                        currentRoom.playedCards[socket.id] = currentRoom.playedCards[existingPlayerKey];
                        delete currentRoom.playedCards[existingPlayerKey];
                    }
                    
                    delete currentRoom.players[existingPlayerKey];
                    currentRoom.players[socket.id] = playerData;

                } else {
                    console.log(`[New Player] ${playerName} joined.`);
                    const isFirstActualPlayer = Object.keys(currentRoom.players).length === 1; // 1 because of the Caster
                    
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
                // Using joinError here as well so the frontend can handle both with a toast!
                socket.emit('joinError', 'Room not found!'); 
            }
        });

        // --- Event: Player Requests Their Hand ---
        socket.on('request_hand', async () => {
            try {
                const room = findRoomBySocket(socket.id);
                if (!room) return;

                const key = `${room.roomCode}:${socket.id}`;
                if (!handDeals.has(key)) {
                    handDeals.set(key, dealHand(room, socket.id).finally(() => handDeals.delete(key)));
                }
                const hand = await handDeals.get(key);

                socket.emit('receive_hand', { hand });
            } catch (err) {
                console.error("Error drawing hand:", err);
            }
        });

        // --- Event: The caster wants another game with the same players ---
        socket.on('playAgain', ({ roomCode } = {}) => {
            const room = activeCCRooms[roomCode];
            if (!room || !room.players[socket.id]?.isCaster) return;
            if (room.gameState !== 'scoreboard') return;   // only from the final scores
            resetForNewGame(roomCode);
        });

        // --- Event: The caster is done for the night ---
        socket.on('endGame', ({ roomCode } = {}) => {
            const room = activeCCRooms[roomCode];
            if (!room || !room.players[socket.id]?.isCaster) return;
            socket.leave(roomCode);
            closeRoom(roomCode, 'Thanks for playing! The host ended the game.');
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
                    const randomPrompts = await drawCards('prompt', room.expansion, 3);
                    
                    // Store the prompts in the room state so the mobile host can access them
                    room.promptOptions = randomPrompts;
                    startPromptTimer(roomCode);
                    
                    CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
                    // // Explicitly broadcast the 3 prompts to the room so the TV and Judge receive them
                    // CCNS.to(roomCode).emit('prompt_options', { prompts: randomPrompts });
                    
                } catch (err) { console.error(err); }
            }
        });

        // --- Event: Host Selects Prompt -> STARTS TIMER ---
        // autoPicked: the judge's clock ran out and their phone picked at random
        socket.on('select_prompt', ({ roomCode, selectedPrompt, autoPicked }) => {
            const room = activeCCRooms[roomCode];
            if (room && socket.id === room.hostId) {
                startWriting(roomCode, selectedPrompt, autoPicked);
            }
        });

        // --- Event: Player Submits Their Answer ---
        socket.on('submit_answer', ({ roomCode, answer, usedWriteIn, cardId }) => { // 👈 Catch it here
            const room = activeCCRooms[roomCode];
            const player = room?.players[socket.id];
            
            if (player && socket.id !== room.hostId && !player.isCaster && room.gameState === 'writing') {
                // One write-in per game
                if (usedWriteIn && player.hasUsedWriteIn) return;

                // A played card leaves the hand and is replaced next round (a write-in costs no card)
                if (!usedWriteIn) {
                    const hand = room.hands[socket.id] || [];
                    const card = hand.find((c) => String(c._id) === String(cardId)) || hand.find((c) => c.text === answer);
                    if (card) room.playedCards[socket.id] = String(card._id);
                }

                player.currentAnswer = answer;
                player.hasSubmitted = true;
                player.answeredAt = Date.now();
                player.currentIsWriteIn = !!usedWriteIn;

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
                // FIX: Let the helper function compile the answers and handle the state change safely
                advanceToJudging(roomCode); 
            }
        });

        // --- Event: Host Picks the Winning Answer ---
        socket.on('pick_winner', ({ roomCode, winningPlayerId }) => {
            const room = activeCCRooms[roomCode];
            if (!room || socket.id !== room.hostId) return;
            crownWinner(roomCode, winningPlayerId);
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
                    
                    const randomPrompts = await drawCards('prompt', room.expansion, 3);
                    room.promptOptions = randomPrompts;
                    startPromptTimer(roomCode);
                    
                    socket.emit('prompt_options', { prompts: randomPrompts });
                    CCNS.to(roomCode).emit('room_updated', getSafeRoom(room));
                    
                } catch (err) {
                    console.error("Error starting next round:", err);
                }
            }
        });

        // --- Event: Leave Room (player backed out to the menu) ---
        socket.on('leaveRoom', ({ roomCode } = {}) => {
            const code = (roomCode || '').trim().toUpperCase();
            if (!activeCCRooms[code]?.players[socket.id]) return;
            socket.leave(code);
            playerLeftRoom(socket.id, code);
        });

        // --- Event: Handle Disconnection ---
        socket.on('disconnect', () => {
            Object.keys(activeCCRooms)
                .filter(code => activeCCRooms[code].players[socket.id])
                .forEach(code => playerLeftRoom(socket.id, code));
        });
    });
}