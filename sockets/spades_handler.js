// ♠️ Spades: the card game for the TV and phones. Two teams of two, partners across the table.
//
// The TV shows the table (everyone's bids, the trick in the middle, the scores); each phone is a player's hand.
// 1 to 4 people play: bots sit in the empty seats, and play for anyone who drops out or runs out of time.
//   lobby -> rules -> a hand: bidding (each seat in turn, from the dealer's left) -> playing (13 tricks)
//   -> hand_results (the score) -> the next hand, until a team reaches the target -> final
// The rules, the scoring and the bots are in sockets/spadesRules.js. Room codes start with "A" (the ace of spades).
import { newSnake, snakeEat, snakeCrash, snakePlayerGone } from "./snakeGame.js";
import { guardCreateRoom } from '../db/gameVisibility.js';
import { randomUUID } from "crypto";
import { startRoomJanitor } from "./roomJanitor.js";
import {
    deal, legalPlays, trickLeader, scoreHand, winnerOf, botBid, botPlay, nextSeat, suitOf, teamOf,
} from "./spadesRules.js";

const activeSpadesRooms = {};

// Lets the HTTP side (voice-overs) check that a room is real and still open
export const getSpadesRoom = (roomCode) => activeSpadesRooms[roomCode] || null;

// --- Game settings ---
export const TARGET_OPTIONS = [100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000];
const DEFAULT_TARGET = 300;
const MIN_PLAYERS = 1;
const SEATS = [0, 1, 2, 3];
const BOT_NAMES = ['Sprocket', 'Widget', 'Gizmo', 'Bolt'];

const SECOND = 1000;
const DEAL_PAUSE = 2.5 * SECOND;       // the cards fly out on the TV before the first bid
const BID_TIME = 30 * SECOND;          // a person's turn; when it runs out, their bot moves for them
const PLAY_TIME = 30 * SECOND;
const BOT_BID_DELAY = 1.4 * SECOND;    // bots take a moment, so everyone can follow along
const BOT_PLAY_DELAY = 0.9 * SECOND;
const BOT_JITTER = 0.6 * SECOND;
const TRICK_PAUSE = 1.9 * SECOND;      // the finished trick stays up, its winner lit, before it's swept away
const RESULTS_TIME = 14 * SECOND;      // the hand's score, then the next deal
const LAST_RESULTS_TIME = 8 * SECOND;  // the last hand's score, then the winners
const GRACE = 1500;                    // a last-second tap still counts

const makeRoomCode = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code;
    do {
        code = 'A';
        for (let i = 0; i < 3; i++) code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    } while (activeSpadesRooms[code]);
    return code;
};

const people = (room) => Object.values(room.players).filter((p) => !p.isCaster);
const seated = (room) => people(room).filter((p) => p.seat !== null && p.seat !== undefined);
const personAt = (room, seat) => seated(room).find((p) => p.seat === seat) || null;
// A seat its bot plays: nobody sits there, or they've dropped out
const isAuto = (room, seat) => !personAt(room, seat)?.isConnected;
const freeSeats = (room) => SEATS.filter((s) => !personAt(room, s));

/** Who's in each seat, as the screens show it */
const seatView = (room) => SEATS.map((seat) => {
    const person = personAt(room, seat);
    const bot = room.bots?.[seat] || null;
    return {
        seat,
        team: teamOf(seat),
        name: person ? person.name : bot ? bot.name : null,
        avatar: person ? person.avatar || null : null,
        key: person ? person.key : null,
        isBot: !person,
        isAway: !!person && !person.isConnected,
        socketId: person && person.isConnected ? person.id : null,
    };
});

