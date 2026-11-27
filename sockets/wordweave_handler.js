// 🧶 Word Weave: the word-grid party game, on a TV or on just phones.
//
// Everyone gets the same grid of letters and races the clock to weave words through letters that touch
// (diagonals too), never using a letter twice in a word. When time's up, any word two or more players found
// is crossed out for all of them, and the rest score by length. Several rounds, a new grid each time.
//
// The room's `mode` says how it's played:
//   'tv'     -> one device casts to the TV (the grid, the clock, the reveal); the phones are where you weave
//   'phones' -> no TV: whoever made the room plays too, as the room leader, and every phone shows the results
//
//   lobby -> rules -> intro (round N of M, 3-2-1) -> playing (the clock) -> round_results -> intro ... -> final
//
// Room codes start with "W". The rules, the letters, the word list and the score are in sockets/wordweaveRules.js.
import { newSnake, snakeEat, snakeCrash, snakePlayerGone } from "./snakeGame.js";
import { guardCreateRoom } from '../db/gameVisibility.js';
import { randomUUID } from "crypto";
import { startRoomJanitor } from "./roomJanitor.js";
import {
    loadWords, makeGrid, scoreRound, cleanWord, isWord, isBlocked, pointsFor, MIN_LENGTH, SIZES,
} from "./wordweaveRules.js";

const activeWordWeaveRooms = {};

// Lets the HTTP side (voice-overs) check that a TV room is real and still open
export const getWordWeaveRoom = (roomCode) => {
    const room = activeWordWeaveRooms[roomCode];
    return room && room.mode === 'tv' ? room : null;
};

// --- Game settings (the setup screen offers the same lists: src/features/WordWeave/wordWeaveOptions.js) ---
export const ROUND_OPTIONS = Array.from({ length: 50 }, (_, i) => i + 1);
const DEFAULT_ROUNDS = 3;
export const SECONDS_OPTIONS = [60, 90, 120, 150, 180, 240, 300];
const DEFAULT_SECONDS = { 4: 120, 5: 180 };
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 12;

const SECOND = 1000;
const RULES_TIME = { tv: 50 * SECOND, phones: 40 * SECOND };   // the TV moves on when its narration ends
const INTRO_TIME = 4 * SECOND;            // "Round 2 of 5", 3-2-1, then the grid
const GRACE = 1500;                       // a word sent in the last second still counts
const RESULTS_TIME = 45 * SECOND;         // the reveal, then the next round (the leader can go sooner)
const BROADCAST_GAP = 300;                // word counts go out at most this often while everyone's weaving

const makeRoomCode = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code;
    do {
        code = 'W';
        for (let i = 0; i < 3; i++) code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    } while (activeWordWeaveRooms[code]);
    return code;
};

const people = (room) => Object.values(room.players).filter((p) => !p.isCaster);
const here = (room) => people(room).filter((p) => p.isConnected);
const byJoinOrder = (a, b) => a.joinOrder - b.joinOrder;
const showsGrid = (state) => ['playing', 'round_results', 'final'].includes(state);

/** Everyone's totals, best first (ties share a place) */
const standingsOf = (room) => {
    const list = people(room)
        .filter((p) => p.isConnected || p.score > 0 || p.history.some((pts) => pts > 0))
        .map((p) => ({ key: p.key, name: p.name, avatar: p.avatar || null, score: p.score, history: p.history, isConnected: p.isConnected }))
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    list.forEach((entry, i) => { entry.place = i > 0 && list[i - 1].score === entry.score ? list[i - 1].place : i + 1; });
    return list;
};

