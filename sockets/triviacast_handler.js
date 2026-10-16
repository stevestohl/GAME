// 📺 Trivia Cast: trivia with a shared TV screen.
// One device casts the questions and scores to the TV; everyone answers on their phone.
// It uses the same question decks as Trivia (see drawTriviaQuestions).
import { randomUUID } from "crypto";
import { drawTriviaQuestions, normalizeExpansion, normalizeRounds } from "../db/drawCards.js";
import TriviaAnswer from "../models/TriviaAnswer.js";
import { startRoomJanitor } from "./roomJanitor.js";

const activeTCRooms = {};

// Lets the HTTP side (voice-overs) check that a room is real and still open
export const getTriviaCastRoom = (roomCode) => activeTCRooms[roomCode] || null;

// --- Game pacing ---
const QUESTION_TIME = 25 * 1000;    // time to answer
const REVEAL_TIME = 7 * 1000;       // the right answer on screen
const SCOREBOARD_TIME = 6 * 1000;   // scores between questions
const DEFAULT_QUESTIONS = 5;

// --- Scoring ---
const CORRECT_POINTS = 100;         // for a right answer
// Extra points for answering instantly, fading to 0 at the buzzer.
// Switched off for now (flat scoring). Set it to e.g. 50 to turn the speed bonus on;
// each player's answer time is already recorded as `answeredAt`.
const SPEED_BONUS = 0;

// What the screens are allowed to see. During a question the right answer stays on
// the server, and nobody can see what anyone else picked.
const getSafeRoom = (room) => {
    if (!room) return null;
    const isAnswerPublic = room.gameState === 'reveal' || room.gameState === 'scoreboard';
    const question = room.questions?.[room.questionIndex];

    const players = {};
    Object.values(room.players).forEach((p) => {
        players[p.id] = {
            id: p.id,
            name: p.name,
            score: p.score,
            isCaster: p.isCaster,
            isPlayerHost: p.isPlayerHost,
            isConnected: p.isConnected,
            joinOrder: p.joinOrder,
            hasAnswered: p.hasAnswered,
            currentAnswer: isAnswerPublic ? p.currentAnswer : null,
            lastCorrect: isAnswerPublic ? p.lastCorrect : null,
            lastPoints: isAnswerPublic ? p.lastPoints : 0,
        };
    });

    const isPlaying = ['question', 'reveal', 'scoreboard'].includes(room.gameState);

    return {
        roomCode: room.roomCode,
        gameState: room.gameState,
        expansion: room.expansion,
        hostId: room.hostId,
        currentRound: room.questionIndex + 1,
        totalRounds: room.questions?.length || room.totalRounds,
        endTime: room.endTime,
        isGameOver: room.isGameOver,
        players,
        question: isPlaying && question ? {
            text: question.question,
            category: question.category,
            options: room.options,
        } : null,
        correctAnswer: isAnswerPublic && question ? question.correct_answer : null,
    };
};

const makeRoomCode = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code;
    do {
        code = 'Q';
        for (let i = 0; i < 3; i++) code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    } while (activeTCRooms[code]);
    return code;
};

// 📊 Save how everyone answered this question (the triviaanswers collection).
// Runs in the background: a database hiccup must never hold up the game.
const recordAnswers = (room, question) => {
    const players = Object.values(room.players).filter(p => !p.isCaster && (p.isConnected || p.hasAnswered));

    const rows = players.map((p) => ({
        gameId: room.gameId,
        roomCode: room.roomCode,
        expansion: room.expansion,
        playerCount: players.length,

        questionId: question._id,
        questionText: question.question,
        questionExpansion: question.expansion || 'core',
        category: question.category,
        difficulty: question.difficulty,
        questionNumber: room.questionIndex + 1,
        totalQuestions: room.questions.length,
        options: room.options,
        correctAnswer: question.correct_answer,
        correctPosition: room.options.indexOf(question.correct_answer),

        playerId: p.playerId,
        playerName: p.name,

        answer: p.currentAnswer,
        answerPosition: p.currentAnswer ? room.options.indexOf(p.currentAnswer) : null,
        isCorrect: !!p.lastCorrect,
        responseTimeMs: p.answeredAt ? p.answeredAt - room.questionStartedAt : null,
        timeLimitMs: QUESTION_TIME,
        pointsAwarded: p.lastPoints || 0,
    }));

    if (rows.length === 0) return;
    TriviaAnswer.insertMany(rows).catch((err) => {
        console.error('[Trivia Cast] Could not save answers:', err.message);
    });
};