// What every screen may see. Each phone gets its own cards separately ('my_hand').
const getSafeRoom = (room) => {
    if (!room) return null;
    const players = {};
    Object.values(room.players).forEach((p) => {
        players[p.id] = {
            id: p.id,
            key: p.key || null,
            name: p.name,
            avatar: p.avatar || null,
            seat: p.seat ?? null,
            isCaster: p.isCaster,
            isPlayerHost: p.isPlayerHost,
            isConnected: p.isConnected,
            joinOrder: p.joinOrder,
        };
    });
    const hand = room.hand;
    return {
        roomCode: room.roomCode,
        gameState: room.gameState,
        hostId: room.hostId,
        target: room.target,
        targetOptions: TARGET_OPTIONS,
        minPlayers: MIN_PLAYERS,
        endTime: room.endTime,
        isPaused: !!room.isPaused,
        isGameOver: !!room.isGameOver,
        snake: room.snake ? { scores: room.snake.scores } : null,   // 🐍 the lobby game's scores
        seats: seatView(room),
        scores: room.scores,
        bagPiles: room.bagPiles,
        handNumber: room.handNumber,
        dealer: room.dealer,
        winner: room.winner,
        history: room.history,
        hand: hand ? {
            phase: hand.phase,
            turn: hand.turn,
            leader: hand.leader,
            bids: hand.bids,
            trick: hand.trick,
            trickWinner: hand.trickWinner,
            tricksWon: hand.tricksWon,
            spadesBroken: hand.spadesBroken,
            brokenBy: hand.brokenBy,
            cardsLeft: hand.hands.map((cards) => cards.length),
            lastTrick: hand.lastTrick,
            results: hand.results,
        } : null,
        players,
    };
};

