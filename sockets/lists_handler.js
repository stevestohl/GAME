// 📝 List Cast & Listopia: a list-making party game (inspired by Listography).
//
// Both games share this one handler; the room's `mode` says which one it is:
//   'cast'   -> List Cast. One device casts to the TV (room codes start with L).
//   'phones' -> Listopia. No TV: everyone, including whoever made the room, plays on a phone (codes start with O).
//
// A round:
//   writing -> everyone gets the same category and writes up to LIST_SIZE answers before the clock runs out
//   compare -> lists are compared; answers someone else also wrote are CROSSED OUT automatically
//   voting  -> everyone votes on the answers that are left: does it count or not?
//   results -> every answer still standing scores POINTS_PER_ITEM
//   scoreboard -> then the next round (or the final standings)
import { randomUUID } from "crypto";
import { normalizeExpansion, normalizeRounds } from "../db/drawCards.js";
import { drawListCategories } from "../db/listCategories.js";
import { compareLists, resolveVotes } from "./listMatching.js";
import { startRoomJanitor } from "./roomJanitor.js";

const activeListRooms = {};

// Lets the HTTP side (voice-overs) check that a List Cast room is real and still open
export const getListCastRoom = (roomCode) => {
    const room = activeListRooms[roomCode];
    return room && room.mode === 'cast' ? room : null;
};

// --- Game settings ---
const LIST_SIZE = 5;                 // answers per list
const MAX_ITEM_LENGTH = 40;          // characters per answer
const POINTS_PER_ITEM = 100;         // for every answer that survives
const DEFAULT_ROUNDS = 5;
const MIN_PLAYERS = 2;

// --- Pacing ---
const WRITING_TIME = 60 * 1000;      // time to write your list
const COMPARE_TIME = 9 * 1000;       // watching the matches get crossed out
const VOTING_TIME = 45 * 1000;       // time to vote on what's left
const RESULTS_TIME = 10 * 1000;      // the round's points on screen
const SCOREBOARD_TIME = 7 * 1000;    // scores between rounds
const GRACE = 500;                   // a last-second tap still counts

const playerCount = (room) => Object.values(room.players).filter(p => !p.isCaster && p.isConnected).length;

// What the screens are allowed to see. While writing, nobody sees anyone else's list
// (just how many answers they have); while voting, nobody sees anyone else's votes.
const getSafeRoom = (room) => {
    if (!room) return null;
    const players = {};
    Object.values(room.players).forEach((p) => {
        players[p.id] = {
            id: p.id,
            name: p.name,
            score: p.score,
            seat: p.joinOrder,
            isCaster: p.isCaster,
            isPlayerHost: p.isPlayerHost,
            isConnected: p.isConnected,
            joinOrder: p.joinOrder,
            itemCount: (p.list || []).filter(Boolean).length,
            hasSubmitted: !!p.hasSubmitted,
            hasVoted: !!p.hasVoted,
            roundPoints: p.roundPoints || 0,
        };
    });

    return {
        roomCode: room.roomCode,
        mode: room.mode,
        gameState: room.gameState,
        expansion: room.expansion,
        hostId: room.hostId,
        currentRound: room.currentRound,
        totalRounds: room.totalRounds,
        category: room.category,
        listSize: LIST_SIZE,
        maxItemLength: MAX_ITEM_LENGTH,
        pointsPerItem: POINTS_PER_ITEM,
        minPlayers: MIN_PLAYERS,
        endTime: room.endTime,
        isGameOver: room.isGameOver,
        voterSeats: room.voterSeats || [],
        // The lists only go public once writing is over
        board: ['compare', 'voting', 'results'].includes(room.gameState) ? room.board : null,
        players,
    };
};

const makeRoomCode = (mode) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code;
    do {
        code = mode === 'cast' ? 'L' : 'O';
        for (let i = 0; i < 3; i++) code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    } while (activeListRooms[code]);
    return code;
};