export default function registerTriviaCastNamespace(TCNS) {

    const broadcast = (roomCode) => {
        TCNS.to(roomCode).emit('room_updated', getSafeRoom(activeTCRooms[roomCode]));
    };

    const answeringPlayers = (room) => Object.values(room.players).filter(p => !p.isCaster && p.isConnected);

    // --- Put the next question on screen and start the clock ---
    const startQuestion = (roomCode) => {
        const room = activeTCRooms[roomCode];
        if (!room) return;

        const question = room.questions[room.questionIndex];
        // Same shuffled order on the TV and on every phone
        room.options = [...question.incorrect_answers.flat(), question.correct_answer]
            .sort(() => Math.random() - 0.5);

        Object.values(room.players).forEach((p) => {
            p.hasAnswered = false;
            p.currentAnswer = null;
            p.answeredAt = null;
            p.lastCorrect = null;
            p.lastPoints = 0;
        });

        room.gameState = 'question';
        room.questionStartedAt = Date.now();
        room.endTime = room.questionStartedAt + QUESTION_TIME;
        room.timerId = setTimeout(() => revealAnswer(roomCode), QUESTION_TIME + 500);

        broadcast(roomCode);
    };

    // --- Time's up (or everyone answered): score it and show the right answer ---
    const revealAnswer = (roomCode) => {
        const room = activeTCRooms[roomCode];
        if (!room || room.gameState !== 'question') return;

        if (room.timerId) {
            clearTimeout(room.timerId);
            room.timerId = null;
        }

        const question = room.questions[room.questionIndex];

        Object.values(room.players).forEach((p) => {
            if (p.isCaster) return;
            p.lastCorrect = p.currentAnswer === question.correct_answer;
            if (p.lastCorrect) {
                // Faster answers earn more of the bonus
                const timeLeft = Math.max(0, room.endTime - (p.answeredAt || room.endTime));
                p.lastPoints = CORRECT_POINTS + Math.round(SPEED_BONUS * (timeLeft / QUESTION_TIME));
                p.score += p.lastPoints;
            } else {
                p.lastPoints = 0;
            }
        });

        recordAnswers(room, question);

        room.gameState = 'reveal';
        room.endTime = null;
        broadcast(roomCode);

        setTimeout(() => showScoreboard(roomCode, room), REVEAL_TIME);
    };

    // --- Scores between questions; after the last question this is the final screen ---
    const showScoreboard = (roomCode, room) => {
        if (activeTCRooms[roomCode] !== room || room.gameState !== 'reveal') return;

        room.isGameOver = room.questionIndex + 1 >= room.questions.length;
        room.gameState = 'scoreboard';
        broadcast(roomCode);

        if (room.isGameOver) return; // stay on the final standings

        setTimeout(() => {
            if (activeTCRooms[roomCode] !== room || room.gameState !== 'scoreboard') return;
            room.questionIndex += 1;
            startQuestion(roomCode);
        }, SCOREBOARD_TIME);
    };

    // --- A phone (or the TV) dropped out of a room ---
    const playerLeftRoom = (socketId, roomCode) => {
        const room = activeTCRooms[roomCode];
        const player = room?.players[socketId];
        if (!room || !player) return;

        player.isConnected = false;
        console.log(`[Trivia Cast] ${player.name} left room ${roomCode}`);

        // Nobody left at all: tidy the room away after 5 minutes
        if (Object.values(room.players).every(p => !p.isConnected)) {
            room.destroyTimer = setTimeout(() => {
                console.log(`[Trivia Cast] Destroying abandoned room ${roomCode}`);
                if (room.timerId) clearTimeout(room.timerId);
                delete activeTCRooms[roomCode];
            }, 5 * 60 * 1000);
        }

        // Everyone who is still here has answered: no need to wait for the clock
        if (room.gameState === 'question') {
            const remaining = answeringPlayers(room);
            if (remaining.length > 0 && remaining.every(p => p.hasAnswered)) revealAnswer(roomCode);
        }

        // The room leader left: hand the start button to the next player
        if (socketId === room.hostId) {
            const next = answeringPlayers(room).sort((a, b) => a.joinOrder - b.joinOrder)[0];
            if (next) {
                room.hostId = next.id;
                Object.values(room.players).forEach(p => { p.isPlayerHost = p.id === next.id; });
            }
        }

        broadcast(roomCode);
    };

    // --- End a game for everyone still in it ---
    const closeRoom = (roomCode, message) => {
        const room = activeTCRooms[roomCode];
        if (!room) return;
        if (room.timerId) clearTimeout(room.timerId);
        if (room.destroyTimer) clearTimeout(room.destroyTimer);

        console.log(`[Trivia Cast] Room ${roomCode} closed: ${message}`);
        TCNS.to(roomCode).emit('room_closed', { roomCode, message });
        TCNS.in(roomCode).socketsLeave(roomCode);
        delete activeTCRooms[roomCode];
    };

    // --- One device, one game (see the same helper in couchcast_handler.js) ---
    const leaveOtherRooms = (socket, exceptCode) => {
        Object.keys(activeTCRooms).forEach((code) => {
            if (code === exceptCode) return;
            const player = activeTCRooms[code].players[socket.id];
            if (!player) return;

            socket.leave(code);
            if (player.isCaster) closeRoom(code, 'The host ended that game.');
            else playerLeftRoom(socket.id, code);
        });
    };

    // 🧹 Close rooms that are empty, finished or idle

    startRoomJanitor({

        label: 'Trivia Cast',

        namespace: TCNS,

        rooms: activeTCRooms,

        isFinished: (room) => room.gameState === 'scoreboard' && !!room.isGameOver,

        closeRoom,

    });


    TCNS.on('connection', (socket) => {
        console.log(`[Trivia Cast] Connected: ${socket.id}`);

        // ---------- Event: Room Creation (the TV) ----------
        socket.on('createRoom', (data = {}) => {
            leaveOtherRooms(socket);
            const roomCode = makeRoomCode();

            activeTCRooms[roomCode] = {
                roomCode,
                gameId: randomUUID(),   // ties this game's saved answers together
                gameState: 'lobby',
                expansion: normalizeExpansion(data.expansion),
                totalRounds: normalizeRounds(data.totalRounds, DEFAULT_QUESTIONS),
                hostId: null,
                questions: null,
                questionIndex: 0,
                options: [],
                endTime: null,
                timerId: null,
                isGameOver: false,
                playerCount: 0,
                players: {
                    [socket.id]: {
                        id: socket.id,
                        name: data.playerName || 'Caster',
                        score: 0,
                        isCaster: true,
                        isPlayerHost: false,
                        isConnected: true,
                        joinOrder: -1,
                        hasAnswered: false,
                    }
                }
            };

            socket.join(roomCode);
            socket.emit('roomCreated', { roomCode });
        });

        // ---------- Event: Room Joining (phones, and the TV after a refresh) ----------
        socket.on('joinRoom', ({ roomCode, playerName, playerId } = {}) => {
            if (!roomCode) return;
            const code = roomCode.trim().toUpperCase();
            const room = activeTCRooms[code];
            if (!room) return socket.emit('joinError', 'Room not found!');

            leaveOtherRooms(socket, code);

            const requestedName = (playerName || 'Anonymous').trim();
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

            if (existingKey) {
                const player = room.players[existingKey];
                player.id = socket.id;
                player.isConnected = true;
                if (room.hostId === existingKey) room.hostId = socket.id;
                delete room.players[existingKey];
                room.players[socket.id] = player;
            } else {
                const isFirstPlayer = !Object.values(room.players).some(p => !p.isCaster && p.isConnected);
                room.players[socket.id] = {
                    playerId,
                    id: socket.id,
                    name: requestedName,
                    score: 0,
                    isCaster: false,
                    isPlayerHost: isFirstPlayer,
                    isConnected: true,
                    joinOrder: room.playerCount,
                    hasAnswered: false,
                    currentAnswer: null,
                    lastCorrect: null,
                    lastPoints: 0,
                };
                room.playerCount += 1;
                if (isFirstPlayer) {
                    Object.values(room.players).forEach(p => { p.isPlayerHost = p.id === socket.id; });
                    room.hostId = socket.id;
                }
            }

            broadcast(code);
        });

        // ---------- Event: Room leader starts the game (lobby -> rules) ----------
        socket.on('startGame', async ({ roomCode } = {}) => {
            const room = activeTCRooms[roomCode];
            if (!room || room.gameState !== 'lobby') return;
            if (socket.id !== room.hostId && !room.players[socket.id]?.isCaster) return;

            try {
                const questions = await drawTriviaQuestions(room.expansion, room.totalRounds);
                if (!questions.length) return socket.emit('joinError', 'No trivia questions found in the database.');

                room.questions = questions;
                room.questionIndex = 0;
                room.gameState = 'rules';
                broadcast(roomCode);
            } catch (err) {
                console.error('[Trivia Cast] Error drawing questions:', err.message);
                socket.emit('joinError', 'Could not load the trivia questions.');
            }
        });

        // ---------- Event: Rules are done (rules -> first question) ----------
        socket.on('startQuestions', ({ roomCode } = {}) => {
            const room = activeTCRooms[roomCode];
            if (!room || room.gameState !== 'rules') return;
            if (socket.id !== room.hostId && !room.players[socket.id]?.isCaster) return;
            startQuestion(roomCode);
        });

        // ---------- Event: A player taps an answer ----------
        socket.on('submit_answer', ({ roomCode, answer } = {}) => {
            const room = activeTCRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster) return;
            if (room.gameState !== 'question' || player.hasAnswered) return;
            if (!room.options.includes(answer)) return;

            player.currentAnswer = answer;
            player.answeredAt = Date.now();
            player.hasAnswered = true;

            if (answeringPlayers(room).every(p => p.hasAnswered)) {
                revealAnswer(roomCode);
            } else {
                broadcast(roomCode);
            }
        });

        // ---------- Event: Leave / Disconnect ----------
        socket.on('leaveRoom', ({ roomCode } = {}) => {
            const code = (roomCode || '').trim().toUpperCase();
            if (!activeTCRooms[code]?.players[socket.id]) return;
            socket.leave(code);
            playerLeftRoom(socket.id, code);
        });

        socket.on('disconnect', () => {
            Object.keys(activeTCRooms)
                .filter(code => activeTCRooms[code].players[socket.id])
                .forEach(code => playerLeftRoom(socket.id, code));
        });
    });
}