// What every screen may see. Nobody sees anyone else's words until the round is over.
const getSafeRoom = (room) => {
    if (!room) return null;
    const players = {};
    Object.values(room.players).forEach((p) => {
        players[p.id] = {
            id: p.id,
            key: p.key || null,
            name: p.name,
            avatar: p.avatar || null,
            isCaster: p.isCaster,
            isPlayerHost: p.isPlayerHost,
            isConnected: p.isConnected,
            joinOrder: p.joinOrder,
            score: p.score || 0,
            wordCount: p.found ? p.found.length : 0,
        };
    });
    return {
        roomCode: room.roomCode,
        mode: room.mode,
        gameState: room.gameState,
        hostId: room.hostId,
        size: room.size,
        roundSeconds: room.roundSeconds,
        totalRounds: room.totalRounds,
        round: room.round,
        endTime: room.endTime,
        serverTime: Date.now(),
        isPaused: !!room.isPaused,
        isGameOver: !!room.isGameOver,
        minPlayers: MIN_PLAYERS,
        maxPlayers: MAX_PLAYERS,
        minLength: MIN_LENGTH,
        snake: room.snake ? { scores: room.snake.scores } : null,   // 🐍 the lobby game's scores
        grid: showsGrid(room.gameState) ? room.letters : null,
        possible: showsGrid(room.gameState) ? room.solution?.size || 0 : 0,
        results: ['round_results', 'final'].includes(room.gameState) ? room.results : null,
        standings: standingsOf(room),
        bestOfGame: room.bestOfGame,
        players,
    };
};