// Tidies a list sent from a phone: right length, trimmed, no runaway text
const cleanList = (items) => {
    if (!Array.isArray(items)) return [];
    return items.slice(0, LIST_SIZE).map((item) =>
        typeof item === 'string' ? item.replace(/\s+/g, ' ').trimStart().slice(0, MAX_ITEM_LENGTH) : ''
    );
};

export default function registerListsNamespace(LNS) {

    const broadcast = (roomCode) => {
        LNS.to(roomCode).emit('room_updated', getSafeRoom(activeListRooms[roomCode]));
    };

    const clearTimer = (room) => {
        if (room.timerId) {
            clearTimeout(room.timerId);
            room.timerId = null;
        }
    };

    // Runs `next` after `ms`, but only if the room is still open and still in `state`
    const schedule = (roomCode, room, state, ms, next) => {
        clearTimer(room);
        room.timerId = setTimeout(() => {
            room.timerId = null;
            if (activeListRooms[roomCode] !== room || room.gameState !== state) return;
            next();
        }, ms);
    };

    const activePlayers = (room) => Object.values(room.players).filter(p => !p.isCaster && p.isConnected);

    // --- A new round: new category, blank lists, start the clock ---
    const startRound = (roomCode) => {
        const room = activeListRooms[roomCode];
        if (!room) return;

        room.category = room.categories[room.currentRound - 1] || 'Things that make you smile';
        room.board = null;
        room.voterSeats = [];
        Object.values(room.players).forEach((p) => {
            p.list = [];
            p.hasSubmitted = false;
            p.ballot = [];
            p.hasVoted = false;
            p.roundPoints = 0;
        });

        room.gameState = 'writing';
        room.endTime = Date.now() + WRITING_TIME;
        schedule(roomCode, room, 'writing', WRITING_TIME + GRACE, () => startCompare(roomCode));

        LNS.to(roomCode).emit('round_started', { round: room.currentRound });
        broadcast(roomCode);
    };

    // --- Pencils down: compare the lists and cross out the matches ---
    const startCompare = (roomCode) => {
        const room = activeListRooms[roomCode];
        if (!room || room.gameState !== 'writing') return;
        clearTimer(room);

        // Everyone who wrote something is on the board, even if their phone dropped out
        const writers = Object.values(room.players)
            .filter(p => !p.isCaster && (p.isConnected || (p.list || []).some(Boolean)))
            .sort((a, b) => a.joinOrder - b.joinOrder)
            .map(p => ({ seat: p.joinOrder, name: p.name, list: p.list || [] }));

        room.board = compareLists(writers);
        room.gameState = 'compare';
        room.endTime = null;
        broadcast(roomCode);

        const hasOpenItems = room.board.some(entry => entry.items.some(item => item.status === 'open'));
        schedule(roomCode, room, 'compare', COMPARE_TIME, () => {
            if (hasOpenItems) startVoting(roomCode);
            else showResults(roomCode);
        });
    };

    // --- Vote on everything that wasn't crossed out ---
    const startVoting = (roomCode) => {
        const room = activeListRooms[roomCode];
        if (!room || room.gameState !== 'compare') return;

        // Who can vote: everyone here right now (a player who joins mid-vote waits for the next round)
        room.voterSeats = activePlayers(room).map(p => p.joinOrder);
        Object.values(room.players).forEach((p) => {
            p.ballot = [];
            p.hasVoted = false;
        });

        room.gameState = 'voting';
        room.endTime = Date.now() + VOTING_TIME;
        schedule(roomCode, room, 'voting', VOTING_TIME + GRACE, () => showResults(roomCode));
        broadcast(roomCode);
    };

    // --- Count the votes and hand out the points ---
    const showResults = (roomCode) => {
        const room = activeListRooms[roomCode];
        if (!room || !['compare', 'voting'].includes(room.gameState)) return;
        clearTimer(room);

        const voters = Object.values(room.players)
            .filter(p => (room.voterSeats || []).includes(p.joinOrder))
            .map(p => ({ seat: p.joinOrder, ballot: p.ballot || [] }));
        resolveVotes(room.board, voters);

        room.board.forEach((entry) => {
            const player = Object.values(room.players).find(p => p.joinOrder === entry.seat);
            const points = entry.items.filter(item => item.counts).length * POINTS_PER_ITEM;
            entry.points = points;
            if (player) {
                player.roundPoints = points;
                player.score += points;
            }
        });

        room.gameState = 'results';
        room.endTime = null;
        broadcast(roomCode);

        schedule(roomCode, room, 'results', RESULTS_TIME, () => showScoreboard(roomCode));
    };

    // --- Scores between rounds; after the last round this is the final screen ---
    const showScoreboard = (roomCode) => {
        const room = activeListRooms[roomCode];
        if (!room) return;

        room.isGameOver = room.currentRound >= room.totalRounds;
        room.gameState = 'scoreboard';
        broadcast(roomCode);

        if (room.isGameOver) return; // stay on the final standings

        schedule(roomCode, room, 'scoreboard', SCOREBOARD_TIME, () => {
            room.currentRound += 1;
            startRound(roomCode);
        });
    };

    // --- Done early? Move on as soon as everyone still here has finished ---
    const checkEveryoneDone = (roomCode) => {
        const room = activeListRooms[roomCode];
        if (!room) return;
        const here = activePlayers(room);

        if (room.gameState === 'writing') {
            if (here.length > 0 && here.every(p => p.hasSubmitted)) startCompare(roomCode);
        } else if (room.gameState === 'voting') {
            const voters = here.filter(p => room.voterSeats.includes(p.joinOrder));
            if (voters.length === 0 || voters.every(p => p.hasVoted)) showResults(roomCode);
        }
    };

    // --- A phone (or the TV) dropped out of a room ---
    const playerLeftRoom = (socketId, roomCode) => {
        const room = activeListRooms[roomCode];
        const player = room?.players[socketId];
        if (!room || !player) return;

        player.isConnected = false;
        console.log(`[Lists] ${player.name} left room ${roomCode}`);

        // Nobody left at all: tidy the room away after 5 minutes
        if (Object.values(room.players).every(p => !p.isConnected)) {
            room.destroyTimer = setTimeout(() => {
                console.log(`[Lists] Destroying abandoned room ${roomCode}`);
                clearTimer(room);
                delete activeListRooms[roomCode];
            }, 5 * 60 * 1000);
        }

        // The room leader left: hand the start button to the next player
        if (socketId === room.hostId) {
            const next = activePlayers(room).sort((a, b) => a.joinOrder - b.joinOrder)[0];
            if (next) {
                room.hostId = next.id;
                Object.values(room.players).forEach(p => { p.isPlayerHost = p.id === next.id; });
            }
        }

        checkEveryoneDone(roomCode);
        broadcast(roomCode);
    };

    // --- End a game for everyone still in it ---
    const closeRoom = (roomCode, message) => {
        const room = activeListRooms[roomCode];
        if (!room) return;
        clearTimer(room);
        if (room.destroyTimer) clearTimeout(room.destroyTimer);

        console.log(`[Lists] Room ${roomCode} closed: ${message}`);
        LNS.to(roomCode).emit('room_closed', { roomCode, message });
        LNS.in(roomCode).socketsLeave(roomCode);
        delete activeListRooms[roomCode];
    };

    // --- One device, one game (see the same helper in couchcast_handler.js) ---
    const leaveOtherRooms = (socket, exceptCode) => {
        Object.keys(activeListRooms).forEach((code) => {
            if (code === exceptCode) return;
            const player = activeListRooms[code].players[socket.id];
            if (!player) return;

            socket.leave(code);
            if (player.isCaster) closeRoom(code, 'The host ended that game.');
            else playerLeftRoom(socket.id, code);
        });
    };

    // 🧹 Close rooms that are empty, finished or idle
    startRoomJanitor({
        label: 'Lists',
        namespace: LNS,
        rooms: activeListRooms,
        isFinished: (room) => room.gameState === 'scoreboard' && !!room.isGameOver,
        closeRoom,
    });

    // Who's allowed to press "start": the room leader, or the TV in List Cast
    const canControl = (room, socket) => socket.id === room.hostId || !!room.players[socket.id]?.isCaster;

    LNS.on('connection', (socket) => {

        // ---------- Event: Room Creation ----------
        // List Cast: the TV makes the room and sits in it as the caster.
        // Listopia: the creator's phone makes the room, then joins it as the first player (the room leader).
        socket.on('createRoom', (data = {}) => {
            leaveOtherRooms(socket);
            const mode = data.mode === 'cast' ? 'cast' : 'phones';
            const roomCode = makeRoomCode(mode);

            activeListRooms[roomCode] = {
                roomCode,
                mode,
                gameId: randomUUID(),
                gameState: 'lobby',
                expansion: normalizeExpansion(data.expansion),
                totalRounds: normalizeRounds(data.totalRounds, DEFAULT_ROUNDS),
                categories: [],
                currentRound: 1,
                category: null,
                board: null,
                voterSeats: [],
                hostId: null,
                endTime: null,
                timerId: null,
                isGameOver: false,
                playerCount: 0,
                players: {},
            };

            if (mode === 'cast') {
                activeListRooms[roomCode].players[socket.id] = {
                    id: socket.id,
                    name: data.playerName || 'Caster',
                    score: 0,
                    isCaster: true,
                    isPlayerHost: false,
                    isConnected: true,
                    joinOrder: -1,
                };
                socket.join(roomCode);
            }

            socket.emit('roomCreated', { roomCode });
        });

        // ---------- Event: Room Joining (phones, and the TV after a refresh) ----------
        socket.on('joinRoom', ({ roomCode, playerName, playerId } = {}) => {
            if (!roomCode) return;
            const code = roomCode.trim().toUpperCase();
            const room = activeListRooms[code];
            if (!room) return socket.emit('joinError', 'Room not found!');

            leaveOtherRooms(socket, code);

            const requestedName = (playerName || 'Anonymous').trim().slice(0, 12) || 'Anonymous';
            const joiningName = requestedName.toLowerCase();

            // A returning device: same saved ID and the same name
            const existingKey = Object.keys(room.players).find(
                (key) => room.players[key].playerId === playerId
                    && room.players[key].name.trim().toLowerCase() === joiningName
            );

            if (!existingKey) {
                const isNameTaken = Object.values(room.players).some(p => p.name.trim().toLowerCase() === joiningName);
                if (isNameTaken) return socket.emit('joinError', 'That name is already taken in this room. Pick another!');
            }

            socket.join(code);
            if (room.destroyTimer) {
                clearTimeout(room.destroyTimer);
                room.destroyTimer = null;
            }

            let player;
            if (existingKey) {
                player = room.players[existingKey];
                player.id = socket.id;
                player.isConnected = true;
                if (room.hostId === existingKey) room.hostId = socket.id;
                delete room.players[existingKey];
                room.players[socket.id] = player;
            } else {
                const isFirstPlayer = !Object.values(room.players).some(p => !p.isCaster && p.isConnected);
                player = {
                    playerId,
                    id: socket.id,
                    name: requestedName,
                    score: 0,
                    isCaster: false,
                    isPlayerHost: isFirstPlayer,
                    isConnected: true,
                    joinOrder: room.playerCount,
                    list: [],
                    hasSubmitted: false,
                    ballot: [],
                    hasVoted: false,
                    roundPoints: 0,
                };
                room.players[socket.id] = player;
                room.playerCount += 1;
                if (isFirstPlayer) {
                    Object.values(room.players).forEach(p => { p.isPlayerHost = p.id === socket.id; });
                    room.hostId = socket.id;
                }
            }

            // Give a returning phone back what it had typed / voted so far
            if (!player.isCaster) {
                socket.emit('my_state', {
                    list: player.list || [],
                    hasSubmitted: !!player.hasSubmitted,
                    ballot: player.ballot || [],
                    hasVoted: !!player.hasVoted,
                });
            }

            broadcast(code);
        });

        // ---------- Event: Room leader starts the game (lobby -> rules) ----------
        socket.on('startGame', async ({ roomCode } = {}) => {
            const room = activeListRooms[roomCode];
            if (!room || room.gameState !== 'lobby' || !canControl(room, socket)) return;
            if (playerCount(room) < MIN_PLAYERS) {
                return socket.emit('joinError', `You need at least ${MIN_PLAYERS} players to start.`);
            }

            // Topics come from MongoDB (with the built-in list as a backup, so this never comes back empty)
            if (room.isStarting) return; // a double tap only starts once
            room.isStarting = true;
            try {
                room.categories = await drawListCategories(room.expansion, room.totalRounds);
            } finally {
                room.isStarting = false;
            }
            if (activeListRooms[roomCode] !== room || room.gameState !== 'lobby') return;

            room.currentRound = 1;
            room.gameState = 'rules';
            broadcast(roomCode);
        });

        // ---------- Event: Rules are done (rules -> first round) ----------
        socket.on('startRounds', ({ roomCode } = {}) => {
            const room = activeListRooms[roomCode];
            if (!room || room.gameState !== 'rules' || !canControl(room, socket)) return;
            startRound(roomCode);
        });

        // ---------- Event: A phone sends its list as it's typed (so time-up never loses answers) ----------
        socket.on('update_list', ({ roomCode, items } = {}) => {
            const room = activeListRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'writing' || player.hasSubmitted) return;

            const before = (player.list || []).filter(Boolean).length;
            player.list = cleanList(items);
            // Only bother the other screens when the answer count changes
            if (player.list.filter(Boolean).length !== before) broadcast(roomCode);
        });

        // ---------- Event: "I'm done" — lock the list in ----------
        socket.on('submit_list', ({ roomCode, items } = {}) => {
            const room = activeListRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'writing' || player.hasSubmitted) return;

            player.list = cleanList(items);
            player.hasSubmitted = true;
            broadcast(roomCode);
            checkEveryoneDone(roomCode);
        });

        // ---------- Event: A player's votes: the answers they say DON'T count ----------
        socket.on('submit_votes', ({ roomCode, ballot } = {}) => {
            const room = activeListRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'voting' || player.hasVoted) return;
            if (!room.voterSeats.includes(player.joinOrder)) return;

            // Only real, still-open answers by OTHER players can be voted down
            const allowed = new Set();
            room.board.forEach((entry) => {
                if (entry.seat === player.joinOrder) return;
                entry.items.forEach((item) => { if (item.status === 'open') allowed.add(item.id); });
            });
            player.ballot = Array.isArray(ballot) ? [...new Set(ballot)].filter(id => allowed.has(id)) : [];
            player.hasVoted = true;

            broadcast(roomCode);
            checkEveryoneDone(roomCode);
        });

        // ---------- Event: Leave / Disconnect ----------
        socket.on('leaveRoom', ({ roomCode } = {}) => {
            const code = (roomCode || '').trim().toUpperCase();
            if (!activeListRooms[code]?.players[socket.id]) return;
            socket.leave(code);
            playerLeftRoom(socket.id, code);
        });

        socket.on('disconnect', () => {
            Object.keys(activeListRooms)
                .filter(code => activeListRooms[code].players[socket.id])
                .forEach(code => playerLeftRoom(socket.id, code));
        });
    });
}