export default function registerSpadesNamespace(SNS) {

    // Each phone's own cards, what it may play, and (when it's bidding) the bid its bot would make
    const privateFor = (room, person) => {
        const hand = room.hand;
        const seat = person.seat ?? null;
        if (!hand || seat === null) return { seat, cards: [], legal: [], suggestion: null };
        const myTurn = hand.turn === seat && !room.isPaused;
        return {
            seat,
            cards: hand.hands[seat],
            legal: myTurn && hand.phase === 'playing' ? legalPlays(hand.hands[seat], hand.trick, hand.spadesBroken) : [],
            suggestion: myTurn && hand.phase === 'bidding' ? botBid(hand.hands[seat], seat, hand.bids) : null,
        };
    };

    const broadcast = (roomCode) => {
        const room = activeSpadesRooms[roomCode];
        if (!room) return;
        SNS.to(roomCode).emit('room_updated', getSafeRoom(room));
        people(room).filter((p) => p.isConnected).forEach((p) => SNS.to(p.id).emit('my_hand', privateFor(room, p)));
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
            if (activeSpadesRooms[roomCode] !== room || room.gameState !== state) return;
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

    // ⏸️ The caster pauses: the clock stops, and no bids or cards go down until it's back on
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

    const HELD_WHILE_PAUSED = new Set(['bid', 'play_card', 'next_hand']);

    // ===================== THE HAND =====================

    const startHand = (roomCode) => {
        const room = activeSpadesRooms[roomCode];
        if (!room) return;
        room.handNumber += 1;
        room.dealer = room.handNumber === 1 ? Math.floor(Math.random() * 4) : nextSeat(room.dealer);
        const first = nextSeat(room.dealer);
        room.hand = {
            phase: 'bidding',
            hands: deal(),
            bids: [null, null, null, null],
            turn: null,                      // nobody, while the cards are dealt
            leader: first,
            trick: [],
            trickWinner: null,
            tricksWon: [0, 0, 0, 0],
            spadesBroken: false,
            brokenBy: null,
            played: [],
            lastTrick: null,
            results: null,
        };
        room.gameState = 'bidding';
        room.endTime = null;
        broadcast(roomCode);
        schedule(roomCode, room, 'bidding', DEAL_PAUSE, () => {
            room.hand.turn = first;
            promptTurn(roomCode);
        });
    };

    // Whose turn it is: a person gets the clock (and their bot moves for them when it runs out); a bot just moves
    const promptTurn = (roomCode) => {
        const room = activeSpadesRooms[roomCode];
        const hand = room?.hand;
        if (!hand || hand.turn === null || !['bidding', 'playing'].includes(room.gameState)) return;
        const seat = hand.turn;
        const state = room.gameState;
        if (isAuto(room, seat)) {
            room.endTime = null;
            const delay = (state === 'bidding' ? BOT_BID_DELAY : BOT_PLAY_DELAY) + Math.random() * BOT_JITTER;
            schedule(roomCode, room, state, delay, () => autoMove(roomCode, seat));
        } else {
            const time = state === 'bidding' ? BID_TIME : PLAY_TIME;
            room.endTime = Date.now() + time;
            schedule(roomCode, room, state, time + GRACE, () => autoMove(roomCode, seat));
        }
        broadcast(roomCode);
    };

    const botView = (hand, seat) => ({
        hand: hand.hands[seat], trick: hand.trick, seat, bids: hand.bids, tricks: hand.tricksWon, spadesBroken: hand.spadesBroken, played: hand.played,
    });

    const autoMove = (roomCode, seat) => {
        const room = activeSpadesRooms[roomCode];
        const hand = room?.hand;
        if (!hand || hand.turn !== seat) return;
        if (room.gameState === 'bidding') makeBid(roomCode, seat, botBid(hand.hands[seat], seat, hand.bids));
        else if (room.gameState === 'playing') playCard(roomCode, seat, botPlay(botView(hand, seat)));
    };

    const makeBid = (roomCode, seat, bid) => {
        const room = activeSpadesRooms[roomCode];
        const hand = room?.hand;
        if (!hand || room.gameState !== 'bidding' || hand.turn !== seat || hand.bids[seat] !== null) return false;
        if (!Number.isInteger(bid) || bid < 0 || bid > 13) return false;
        hand.bids[seat] = bid;
        if (hand.bids.every((b) => b !== null)) {
            // Everyone's bid: the dealer's left leads the first trick
            hand.phase = 'playing';
            room.gameState = 'playing';
            hand.turn = hand.leader;
        } else hand.turn = nextSeat(seat);
        promptTurn(roomCode);
        return true;
    };

    const playCard = (roomCode, seat, card) => {
        const room = activeSpadesRooms[roomCode];
        const hand = room?.hand;
        if (!hand || room.gameState !== 'playing' || hand.turn !== seat || hand.trickWinner !== null) return false;
        if (!legalPlays(hand.hands[seat], hand.trick, hand.spadesBroken).includes(card)) return false;
        hand.hands[seat] = hand.hands[seat].filter((c) => c !== card);
        hand.trick.push({ seat, card });
        if (suitOf(card) === 'S' && !hand.spadesBroken) {
            hand.spadesBroken = true;
            hand.brokenBy = seat;
        }
        if (hand.trick.length < 4) {
            hand.turn = nextSeat(seat);
            promptTurn(roomCode);
            return true;
        }
        // The trick's done: light up its winner for a moment, then sweep it to them
        const winner = trickLeader(hand.trick).seat;
        hand.trickWinner = winner;
        hand.turn = null;
        room.endTime = null;
        broadcast(roomCode);
        schedule(roomCode, room, 'playing', TRICK_PAUSE, () => collectTrick(roomCode));
        return true;
    };

    const collectTrick = (roomCode) => {
        const room = activeSpadesRooms[roomCode];
        const hand = room?.hand;
        if (!hand || hand.trickWinner === null) return;
        const winner = hand.trickWinner;
        hand.tricksWon[winner] += 1;
        hand.played.push(...hand.trick.map((p) => p.card));
        hand.lastTrick = { cards: hand.trick, winner };
        hand.trick = [];
        hand.trickWinner = null;
        if (hand.hands.every((cards) => cards.length === 0)) {
            endHand(roomCode);
            return;
        }
        hand.turn = winner;
        promptTurn(roomCode);
    };

    const endHand = (roomCode) => {
        const room = activeSpadesRooms[roomCode];
        const hand = room.hand;
        const results = scoreHand(hand.bids, hand.tricksWon, room.bagPiles);
        results.forEach((r) => {
            room.scores[r.team] += r.points;
            room.bagPiles[r.team] = r.bagPile;
        });
        hand.results = results;
        hand.phase = 'done';
        hand.turn = null;
        room.history.push({ hand: room.handNumber, points: results.map((r) => r.points), scores: [...room.scores] });
        room.winner = winnerOf(room.scores, room.target);
        room.isGameOver = room.winner !== null;
        room.gameState = 'hand_results';
        const wait = room.isGameOver ? LAST_RESULTS_TIME : RESULTS_TIME;
        room.endTime = Date.now() + wait;
        console.log(`[Spades] Room ${roomCode}: hand ${room.handNumber} scored ${results.map((r) => r.points).join(' / ')}, now ${room.scores.join(' / ')}.`);
        broadcast(roomCode);
        schedule(roomCode, room, 'hand_results', wait, () => afterResults(roomCode));
    };

    const afterResults = (roomCode) => {
        const room = activeSpadesRooms[roomCode];
        if (!room || room.gameState !== 'hand_results') return;
        clearTimer(room);
        if (room.isGameOver) {
            room.gameState = 'final';
            room.endTime = null;
            broadcast(roomCode);
            return;
        }
        startHand(roomCode);
    };

    // ===================== SEATS & PEOPLE =====================

    // Empty seats get bots when the game starts (named, so the table reads naturally)
    const seatBots = (room) => {
        room.bots = {};
        const names = [...BOT_NAMES];
        SEATS.forEach((seat) => {
            if (!personAt(room, seat)) room.bots[seat] = { name: names.shift() };
        });
    };

    // Someone watching takes a seat that's come free in the lobby
    const fillSeatsFromWatchers = (room) => {
        const watchers = people(room).filter((p) => p.isConnected && (p.seat === null || p.seat === undefined)).sort((a, b) => a.joinOrder - b.joinOrder);
        freeSeats(room).forEach((seat) => {
            const next = watchers.shift();
            if (next) next.seat = seat;
        });
    };

    const newGame = (room) => {
        clearTimer(room);
        room.scores = [0, 0];
        room.bagPiles = [0, 0];
        room.handNumber = 0;
        room.dealer = null;
        room.hand = null;
        room.history = [];
        room.winner = null;
        room.isGameOver = false;
        room.endTime = null;
        room.isPaused = false;
    };

    const playerLeftRoom = (socketId, roomCode) => {
        const room = activeSpadesRooms[roomCode];
        const player = room?.players[socketId];
        if (!room || !player) return;

        player.isConnected = false;
        console.log(`[Spades] ${player.name} left room ${roomCode}`);

        if (Object.values(room.players).every((p) => !p.isConnected)) {
            room.destroyTimer = setTimeout(() => {
                console.log(`[Spades] Destroying abandoned room ${roomCode}`);
                clearTimer(room);
                delete activeSpadesRooms[roomCode];
            }, 5 * 60 * 1000);
        }

        // The room leader left: hand the start button to the next player
        if (socketId === room.hostId) {
            const next = people(room).filter((p) => p.isConnected).sort((a, b) => a.joinOrder - b.joinOrder)[0];
            room.hostId = next ? next.id : null;
            Object.values(room.players).forEach((p) => { p.isPlayerHost = !!next && p.id === next.id; });
        }

        if (room.gameState === 'lobby' && !player.isCaster) {
            // In the lobby, someone who leaves is gone for good: someone watching can have their seat
            delete room.players[socketId];
            fillSeatsFromWatchers(room);
        } else if (room.hand && room.hand.turn === player.seat) {
            // It was their turn: their bot plays it
            promptTurn(roomCode);
        }
        broadcast(roomCode);
    };

    const closeRoom = (roomCode, message) => {
        const room = activeSpadesRooms[roomCode];
        if (!room) return;
        clearTimer(room);
        if (room.destroyTimer) clearTimeout(room.destroyTimer);
        console.log(`[Spades] Room ${roomCode} closed: ${message}`);
        SNS.to(roomCode).emit('room_closed', { roomCode, message });
        SNS.in(roomCode).socketsLeave(roomCode);
        delete activeSpadesRooms[roomCode];
    };

    // --- Same players, fresh game (the caster tapped "Play Again") ---
    const resetForNewGame = (roomCode) => {
        const room = activeSpadesRooms[roomCode];
        if (!room) return;
        Object.keys(room.players).forEach((id) => {
            const p = room.players[id];
            if (!p.isCaster && !p.isConnected) delete room.players[id];
        });
        fillSeatsFromWatchers(room);
        const leader = people(room).filter((p) => p.isConnected).sort((a, b) => a.joinOrder - b.joinOrder)[0];
        Object.values(room.players).forEach((p) => { p.isPlayerHost = !!leader && p.id === leader.id; });
        room.hostId = leader ? leader.id : null;
        room.gameId = randomUUID();
        room.snake = newSnake();
        room.bots = {};
        newGame(room);
        room.gameState = 'lobby';
        console.log(`[Spades] Room ${roomCode}: playing again.`);
        broadcast(roomCode);
    };

    // --- One device, one game ---
    const leaveOtherRooms = (socket, exceptCode) => {
        Object.keys(activeSpadesRooms).forEach((code) => {
            if (code === exceptCode) return;
            const player = activeSpadesRooms[code].players[socket.id];
            if (!player) return;
            socket.leave(code);
            if (player.isCaster) closeRoom(code, 'The host ended that game.');
            else playerLeftRoom(socket.id, code);
        });
    };

    const canControl = (room, socket) => socket.id === room.hostId || room.players[socket.id]?.isCaster;

    // 🧹 Close rooms that are empty, finished or idle
    startRoomJanitor({
        label: 'Spades',
        namespace: SNS,
        rooms: activeSpadesRooms,
        isFinished: (room) => room.gameState === 'final',
        closeRoom,
    });

    SNS.on('connection', (socket) => {

        // ⏸️ Moves that arrive while the game is paused are dropped
        socket.use(([event, data], next) => {
            if (HELD_WHILE_PAUSED.has(event) && activeSpadesRooms[data?.roomCode]?.isPaused) return;
            next();
        });

        // ---------- Event: The TV makes a room ----------
        socket.on('createRoom', guardCreateRoom('spades', socket, (data) => {
            leaveOtherRooms(socket);
            const roomCode = makeRoomCode();
            const target = TARGET_OPTIONS.includes(Number(data.target)) ? Number(data.target) : DEFAULT_TARGET;
            const room = {
                roomCode,
                gameId: randomUUID(),
                gameState: 'lobby',
                target,
                hostId: null,
                timerId: null,
                snake: newSnake(),
                playerCount: 0,
                bots: {},
                players: {
                    [socket.id]: {
                        id: socket.id, name: data.playerName || 'Caster', isCaster: true, isPlayerHost: false, isConnected: true, joinOrder: -1, seat: null,
                    },
                },
            };
            newGame(room);
            activeSpadesRooms[roomCode] = room;
            socket.join(roomCode);
            socket.emit('roomCreated', { roomCode });
        }));

        // ---------- 🐍 Events: The lobby game ----------
        const sendSnakeScores = (roomCode, room) => {
            if (room.snakeTimer) return;
            room.snakeTimer = setTimeout(() => {
                room.snakeTimer = null;
                if (activeSpadesRooms[roomCode]) broadcast(roomCode);
            }, 250);
        };
        socket.on('snake_eat', ({ roomCode, targetId, length } = {}) => {
            const room = activeSpadesRooms[roomCode];
            if (!room) return;
            const target = snakeEat(room, socket.id, targetId, length);
            if (!target) return;
            socket.to(target.id).emit('snake_gotcha', { name: room.players[socket.id].name });
            sendSnakeScores(roomCode, room);
        });
        socket.on('snake_crash', ({ roomCode, length } = {}) => {
            const room = activeSpadesRooms[roomCode];
            if (room && snakeCrash(room, socket.id, length)) sendSnakeScores(roomCode, room);
        });
        socket.on('disconnect', () => snakePlayerGone(socket.id));

        // ---------- Event: Joining (phones, and the TV after a refresh) ----------
        socket.on('joinRoom', ({ roomCode, playerName, playerId, avatar } = {}) => {
            const cleanAvatar = typeof avatar === 'string' && /^[a-z0-9-]{1,24}$/.test(avatar) ? avatar : null;
            if (!roomCode) return;
            const code = String(roomCode).trim().toUpperCase();
            const room = activeSpadesRooms[code];
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
                const isNameTaken = Object.values(room.players).some((p) => p.name.trim().toLowerCase() === joiningName)
                    || Object.values(room.bots || {}).some((b) => b.name.toLowerCase() === joiningName);
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
                if (cleanAvatar) player.avatar = cleanAvatar;
                if (room.hostId === existingKey) room.hostId = socket.id;
                delete room.players[existingKey];
                room.players[socket.id] = player;
            } else {
                // A seat: any free one in the lobby; in a game, a bot's seat (they take over its cards). Else they watch.
                const open = room.gameState === 'lobby'
                    ? freeSeats(room)
                    : SEATS.filter((s) => !personAt(room, s) && room.bots?.[s]);
                const seat = open.length ? open[0] : null;
                if (seat !== null && room.bots?.[seat]) delete room.bots[seat];
                const isFirstPlayer = !people(room).some((p) => p.isConnected);
                player = {
                    playerId,
                    key: randomUUID().slice(0, 8),
                    avatar: cleanAvatar,
                    id: socket.id,
                    name: requestedName,
                    isCaster: false,
                    isPlayerHost: isFirstPlayer,
                    isConnected: true,
                    joinOrder: room.playerCount,
                    seat,
                };
                room.players[socket.id] = player;
                room.playerCount += 1;
                if (isFirstPlayer) {
                    Object.values(room.players).forEach((p) => { p.isPlayerHost = p.id === socket.id; });
                    room.hostId = socket.id;
                }
            }

            // Back (or newly sat down) on their turn: they get the clock instead of their bot
            if (room.hand && player.seat !== null && room.hand.turn === player.seat) promptTurn(code);
            else broadcast(code);
        });

        // ---------- Event: The leader mixes up who sits where (lobby only) ----------
        socket.on('shuffle_seats', ({ roomCode } = {}) => {
            const room = activeSpadesRooms[roomCode];
            if (!room || room.gameState !== 'lobby' || !canControl(room, socket)) return;
            const sitters = seated(room);
            const order = [...SEATS].sort(() => Math.random() - 0.5);
            // Always a change: if the deal comes out the same, swap the first two
            const before = sitters.map((p) => p.seat).join();
            sitters.forEach((p, i) => { p.seat = order[i]; });
            if (sitters.length > 1 && sitters.map((p) => p.seat).join() === before) {
                [sitters[0].seat, sitters[1].seat] = [sitters[1].seat, sitters[0].seat];
            }
            broadcast(roomCode);
        });

        // ---------- Event: The room leader starts the game (lobby -> rules) ----------
        socket.on('startGame', ({ roomCode } = {}) => {
            const room = activeSpadesRooms[roomCode];
            if (!room || room.gameState !== 'lobby' || !canControl(room, socket)) return;
            if (!seated(room).some((p) => p.isConnected)) {
                return socket.emit('joinError', `You need at least ${MIN_PLAYERS} player to start.`);
            }
            newGame(room);
            seatBots(room);
            room.gameState = 'rules';
            broadcast(roomCode);
        });

        // ---------- Event: Rules are done (rules -> the first deal) ----------
        socket.on('startRounds', ({ roomCode } = {}) => {
            const room = activeSpadesRooms[roomCode];
            if (!room || room.gameState !== 'rules' || !canControl(room, socket)) return;
            startHand(roomCode);
        });

        // ---------- A bid: 0 (Nil) to 13 ----------
        socket.on('bid', ({ roomCode, bid } = {}) => {
            const room = activeSpadesRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.seat === null || player.seat === undefined) return;
            if (!makeBid(roomCode, player.seat, Number(bid))) socket.emit('spades_error', "That bid didn't go through. Try again.");
        });

        // ---------- A card ----------
        socket.on('play_card', ({ roomCode, card } = {}) => {
            const room = activeSpadesRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.seat === null || player.seat === undefined) return;
            if (!playCard(roomCode, player.seat, String(card || ''))) {
                socket.emit('spades_error', "You can't play that card right now.");
                broadcast(roomCode);
            }
        });

        // ---------- The leader (or the TV) skips ahead to the next deal ----------
        socket.on('next_hand', ({ roomCode } = {}) => {
            const room = activeSpadesRooms[roomCode];
            if (!room || room.gameState !== 'hand_results' || !canControl(room, socket)) return;
            afterResults(roomCode);
        });

        // ---------- ⏸️ Event: The caster pauses (or un-pauses) a running game ----------
        socket.on('set_paused', ({ roomCode, paused } = {}) => {
            const room = activeSpadesRooms[roomCode];
            if (!room || !room.players[socket.id]?.isCaster) return;
            if (['lobby', 'rules', 'final'].includes(room.gameState)) return;
            if (paused) pauseRoom(room); else resumeRoom(room);
            console.log(`[Spades] Room ${roomCode}: ${room.isPaused ? 'paused' : 'back on'}.`);
            broadcast(roomCode);
        });

        // ---------- Event: The caster wants another game with the same players ----------
        socket.on('playAgain', ({ roomCode } = {}) => {
            const room = activeSpadesRooms[roomCode];
            if (!room || !room.players[socket.id]?.isCaster || room.gameState !== 'final') return;
            resetForNewGame(roomCode);
        });

        // ---------- Event: The caster is done for the night ----------
        socket.on('endGame', ({ roomCode } = {}) => {
            const room = activeSpadesRooms[roomCode];
            if (!room || !room.players[socket.id]?.isCaster) return;
            socket.leave(roomCode);
            closeRoom(roomCode, 'Thanks for playing! The host ended the game.');
        });

        // ---------- Event: Leave / Disconnect ----------
        socket.on('leaveRoom', ({ roomCode } = {}) => {
            const code = String(roomCode || '').trim().toUpperCase();
            if (!activeSpadesRooms[code]?.players[socket.id]) return;
            socket.leave(code);
            playerLeftRoom(socket.id, code);
        });

        socket.on('disconnect', () => {
            Object.keys(activeSpadesRooms)
                .filter((code) => activeSpadesRooms[code].players[socket.id])
                .forEach((code) => playerLeftRoom(socket.id, code));
        });
    });
}