export default function registerWordWeaveNamespace(WNS) {
    loadWords();   // read the word list now, not in the middle of someone's first round

    const broadcast = (roomCode) => {
        const room = activeWordWeaveRooms[roomCode];
        if (!room) return;
        if (room.broadcastTimer) {
            clearTimeout(room.broadcastTimer);
            room.broadcastTimer = null;
        }
        room.lastBroadcast = Date.now();
        WNS.to(roomCode).emit('room_updated', getSafeRoom(room));
    };

    // While everyone's weaving, a found word only changes the counts: send those a few times a second at most
    const broadcastSoon = (roomCode) => {
        const room = activeWordWeaveRooms[roomCode];
        if (!room || room.broadcastTimer) return;
        const wait = Math.max(0, BROADCAST_GAP - (Date.now() - (room.lastBroadcast || 0)));
        room.broadcastTimer = setTimeout(() => {
            room.broadcastTimer = null;
            if (activeWordWeaveRooms[roomCode] === room) broadcast(roomCode);
        }, wait);
    };

    // A phone's own words this round (sent when it joins or comes back)
    const sendMyWords = (room, player) => {
        WNS.to(player.id).emit('my_words', { round: room.round, words: player.found || [] });
    };

    const clearTimer = (room) => {
        if (room.timerId) {
            clearTimeout(room.timerId);
            room.timerId = null;
        }
        room.timerFn = null;
        room.pausedTimerLeft = null;
    };

    // Runs `next` after `ms`, but only if the room is still open and still in `state`.
    // ⏸️ It remembers what it will do and when, so a pause can stop the clock and pick up exactly where it left off.
    const schedule = (roomCode, room, state, ms, next) => {
        clearTimer(room);
        const fire = () => {
            if (activeWordWeaveRooms[roomCode] !== room || room.gameState !== state) return;
            next();
        };
        room.timerFn = fire;
        if (room.isPaused) {
            room.pausedTimerLeft = ms;
            return;
        }
        room.timerDueAt = Date.now() + ms;
        room.timerId = setTimeout(() => {
            room.timerId = null;
            room.timerFn = null;
            fire();
        }, ms);
    };

    // ⏸️ Paused: the clock stops, and words wait until it's back on
    const pauseRoom = (room) => {
        if (room.isPaused) return;
        const now = Date.now();
        room.isPaused = true;
        room.pausedTimerLeft = room.timerId ? Math.max(0, room.timerDueAt - now) : null;
        if (room.timerId) clearTimeout(room.timerId);
        room.timerId = null;
        room.pausedEndTimeLeft = room.endTime ? Math.max(0, room.endTime - now) : null;
        room.endTime = null;
    };

    const resumeRoom = (room) => {
        if (!room.isPaused) return;
        const now = Date.now();
        const { pausedTimerLeft, pausedEndTimeLeft, timerFn } = room;
        room.isPaused = false;
        room.pausedTimerLeft = null;
        room.pausedEndTimeLeft = null;
        if (pausedEndTimeLeft !== null && pausedEndTimeLeft !== undefined) room.endTime = now + pausedEndTimeLeft;
        if (timerFn && pausedTimerLeft !== null && pausedTimerLeft !== undefined) {
            room.timerFn = timerFn;
            room.timerDueAt = now + pausedTimerLeft;
            room.timerId = setTimeout(() => {
                room.timerId = null;
                room.timerFn = null;
                timerFn();
            }, pausedTimerLeft);
        }
    };

    const HELD_WHILE_PAUSED = new Set(['next_round', 'startRounds']);

    // ===================== A ROUND =====================

    const startRound = (roomCode) => {
        const room = activeWordWeaveRooms[roomCode];
        if (!room) return;
        room.round += 1;
        const { letters, solution } = makeGrid(room.size);
        room.letters = letters;
        room.solution = solution;
        room.results = null;
        people(room).forEach((p) => { p.found = []; });
        room.gameState = 'intro';
        room.endTime = Date.now() + INTRO_TIME;
        console.log(`[Word Weave] Room ${roomCode}: round ${room.round} of ${room.totalRounds}, ${solution.size} words to find.`);
        broadcast(roomCode);
        people(room).filter((p) => p.isConnected).forEach((p) => sendMyWords(room, p));
        schedule(roomCode, room, 'intro', INTRO_TIME, () => beginWeaving(roomCode));
    };

    const beginWeaving = (roomCode) => {
        const room = activeWordWeaveRooms[roomCode];
        if (!room) return;
        room.gameState = 'playing';
        const time = room.roundSeconds * SECOND;
        room.endTime = Date.now() + time;
        broadcast(roomCode);
        schedule(roomCode, room, 'playing', time + GRACE, () => endRound(roomCode));
    };

    const endRound = (roomCode) => {
        const room = activeWordWeaveRooms[roomCode];
        if (!room || room.gameState !== 'playing') return;
        clearTimer(room);
        // Everyone who's here, and anyone who found words before they dropped out
        const players = people(room).filter((p) => p.isConnected || p.found.length).sort(byJoinOrder);
        const scored = scoreRound(players.map((p) => ({ key: p.key, words: p.found })), room.letters, room.solution);
        const byKey = new Map(players.map((p) => [p.key, p]));
        scored.players.forEach((result) => {
            const player = byKey.get(result.key);
            player.score += result.points;
            player.history[room.round - 1] = result.points;
            result.name = player.name;
            result.avatar = player.avatar || null;
            result.total = player.score;
        });
        // Anyone here who missed the round entirely still gets a 0 for it
        people(room).forEach((p) => { if (p.history[room.round - 1] === undefined) p.history[room.round - 1] = 0; });
        scored.players.sort((a, b) => b.points - a.points || b.total - a.total || a.name.localeCompare(b.name));

        // The best word of the whole game, so far
        if (scored.best) {
            const finder = byKey.get(scored.best.key);
            const best = { ...scored.best, name: finder.name, avatar: finder.avatar || null, round: room.round };
            if (!room.bestOfGame || best.word.length > room.bestOfGame.word.length) room.bestOfGame = best;
        }

        room.results = { round: room.round, size: room.size, letters: room.letters, ...scored };
        room.isGameOver = room.round >= room.totalRounds;
        room.gameState = 'round_results';
        room.endTime = Date.now() + RESULTS_TIME;
        console.log(`[Word Weave] Room ${roomCode}: round ${room.round} scored ${scored.players.map((p) => `${p.name} ${p.points}`).join(', ') || '(nobody)'}.`);
        broadcast(roomCode);
        schedule(roomCode, room, 'round_results', RESULTS_TIME, () => afterResults(roomCode));
    };

    const afterResults = (roomCode) => {
        const room = activeWordWeaveRooms[roomCode];
        if (!room || room.gameState !== 'round_results') return;
        clearTimer(room);
        if (room.isGameOver) {
            room.gameState = 'final';
            room.endTime = null;
            broadcast(roomCode);
            return;
        }
        startRound(roomCode);
    };

    // ===================== PEOPLE =====================

    const newGame = (room) => {
        clearTimer(room);
        room.round = 0;
        room.letters = null;
        room.solution = null;
        room.results = null;
        room.bestOfGame = null;
        room.isGameOver = false;
        room.endTime = null;
        room.isPaused = false;
        people(room).forEach((p) => {
            p.score = 0;
            p.history = [];
            p.found = [];
        });
    };

    const handLeaderOn = (room) => {
        const next = here(room).sort(byJoinOrder)[0];
        room.hostId = next ? next.id : null;
        Object.values(room.players).forEach((p) => { p.isPlayerHost = !!next && p.id === next.id; });
    };

    const playerLeftRoom = (socketId, roomCode) => {
        const room = activeWordWeaveRooms[roomCode];
        const player = room?.players[socketId];
        if (!room || !player) return;

        player.isConnected = false;
        console.log(`[Word Weave] ${player.name} left room ${roomCode}`);

        if (Object.values(room.players).every((p) => !p.isConnected)) {
            room.destroyTimer = setTimeout(() => {
                console.log(`[Word Weave] Destroying abandoned room ${roomCode}`);
                clearTimer(room);
                delete activeWordWeaveRooms[roomCode];
            }, 5 * 60 * 1000);
        }

        // The room leader left: hand the leader's buttons to the next player
        if (socketId === room.hostId) handLeaderOn(room);

        // In the lobby, someone who leaves is gone for good
        if (room.gameState === 'lobby' && !player.isCaster) delete room.players[socketId];
        broadcast(roomCode);
    };

    const closeRoom = (roomCode, message) => {
        const room = activeWordWeaveRooms[roomCode];
        if (!room) return;
        clearTimer(room);
        if (room.destroyTimer) clearTimeout(room.destroyTimer);
        if (room.broadcastTimer) clearTimeout(room.broadcastTimer);
        console.log(`[Word Weave] Room ${roomCode} closed: ${message}`);
        WNS.to(roomCode).emit('room_closed', { roomCode, message });
        WNS.in(roomCode).socketsLeave(roomCode);
        delete activeWordWeaveRooms[roomCode];
    };

    // --- Same players, fresh game ("Play Again") ---
    const resetForNewGame = (roomCode) => {
        const room = activeWordWeaveRooms[roomCode];
        if (!room) return;
        Object.keys(room.players).forEach((id) => {
            const p = room.players[id];
            if (!p.isCaster && !p.isConnected) delete room.players[id];
        });
        handLeaderOn(room);
        room.gameId = randomUUID();
        room.snake = newSnake();
        newGame(room);
        room.gameState = 'lobby';
        console.log(`[Word Weave] Room ${roomCode}: playing again.`);
        broadcast(roomCode);
    };

    // --- One device, one game ---
    const leaveOtherRooms = (socket, exceptCode) => {
        Object.keys(activeWordWeaveRooms).forEach((code) => {
            if (code === exceptCode) return;
            const player = activeWordWeaveRooms[code].players[socket.id];
            if (!player) return;
            socket.leave(code);
            if (player.isCaster) closeRoom(code, 'The host ended that game.');
            else playerLeftRoom(socket.id, code);
        });
    };

    // The leader's phone or the TV moves the game along. Pausing, Play Again and ending the game belong to the TV;
    // on just phones, to the leader.
    const canControl = (room, socket) => socket.id === room.hostId || !!room.players[socket.id]?.isCaster;
    const canRun = (room, socket) => (room.mode === 'tv' ? !!room.players[socket.id]?.isCaster : socket.id === room.hostId);

    // 🧹 Close rooms that are empty, finished or idle
    startRoomJanitor({
        label: 'Word Weave',
        namespace: WNS,
        rooms: activeWordWeaveRooms,
        isFinished: (room) => room.gameState === 'final',
        closeRoom,
    });

    WNS.on('connection', (socket) => {

        // ⏸️ Moving the game along waits while it's paused
        socket.use(([event, data], next) => {
            if (HELD_WHILE_PAUSED.has(event) && activeWordWeaveRooms[data?.roomCode]?.isPaused) return;
            next();
        });

        // ---------- Event: Making a room (the TV, or the leader's phone on just phones) ----------
        socket.on('createRoom', guardCreateRoom((data) => (data.mode === 'phones' ? 'wordweavephones' : 'wordweave'), socket, (data) => {
            leaveOtherRooms(socket);
            const mode = data.mode === 'phones' ? 'phones' : 'tv';
            const size = SIZES.includes(Number(data.size)) ? Number(data.size) : 4;
            const roomCode = makeRoomCode();
            const room = {
                roomCode,
                mode,
                gameId: randomUUID(),
                gameState: 'lobby',
                size,
                roundSeconds: SECONDS_OPTIONS.includes(Number(data.roundSeconds)) ? Number(data.roundSeconds) : DEFAULT_SECONDS[size],
                totalRounds: ROUND_OPTIONS.includes(Number(data.totalRounds)) ? Number(data.totalRounds) : DEFAULT_ROUNDS,
                hostId: null,
                timerId: null,
                snake: newSnake(),
                playerCount: 0,
                players: {},
            };
            if (mode === 'tv') {
                room.players[socket.id] = {
                    id: socket.id, name: data.playerName || 'Caster', isCaster: true, isPlayerHost: false, isConnected: true, joinOrder: -1,
                };
                socket.join(roomCode);
            }
            newGame(room);
            activeWordWeaveRooms[roomCode] = room;
            console.log(`[Word Weave] Room ${roomCode} made (${mode === 'tv' ? 'on a TV' : 'just phones'}, ${size}×${size}, ${room.roundSeconds}s, ${room.totalRounds} rounds).`);
            socket.emit('roomCreated', { roomCode });
        }));

        // ---------- 🐍 Events: The lobby game ----------
        const sendSnakeScores = (roomCode, room) => {
            if (room.snakeTimer) return;
            room.snakeTimer = setTimeout(() => {
                room.snakeTimer = null;
                if (activeWordWeaveRooms[roomCode]) broadcast(roomCode);
            }, 250);
        };
        socket.on('snake_eat', ({ roomCode, targetId, length } = {}) => {
            const room = activeWordWeaveRooms[roomCode];
            if (!room) return;
            const target = snakeEat(room, socket.id, targetId, length);
            if (!target) return;
            socket.to(target.id).emit('snake_gotcha', { name: room.players[socket.id].name });
            sendSnakeScores(roomCode, room);
        });
        socket.on('snake_crash', ({ roomCode, length } = {}) => {
            const room = activeWordWeaveRooms[roomCode];
            if (room && snakeCrash(room, socket.id, length)) sendSnakeScores(roomCode, room);
        });
        socket.on('disconnect', () => snakePlayerGone(socket.id));

        // ---------- Event: Joining (phones, and the TV after a refresh) ----------
        socket.on('joinRoom', ({ roomCode, playerName, playerId, avatar } = {}) => {
            const cleanAvatar = typeof avatar === 'string' && /^[a-z0-9-]{1,24}$/.test(avatar) ? avatar : null;
            if (!roomCode) return;
            const code = String(roomCode).trim().toUpperCase();
            const room = activeWordWeaveRooms[code];
            if (!room) return socket.emit('joinError', 'Room not found!');

            leaveOtherRooms(socket, code);

            const requestedName = String(playerName || 'Anonymous').trim().slice(0, 12) || 'Anonymous';
            const joiningName = requestedName.toLowerCase();

            // A returning device: same saved ID and the same name
            const existingKey = Object.keys(room.players).find(
                (key) => room.players[key].playerId === playerId
                    && room.players[key].name.trim().toLowerCase() === joiningName
            );
            if (!existingKey) {
                if (Object.values(room.players).some((p) => p.name.trim().toLowerCase() === joiningName)) {
                    return socket.emit('joinError', 'That name is already taken in this room. Pick another!');
                }
                if (here(room).length >= MAX_PLAYERS) {
                    return socket.emit('joinError', `This room is full (${MAX_PLAYERS} players).`);
                }
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
                if (cleanAvatar) player.avatar = cleanAvatar;
                if (room.hostId === existingKey) room.hostId = socket.id;
                delete room.players[existingKey];
                room.players[socket.id] = player;
                // The first to join who's still here leads: a leader whose phone dropped out (a refresh, a locked
                // screen) gets the leader's buttons back. On just phones that's whoever made the room.
                if (!player.isCaster) handLeaderOn(room);
            } else {
                const isFirstPlayer = !here(room).length;
                player = {
                    playerId,
                    key: randomUUID().slice(0, 8),
                    avatar: cleanAvatar,
                    id: socket.id,
                    name: requestedName,
                    isCaster: false,
                    isPlayerHost: false,
                    isConnected: true,
                    joinOrder: room.playerCount,
                    score: 0,
                    // Joining part-way: the rounds already played count as 0
                    history: Array.from({ length: Math.max(0, room.round - (room.gameState === 'playing' || room.gameState === 'intro' ? 1 : 0)) }, () => 0),
                    found: [],
                };
                room.players[socket.id] = player;
                room.playerCount += 1;
                if (isFirstPlayer) handLeaderOn(room);
            }

            broadcast(code);
            if (!player.isCaster) sendMyWords(room, player);
        });

        // ---------- Event: The room leader starts the game (lobby -> rules) ----------
        socket.on('startGame', ({ roomCode } = {}) => {
            const room = activeWordWeaveRooms[roomCode];
            if (!room || room.gameState !== 'lobby' || !canControl(room, socket)) return;
            if (here(room).length < MIN_PLAYERS) {
                return socket.emit('joinError', `You need at least ${MIN_PLAYERS} player to start.`);
            }
            newGame(room);
            room.gameState = 'rules';
            room.endTime = Date.now() + RULES_TIME[room.mode];
            broadcast(roomCode);
            // The TV's narration (or the leader) usually moves on first; this is in case nobody does
            schedule(roomCode, room, 'rules', RULES_TIME[room.mode], () => startRound(roomCode));
        });

        // ---------- Event: Rules are done (rules -> the first round) ----------
        socket.on('startRounds', ({ roomCode } = {}) => {
            const room = activeWordWeaveRooms[roomCode];
            if (!room || room.gameState !== 'rules' || !canControl(room, socket)) return;
            startRound(roomCode);
        });

        // ---------- A word, traced or typed ----------
        socket.on('submit_word', ({ roomCode, word, round } = {}) => {
            const room = activeWordWeaveRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster) return;
            const clean = cleanWord(word);
            const reply = (result) => socket.emit('word_result', { word: clean, round: room.round, ...result });

            if (room.gameState !== 'playing' || (round !== undefined && Number(round) !== room.round)) return reply({ ok: false, reason: 'closed' });
            if (room.isPaused) return reply({ ok: false, reason: 'paused' });
            if (Date.now() > room.endTime + GRACE) return reply({ ok: false, reason: 'time' });
            if (clean.length < MIN_LENGTH) return reply({ ok: false, reason: 'short' });
            if (player.found.includes(clean)) return reply({ ok: false, reason: 'again' });
            if (!room.solution.has(clean)) {
                const reason = isBlocked(clean) ? 'blocked' : isWord(clean) ? 'grid' : 'word';
                return reply({ ok: false, reason });
            }
            player.found.push(clean);
            reply({ ok: true, points: pointsFor(clean), path: room.solution.get(clean), count: player.found.length });
            broadcastSoon(roomCode);
        });

        // ---------- The leader (or the TV) moves on from a round's results ----------
        socket.on('next_round', ({ roomCode } = {}) => {
            const room = activeWordWeaveRooms[roomCode];
            if (!room || room.gameState !== 'round_results' || !canControl(room, socket)) return;
            afterResults(roomCode);
        });

        // ---------- ⏸️ Event: Pause (or un-pause) a running game ----------
        socket.on('set_paused', ({ roomCode, paused } = {}) => {
            const room = activeWordWeaveRooms[roomCode];
            if (!room || !canRun(room, socket)) return;
            if (['lobby', 'rules', 'final'].includes(room.gameState)) return;
            if (paused) pauseRoom(room); else resumeRoom(room);
            console.log(`[Word Weave] Room ${roomCode}: ${room.isPaused ? 'paused' : 'back on'}.`);
            broadcast(roomCode);
        });

        // ---------- Event: Another game with the same players ----------
        socket.on('playAgain', ({ roomCode } = {}) => {
            const room = activeWordWeaveRooms[roomCode];
            if (!room || !canRun(room, socket) || room.gameState !== 'final') return;
            resetForNewGame(roomCode);
        });

        // ---------- Event: Done for the night ----------
        socket.on('endGame', ({ roomCode } = {}) => {
            const room = activeWordWeaveRooms[roomCode];
            if (!room || !canRun(room, socket)) return;
            socket.leave(roomCode);
            closeRoom(roomCode, 'Thanks for playing! The host ended the game.');
        });

        // ---------- Event: Leave / Disconnect ----------
        socket.on('leaveRoom', ({ roomCode } = {}) => {
            const code = String(roomCode || '').trim().toUpperCase();
            if (!activeWordWeaveRooms[code]?.players[socket.id]) return;
            socket.leave(code);
            playerLeftRoom(socket.id, code);
        });

        socket.on('disconnect', () => {
            Object.keys(activeWordWeaveRooms)
                .filter((code) => activeWordWeaveRooms[code].players[socket.id])
                .forEach((code) => playerLeftRoom(socket.id, code));
        });
    });
}
