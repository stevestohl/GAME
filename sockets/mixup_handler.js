// 🎪 Temple Mix Up: a TV game in three blocks of rounds.
//   1. Memes:      the TV shows a blank meme, everyone writes a caption on their phone,
//                  then everyone votes for the funniest (not their own). Most votes wins; ties all win.
//   2. Pictionary: one player draws on their phone, the TV shows it live, everyone else
//                  types guesses. The first right guess wins (and the drawer scores too).
//   3. Threefold:  the list topics from List Cast. Everyone writes up to three answers, and scores for every
//                  other player who wrote the same thing (Listography's Threefold card, with no vote).
//                  The answers are matched up automatically, then one player (the judge, taking turns)
//                  checks the matches on their phone: joining answers the computer missed, splitting ones it got wrong.
//                  No clock on the judge: they take as long as they need (the room waits for them).
// 9, 12 or 15 rounds: an equal number of each, played in blocks (all memes, then Pictionary, then Threefold).
// Memes come from Imgflip's popular blank templates and Pictionary prompts from MongoDB; both cycle
// (least-used first) so they don't repeat until every one has been played. Room codes start with "M".
//
// Round flow:  intro (the round's title card)
//   meme:       meme_write -> meme_vote -> meme_results
//   pictionary: draw -> draw_results
//   threefold:  match_write -> match_review (the judge) -> match_compare -> match_results
// then scoreboard -> the next round's intro (or the final standings).
import { newSnake, snakeEat, snakeCrash, snakePlayerGone } from "./snakeGame.js";
import { guardCreateRoom } from '../db/gameVisibility.js';
import { randomUUID } from "crypto";
import { normalizeLevel } from "../db/drawCards.js";
import { drawListCategories } from "../db/listCategories.js";
import { findGame } from "../db/gameCatalog.js";
import { pickMemes, pickPictionaryPrompts, markMemeUsed, markPromptUsed } from "../db/drawMixup.js";
import { normalizeItem, isSameItem, compareLists, getCard } from "./listMatching.js";
import { startRoomJanitor } from "./roomJanitor.js";

const activeMixupRooms = {};

// Lets the HTTP side (voice-overs) check that a room is real and still open
export const getMixupRoom = (roomCode) => activeMixupRooms[roomCode] || null;

// --- Game settings ---
export const ROUND_OPTIONS = [9, 12, 15];
const MIN_PLAYERS = 3;
const ROUND_TYPES = ['meme', 'draw', 'match'];

const SECOND = 1000;
const INTRO_TIME = 5 * SECOND;          // the round's title card
const MEME_WRITE_TIME = 60 * SECOND;
const MEME_VOTE_TIME = 30 * SECOND;
const MEME_RESULTS_TIME = 10 * SECOND;
const DRAW_TIME = 80 * SECOND;
const DRAW_RESULTS_TIME = 8 * SECOND;
const JUDGE_GONE_TIME = 30 * SECOND;    // the judge's phone dropped out (or locked): time to come back, then the matches stand
const MATCH_COMPARE_TIME = 9 * SECOND;  // the answers light up one after another
const MATCH_RESULTS_TIME = 8 * SECOND;
const SCOREBOARD_TIME = 7 * SECOND;
const NOBODY_TIME = 6 * SECOND;         // "Awww... is it just me here?"
const GRACE = 1500;                     // a last-second tap still counts

const MEME_WIN_POINTS = 100;            // every caption tied for the most votes
const DRAW_GUESS_POINTS = 100;          // the first right guess
const DRAW_DRAWER_POINTS = 50;          // the drawer, when someone guesses it
const MATCH_POINTS = 50;                // for every other player who wrote your answer

const MAX_CAPTION = 120;
const MAX_GUESS = 40;
const MAX_ANSWER = 40;
const MATCH_CARD = getCard('threefold');
const MATCH_WRITE_TIME = MATCH_CARD.writingSeconds * SECOND;
const MAX_DRAW_POINTS = 25000;          // a whole drawing (keeps memory in check)

const randomToken = () => Math.random().toString(36).slice(2, 10);

// "A big cat!" vs "cat": the same answer? (plurals, punctuation, small typos aside)
const isRightGuess = (guess, prompt) => {
    const guessKey = normalizeItem(guess);
    if (!guessKey) return false;
    return [prompt.text, ...(prompt.alsoAccept || [])].some((answer) => {
        const key = normalizeItem(answer);
        if (!key) return false;
        if (guessKey === key || isSameItem(guessKey, key)) return true;
        // The answer inside a short guess ("a big cat") counts too
        return key.length >= 3 && guess.trim().split(/\s+/).length <= 4 && guessKey.includes(key);
    });
};

// ===================== THREEFOLD: THE JUDGE =====================
// The judge works on groups of answers: { id, itemIds }. Every answer in a group matches the others,
// and each answer scores for every other player in its group. The automatic matches are the starting point.

/** The judge's starting point: the automatic matches as groups (answers written twice stay out of it) */
const makeReview = (board) => {
    const items = {};
    const groups = [];
    const byKey = {};
    board.forEach((entry) => entry.items.forEach((item) => {
        if (item.status === 'dup') return;
        items[item.id] = { id: item.id, text: item.text, seat: entry.seat, name: entry.name };
        const key = item.voteKey || `s${item.id}`;   // compareLists gives every automatic match a shared key
        if (!byKey[key]) groups.push(byKey[key] = { id: key, itemIds: [] });
        byKey[key].itemIds.push(item.id);
    }));

    // Matches first (the biggest at the top), then the answers on their own from A to Z,
    // so a match the computer missed ("Coke", "Coca-Cola") sits close together
    const seatCount = (g) => new Set(g.itemIds.map((id) => items[id].seat)).size;
    const label = (g) => items[g.itemIds[0]].text.toLowerCase();
    groups.sort((a, b) => (seatCount(b) > 1) - (seatCount(a) > 1) || seatCount(b) - seatCount(a) || label(a).localeCompare(label(b)));

    return {
        items,
        groups,
        autoGroups: groups.map((g) => ({ id: g.id, itemIds: [...g.itemIds] })),
        autoPartners: partnersOf(groups),
        nextId: 1,
    };
};

// Each answer's partners in its group ("0-1" -> "1-0,2-2"), for spotting what the judge changed
const partnersOf = (groups) => {
    const partners = {};
    groups.forEach((g) => g.itemIds.forEach((id) => { partners[id] = g.itemIds.filter((other) => other !== id).sort().join(','); }));
    return partners;
};

/** The answers the judge has matched differently from the computer */
const changedItems = (review) => {
    const now = partnersOf(review.groups);
    return Object.keys(now).filter((id) => now[id] !== review.autoPartners[id]);
};

/**
 * Can the judge move this answer into that group (or onto its own, when groupId is null)?
 * Any number of groups, any size, the judge's own answers included. The one rule: nobody is matched
 * with themselves (a group holds one answer per player). The TV shows every change, so the room keeps the judge honest.
 * The judge's phone uses the same rule to grey out the groups it can't drop into (MatchReview.jsx).
 */
const canMove = (review, itemId, groupId) => {
    if (typeof itemId !== 'string' || !Object.hasOwn(review.items, itemId)) return false;
    const item = review.items[itemId];
    const from = review.groups.find((g) => g.itemIds.includes(itemId));
    if (!from) return false;
    if (groupId === null) return from.itemIds.length > 1;
    const to = review.groups.find((g) => g.id === groupId);
    if (!to || to === from) return false;
    const seats = to.itemIds.map((id) => review.items[id].seat);
    return !seats.includes(item.seat);
};

const moveAnswer = (review, itemId, groupId) => {
    const from = review.groups.find((g) => g.itemIds.includes(itemId));
    from.itemIds = from.itemIds.filter((id) => id !== itemId);
    if (groupId) review.groups.find((g) => g.id === groupId).itemIds.push(itemId);
    else review.groups.splice(review.groups.indexOf(from) + 1, 0, { id: `n${review.nextId++}`, itemIds: [itemId] });   // just under where it was
    review.groups = review.groups.filter((g) => g.itemIds.length);
};

// What the screens are allowed to see. Captions stay anonymous until the results,
// the Pictionary word is only revealed afterwards, and everyone's answers only once the writing's over.
const getSafeRoom = (room) => {
    if (!room) return null;
    const state = room.gameState;
    const round = room.round;

    const players = {};
    Object.values(room.players).forEach((p) => {
        players[p.id] = {
            id: p.id,
            name: p.name,
            avatar: p.avatar || null,
            score: p.score,
            seat: p.joinOrder,
            isCaster: p.isCaster,
            isPlayerHost: p.isPlayerHost,
            isConnected: p.isConnected,
            joinOrder: p.joinOrder,
            roundPoints: p.roundPoints || 0,
            hasSubmitted: !!p.hasSubmitted,   // caption written / answers locked in
            itemCount: (p.matchList || []).filter(Boolean).length,
            hasVoted: !!p.hasVoted,
        };
    });

    let roundView = null;
    if (round) {
        roundView = { type: round.type, number: room.currentRound, typeNumber: round.typeNumber, typeCount: round.typeCount };
        if (round.type === 'meme' && state !== 'intro') {
            roundView.meme = { name: round.meme.name, url: round.meme.url, width: round.meme.width, height: round.meme.height };
            if (state === 'meme_vote') roundView.captions = round.captions.map(({ id, text }) => ({ id, text }));
            if (state === 'meme_results' || state === 'scoreboard') roundView.captions = round.captions;
            if (state === 'meme_results' || state === 'scoreboard') roundView.winnerIds = round.winnerIds || [];
            if (state === 'meme_results' || state === 'scoreboard') roundView.greatMinds = !!round.greatMinds;
        }
        if (round.type === 'draw') {
            roundView.drawerId = round.drawerId;
            roundView.drawerName = room.players[round.drawerId]?.name || round.drawerName;
            roundView.guesses = round.guesses;
            roundView.guessedBy = round.guessedById ? room.players[round.guessedById]?.name || round.guessedByName : null;
            if (state === 'draw_results' || state === 'scoreboard') roundView.word = round.prompt.text;
        }
        if (round.type === 'match') {
            roundView.judgeId = round.judgeId || null;
            roundView.judgeName = room.players[round.judgeId]?.name || round.judgeName || '';
            roundView.judgeSeat = room.players[round.judgeId]?.joinOrder ?? null;
        }
        if (round.type === 'match' && state !== 'intro') {
            roundView.topic = round.topic;
            roundView.listSize = MATCH_CARD.listSize;
            roundView.pointsPerItem = MATCH_POINTS;
            if (state === 'match_review' && round.review) {
                roundView.review = { items: round.review.items, groups: round.review.groups, changed: changedItems(round.review) };
                roundView.judgeAway = !!round.judgeAway;
            }
            if (state === 'match_compare' || state === 'match_results' || state === 'scoreboard') roundView.board = round.board;
        }
    }

    return {
        roomCode: room.roomCode,
        gameState: state,
        hostId: room.hostId,
        currentRound: room.currentRound,
        totalRounds: room.totalRounds,
        endTime: room.endTime,
        isGameOver: room.isGameOver,
        snake: room.snake ? { scores: room.snake.scores } : null,   // 🐍 the lobby game's scores
        minPlayers: MIN_PLAYERS,
        round: roundView,
        players,
    };
};

const makeRoomCode = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code;
    do {
        code = 'M';
        for (let i = 0; i < 3; i++) code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    } while (activeMixupRooms[code]);
    return code;
};

export default function registerMixupNamespace(MNS) {

    const broadcast = (roomCode) => {
        MNS.to(roomCode).emit('room_updated', getSafeRoom(activeMixupRooms[roomCode]));
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
            if (activeMixupRooms[roomCode] !== room || room.gameState !== state) return;
            next();
        }, ms);
    };

    const activePlayers = (room) => Object.values(room.players).filter((p) => !p.isCaster && p.isConnected);
    const playerCount = (room) => activePlayers(room).length;

    // Each phone's private bits: its own caption id while voting, and the word if it's drawing
    const sendPrivateState = (socket, room) => {
        const player = room.players[socket.id];
        const round = room.round;
        if (!player || player.isCaster || !round) return;
        socket.emit('my_state', {
            caption: player.caption || '',
            myCaptionId: round.type === 'meme' ? (round.captions || []).find((c) => c.playerId === player.id)?.id || null : null,
            vote: player.vote || null,
            matchList: player.matchList || [],
            drawWord: round.type === 'draw' && round.drawerId === player.id && room.gameState === 'draw' ? round.prompt.text : null,
        });
    };

    // --- Plan the whole game: the right number of each round type, in blocks ---
    const planGame = async (room) => {
        const each = room.totalRounds / 3;
        const [memes, prompts, topics] = await Promise.all([
            pickMemes(each, room.expansion),
            pickPictionaryPrompts(each, room.level, room.expansion),
            drawListCategories(room.expansion, each),
        ]);
        const plan = [];
        ROUND_TYPES.forEach((type) => {
            for (let i = 0; i < each; i++) {
                const base = { type, typeNumber: i + 1, typeCount: each };
                if (type === 'meme') plan.push({ ...base, meme: memes[i % Math.max(1, memes.length)] });
                if (type === 'draw') plan.push({ ...base, prompt: prompts[i % Math.max(1, prompts.length)] });
                if (type === 'match') plan.push({ ...base, topic: topics[i % Math.max(1, topics.length)] });
            }
        });
        return plan;
    };

    // --- A new round: the title card first ---
    const startRound = (roomCode) => {
        const room = activeMixupRooms[roomCode];
        if (!room) return;

        const planned = room.plan[room.currentRound - 1];
        room.round = { ...planned };
        Object.values(room.players).forEach((p) => {
            p.roundPoints = 0;
            p.caption = '';
            p.hasSubmitted = false;
            p.vote = null;
            p.hasVoted = false;
            p.matchList = [];
        });

        // Pictionary: the next player in turn draws (everyone gets a go)
        if (room.round.type === 'draw') {
            const order = activePlayers(room).sort((a, b) => a.joinOrder - b.joinOrder);
            const drawer = order[room.drawCount % Math.max(1, order.length)];
            room.drawCount += 1;
            room.round.drawerId = drawer?.id || null;
            room.round.drawerName = drawer?.name || '';
            room.round.strokes = [];
            room.round.pointCount = 0;
            room.round.guesses = [];
            room.round.guessedById = null;
        }

        // Threefold: a judge for the matches, picking up the turns where Pictionary left off, so the jobs go round everyone
        if (room.round.type === 'match') {
            const order = activePlayers(room).sort((a, b) => a.joinOrder - b.joinOrder);
            const judge = order[(room.drawCount + room.judgeCount) % Math.max(1, order.length)];
            room.judgeCount += 1;
            room.round.judgeId = judge?.id || null;
            room.round.judgeName = judge?.name || '';
        }

        room.gameState = 'intro';
        room.endTime = Date.now() + INTRO_TIME;
        schedule(roomCode, room, 'intro', INTRO_TIME, () => startPlaying(roomCode));
        broadcast(roomCode);
    };

    // --- The title card's done: start the round proper ---
    const startPlaying = (roomCode) => {
        const room = activeMixupRooms[roomCode];
        if (!room || room.gameState !== 'intro') return;
        const round = room.round;

        if (round.type === 'meme') {
            if (round.meme?._id) markMemeUsed(round.meme._id);
            round.captions = [];
            room.gameState = 'meme_write';
            room.endTime = Date.now() + MEME_WRITE_TIME;
            schedule(roomCode, room, 'meme_write', MEME_WRITE_TIME + GRACE, () => startVoting(roomCode));
        } else if (round.type === 'draw') {
            if (round.prompt?._id) markPromptUsed(round.prompt._id);
            room.gameState = 'draw';
            room.endTime = Date.now() + DRAW_TIME;
            schedule(roomCode, room, 'draw', DRAW_TIME + GRACE, () => endDrawing(roomCode));
        } else {
            room.gameState = 'match_write';
            room.endTime = Date.now() + MATCH_WRITE_TIME;
            schedule(roomCode, room, 'match_write', MATCH_WRITE_TIME + GRACE, () => compareAnswers(roomCode));
        }
        broadcast(roomCode);

        // The drawer's phone gets the word privately
        if (round.type === 'draw' && round.drawerId) MNS.to(round.drawerId).emit('my_state', { drawWord: round.prompt.text });
    };

    // ===================== MEMES =====================
    const startVoting = (roomCode) => {
        const room = activeMixupRooms[roomCode];
        if (!room || room.gameState !== 'meme_write') return;
        const round = room.round;

        // Anonymous captions, in a shuffled order
        round.captions = Object.values(room.players)
            .filter((p) => !p.isCaster && p.caption)
            .map((p) => ({ id: randomToken(), text: p.caption, playerId: p.id, name: p.name, votes: 0 }))
            .sort(() => Math.random() - 0.5);

        if (round.captions.length === 0) return nobodyAnswered(roomCode);

        // 🧠 Two or more wrote the same thing: great minds! They win outright, for double points, with no vote
        const keys = round.captions.map((c) => normalizeItem(c.text));
        const twins = round.captions.filter((c, i) => keys[i] && keys.some((key, j) => j !== i && (key === keys[i] || isSameItem(key, keys[i]))));
        if (twins.length) {
            round.greatMinds = true;
            round.winnerIds = twins.map((c) => c.id);
            return showMemeResults(roomCode);
        }

        // Only one caption: nothing to vote on, straight to the results
        if (round.captions.length < 2) return showMemeResults(roomCode);

        room.gameState = 'meme_vote';
        room.endTime = Date.now() + MEME_VOTE_TIME;
        schedule(roomCode, room, 'meme_vote', MEME_VOTE_TIME + GRACE, () => showMemeResults(roomCode));
        broadcast(roomCode);
        MNS.in(roomCode).fetchSockets().then((sockets) => sockets.forEach((s) => sendPrivateState(s, room)));
    };

    const showMemeResults = (roomCode) => {
        const room = activeMixupRooms[roomCode];
        if (!room || !['meme_write', 'meme_vote'].includes(room.gameState)) return;
        const round = room.round;
        clearTimer(room);

        // Count the votes (a lone caption wins by default)
        round.captions.forEach((c) => { c.votes = Object.values(room.players).filter((p) => p.vote === c.id).length; });
        const top = Math.max(0, ...round.captions.map((c) => c.votes));
        if (!round.greatMinds) {
            round.winnerIds = round.captions.length === 1
                ? [round.captions[0].id]
                : round.captions.filter((c) => top > 0 && c.votes === top).map((c) => c.id);
        }
        const winPoints = round.greatMinds ? MEME_WIN_POINTS * 2 : MEME_WIN_POINTS;

        round.captions.filter((c) => round.winnerIds.includes(c.id)).forEach((c) => {
            const author = room.players[c.playerId];
            if (author) {
                author.score += winPoints;
                author.roundPoints += winPoints;
            }
        });
        round.captions.sort((a, b) => b.votes - a.votes);

        room.gameState = 'meme_results';
        room.endTime = null;
        schedule(roomCode, room, 'meme_results', MEME_RESULTS_TIME, () => showScoreboard(roomCode));
        broadcast(roomCode);
    };

    // ===================== PICTIONARY =====================
    const endDrawing = (roomCode, guesserId = null) => {
        const room = activeMixupRooms[roomCode];
        if (!room || room.gameState !== 'draw') return;
        const round = room.round;
        clearTimer(room);

        if (guesserId) {
            const guesser = room.players[guesserId];
            const drawer = room.players[round.drawerId];
            round.guessedById = guesserId;
            round.guessedByName = guesser?.name;
            if (guesser) { guesser.score += DRAW_GUESS_POINTS; guesser.roundPoints += DRAW_GUESS_POINTS; }
            if (drawer) { drawer.score += DRAW_DRAWER_POINTS; drawer.roundPoints += DRAW_DRAWER_POINTS; }
        }

        if (!guesserId && !(round.guesses || []).length) return nobodyAnswered(roomCode);

        room.gameState = 'draw_results';
        room.endTime = null;
        schedule(roomCode, room, 'draw_results', DRAW_RESULTS_TIME, () => showScoreboard(roomCode));
        broadcast(roomCode);
    };

    // ===================== THREEFOLD =====================
    // Same rules as List Cast's Threefold card, minus the vote: every other player who wrote your answer scores you points.
    // The computer matches the answers up first, then the judge checks the matches before any points are given.
    const compareAnswers = (roomCode) => {
        const room = activeMixupRooms[roomCode];
        if (!room || room.gameState !== 'match_write') return;
        const round = room.round;
        clearTimer(room);

        const writers = activePlayers(room).sort((a, b) => a.joinOrder - b.joinOrder);
        if (!writers.some((p) => (p.matchList || []).some(Boolean))) return nobodyAnswered(roomCode);
        round.board = compareLists(writers.map((p) => ({ seat: p.joinOrder, name: p.name, list: p.matchList || [] })), MATCH_CARD.id);
        round.review = makeReview(round.board);

        // Nothing to judge with fewer than two lists; and if the judge has gone, the next player along takes over
        const judge = pickJudge(room);
        if (!judge || round.board.filter((entry) => entry.items.length).length < 2) return scoreMatches(roomCode);
        round.judgeId = judge.id;
        round.judgeName = judge.name;

        // No clock: the judge's "Looks good!" ends it (or their phone dropping out for good, below)
        room.gameState = 'match_review';
        room.endTime = null;
        round.judgeAway = false;
        broadcast(roomCode);
    };

    const pickJudge = (room) => {
        const chosen = room.players[room.round.judgeId];
        if (chosen && !chosen.isCaster && chosen.isConnected) return chosen;
        const here = activePlayers(room).sort((a, b) => a.joinOrder - b.joinOrder);
        return (chosen && here.find((p) => p.joinOrder > chosen.joinOrder)) || here[0] || null;
    };

    // --- The judge is done (or out of time): score the answers from the judged matches ---
    const scoreMatches = (roomCode) => {
        const room = activeMixupRooms[roomCode];
        if (!room || !['match_write', 'match_review'].includes(room.gameState)) return;
        const round = room.round;
        clearTimer(room);

        const review = round.review;
        const groupOf = {};
        review.groups.forEach((g) => g.itemIds.forEach((id) => { groupOf[id] = g; }));
        const changed = new Set(changedItems(review));
        const nameAt = (seat) => round.board.find((entry) => entry.seat === seat)?.name;

        round.board.forEach((entry) => {
            entry.points = 0;
            entry.items.forEach((item) => {
                delete item.voteKey;
                delete item.voteSeats;
                if (item.status === 'dup') {
                    item.counts = false;
                    return;
                }
                const seats = [...new Set(groupOf[item.id].itemIds.map((id) => review.items[id].seat))].filter((seat) => seat !== entry.seat);
                item.status = seats.length ? 'scored' : 'unmatched';
                item.matchCount = seats.length;
                item.matchedWith = seats.map(nameAt).filter(Boolean);
                item.points = seats.length;
                item.counts = seats.length > 0;
                if (changed.has(item.id)) item.judged = true;   // ⚖️ on the board
                entry.points += item.points * MATCH_POINTS;
            });
            const player = Object.values(room.players).find((p) => !p.isCaster && p.joinOrder === entry.seat);
            if (player) {
                player.score += entry.points;
                player.roundPoints += entry.points;
            }
        });

        room.gameState = 'match_compare';
        room.endTime = null;
        schedule(roomCode, room, 'match_compare', MATCH_COMPARE_TIME, () => {
            room.gameState = 'match_results';
            schedule(roomCode, room, 'match_results', MATCH_RESULTS_TIME, () => showScoreboard(roomCode));
            broadcast(roomCode);
        });
        broadcast(roomCode);
    };

    // --- Nobody played the round: a sad little moment, then on to the next round (or the final scores) ---
    const nobodyAnswered = (roomCode) => {
        const room = activeMixupRooms[roomCode];
        if (!room) return;
        clearTimer(room);
        room.gameState = 'nobody';
        room.endTime = null;
        schedule(roomCode, room, 'nobody', NOBODY_TIME, () => {
            if (room.currentRound >= room.totalRounds) return showScoreboard(roomCode);
            room.currentRound += 1;
            startRound(roomCode);
        });
        broadcast(roomCode);
    };

    // --- Scores between rounds; after the last round this is the final screen ---
    const showScoreboard = (roomCode) => {
        const room = activeMixupRooms[roomCode];
        if (!room) return;
        clearTimer(room);

        room.isGameOver = room.currentRound >= room.totalRounds;
        room.gameState = 'scoreboard';
        room.endTime = null;
        broadcast(roomCode);

        if (room.isGameOver) return; // stay on the final standings
        schedule(roomCode, room, 'scoreboard', SCOREBOARD_TIME, () => {
            room.currentRound += 1;
            startRound(roomCode);
        });
    };

    // --- Done early? Move on as soon as everyone still here has finished ---
    const checkEveryoneDone = (roomCode) => {
        const room = activeMixupRooms[roomCode];
        if (!room) return;
        const here = activePlayers(room);
        if (here.length === 0) return;

        if (room.gameState === 'meme_write' && here.every((p) => p.hasSubmitted)) startVoting(roomCode);
        else if (room.gameState === 'meme_vote') {
            // Only players with someone else's caption to vote for need to vote
            const canVote = here.filter((p) => room.round.captions.some((c) => c.playerId !== p.id));
            if (canVote.every((p) => p.hasVoted)) showMemeResults(roomCode);
        } else if (room.gameState === 'match_write' && here.every((p) => p.hasSubmitted)) compareAnswers(roomCode);
    };

    // --- A phone (or the TV) dropped out of a room ---
    const playerLeftRoom = (socketId, roomCode) => {
        const room = activeMixupRooms[roomCode];
        const player = room?.players[socketId];
        if (!room || !player) return;

        player.isConnected = false;
        console.log(`[Mix Up] ${player.name} left room ${roomCode}`);

        // Nobody left at all: tidy the room away after 5 minutes
        if (Object.values(room.players).every((p) => !p.isConnected)) {
            room.destroyTimer = setTimeout(() => {
                console.log(`[Mix Up] Destroying abandoned room ${roomCode}`);
                clearTimer(room);
                delete activeMixupRooms[roomCode];
            }, 5 * 60 * 1000);
        }

        // The room leader left: hand the start button to the next player
        if (socketId === room.hostId) {
            const next = activePlayers(room).sort((a, b) => a.joinOrder - b.joinOrder)[0];
            if (next) {
                room.hostId = next.id;
                Object.values(room.players).forEach((p) => { p.isPlayerHost = p.id === next.id; });
            }
        }

        // The drawer left mid-drawing: nobody can guess it now, so the round ends
        if (room.gameState === 'draw' && room.round?.drawerId === socketId) {
            endDrawing(roomCode);
            return;
        }

        // The judge's phone dropped out (a refresh, a locked screen): time to come back, then the matches stand as they are
        if (room.gameState === 'match_review' && room.round?.judgeId === socketId) {
            room.round.judgeAway = true;
            schedule(roomCode, room, 'match_review', JUDGE_GONE_TIME, () => scoreMatches(roomCode));
        }

        checkEveryoneDone(roomCode);
        broadcast(roomCode);
    };

    // --- End a game for everyone still in it ---
    const closeRoom = (roomCode, message) => {
        const room = activeMixupRooms[roomCode];
        if (!room) return;
        clearTimer(room);
        if (room.destroyTimer) clearTimeout(room.destroyTimer);
        console.log(`[Mix Up] Room ${roomCode} closed: ${message}`);
        MNS.to(roomCode).emit('room_closed', { roomCode, message });
        MNS.in(roomCode).socketsLeave(roomCode);
        delete activeMixupRooms[roomCode];
    };

    // --- Same players, fresh game (the caster tapped "Play Again" on the final scores) ---
    const resetForNewGame = (roomCode) => {
        const room = activeMixupRooms[roomCode];
        if (!room) return;
        clearTimer(room);

        Object.keys(room.players).forEach((id) => {
            const p = room.players[id];
            if (!p.isCaster && !p.isConnected) delete room.players[id];
        });
        Object.values(room.players).forEach((p) => {
            p.score = 0;
            p.roundPoints = 0;
            p.caption = '';
            p.hasSubmitted = false;
            p.vote = null;
            p.hasVoted = false;
            p.matchList = [];
            p.lastCorrect = false;
        });
        const leader = activePlayers(room).sort((a, b) => a.joinOrder - b.joinOrder)[0];
        Object.values(room.players).forEach((p) => { p.isPlayerHost = !!leader && p.id === leader.id; });
        room.hostId = leader ? leader.id : null;

        room.gameId = randomUUID();
        room.snake = newSnake();      // 🐍 a fresh lobby game too
        room.gameState = 'lobby';
        room.currentRound = 1;
        room.isGameOver = false;
        room.plan = [];
        room.round = null;
        room.drawCount = 0;
        room.judgeCount = 0;
        room.endTime = null;

        console.log(`[Mix Up] Room ${roomCode}: playing again.`);
        broadcast(roomCode);
    };

    // --- One device, one game ---
    const leaveOtherRooms = (socket, exceptCode) => {
        Object.keys(activeMixupRooms).forEach((code) => {
            if (code === exceptCode) return;
            const player = activeMixupRooms[code].players[socket.id];
            if (!player) return;
            socket.leave(code);
            if (player.isCaster) closeRoom(code, 'The host ended that game.');
            else playerLeftRoom(socket.id, code);
        });
    };

    // The room leader (or the TV) can move the game along
    const canControl = (room, socket) => socket.id === room.hostId || room.players[socket.id]?.isCaster;

    // 🧹 Close rooms that are empty, finished or idle
    startRoomJanitor({
        label: 'Mix Up',
        namespace: MNS,
        rooms: activeMixupRooms,
        isFinished: (room) => room.gameState === 'scoreboard' && !!room.isGameOver,
        closeRoom,
    });

    MNS.on('connection', (socket) => {

        // ---------- Event: The TV makes a room ----------
        socket.on('createRoom', guardCreateRoom('mixup', socket, (data) => {
            leaveOtherRooms(socket);
            const roomCode = makeRoomCode();
            const totalRounds = ROUND_OPTIONS.includes(Number(data.totalRounds)) ? Number(data.totalRounds) : ROUND_OPTIONS[0];

            activeMixupRooms[roomCode] = {
                roomCode,
                gameId: randomUUID(),
                gameState: 'lobby',
                totalRounds,
                level: normalizeLevel(data.level),
                expansion: findGame('mixup').decks.some((d) => d.id === data.expansion) ? data.expansion : 'core',
                currentRound: 1,
                plan: [],
                round: null,
                drawCount: 0,
                judgeCount: 0,
                hostId: null,
                endTime: null,
                timerId: null,
                isGameOver: false,
                snake: newSnake(),
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
                    },
                },
            };
            socket.join(roomCode);
            socket.emit('roomCreated', { roomCode });
        }));

        // ---------- 🐍 Events: The lobby game ----------
        // Scores can change many times a second: send them a few times a second at most
        const sendSnakeScores = (roomCode, room) => {
            if (room.snakeTimer) return;
            room.snakeTimer = setTimeout(() => {
                room.snakeTimer = null;
                if (activeMixupRooms[roomCode]) broadcast(roomCode);
            }, 250);
        };
        socket.on('snake_eat', ({ roomCode, targetId, length } = {}) => {
            const room = activeMixupRooms[roomCode];
            if (!room) return;
            const target = snakeEat(room, socket.id, targetId, length);
            if (!target) return;
            socket.to(target.id).emit('snake_gotcha', { name: room.players[socket.id].name });
            sendSnakeScores(roomCode, room);
        });
        socket.on('snake_crash', ({ roomCode, length } = {}) => {
            const room = activeMixupRooms[roomCode];
            if (room && snakeCrash(room, socket.id, length)) sendSnakeScores(roomCode, room);
        });
        socket.on('disconnect', () => snakePlayerGone(socket.id));

        // ---------- Event: Joining (phones, and the TV after a refresh) ----------
        socket.on('joinRoom', ({ roomCode, playerName, playerId, avatar } = {}) => {
            // 🙂 The avatar the player picked (a short id like "cat"; anything else is ignored)
            const cleanAvatar = typeof avatar === 'string' && /^[a-z0-9-]{1,24}$/.test(avatar) ? avatar : null;
            if (!roomCode) return;
            const code = roomCode.trim().toUpperCase();
            const room = activeMixupRooms[code];
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
                const isNameTaken = Object.values(room.players).some((p) => p.name.trim().toLowerCase() === joiningName);
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
                if (room.round?.drawerId === existingKey) room.round.drawerId = socket.id;
                if (room.round?.judgeId === existingKey) {
                    room.round.judgeId = socket.id;
                    // The judge is back: the wait for them is off
                    if (room.gameState === 'match_review' && room.round.judgeAway) {
                        room.round.judgeAway = false;
                        clearTimer(room);
                    }
                }
                if (room.round?.guessedById === existingKey) room.round.guessedById = socket.id;
                (room.round?.captions || []).forEach((c) => { if (c.playerId === existingKey) c.playerId = socket.id; });
                delete room.players[existingKey];
                room.players[socket.id] = player;
            } else {
                const isFirstPlayer = !Object.values(room.players).some((p) => !p.isCaster && p.isConnected);
                player = {
                    playerId,
                    avatar: cleanAvatar,
                    id: socket.id,
                    name: requestedName,
                    score: 0,
                    isCaster: false,
                    isPlayerHost: isFirstPlayer,
                    isConnected: true,
                    joinOrder: room.playerCount,
                    roundPoints: 0,
                };
                room.players[socket.id] = player;
                room.playerCount += 1;
                if (isFirstPlayer) {
                    Object.values(room.players).forEach((p) => { p.isPlayerHost = p.id === socket.id; });
                    room.hostId = socket.id;
                }
            }

            broadcast(code);
            sendPrivateState(socket, room);
            // The TV (or a phone) coming back mid-drawing gets the picture so far
            if (room.gameState === 'draw') socket.emit('drawing_snapshot', { strokes: room.round.strokes || [] });
        });

        // ---------- Event: The room leader starts the game (lobby -> rules) ----------
        socket.on('startGame', async ({ roomCode } = {}) => {
            const room = activeMixupRooms[roomCode];
            if (!room || room.gameState !== 'lobby' || !canControl(room, socket)) return;
            if (playerCount(room) < MIN_PLAYERS) {
                return socket.emit('joinError', `You need at least ${MIN_PLAYERS} players to start.`);
            }
            if (room.isStarting) return; // a double tap only starts once
            room.isStarting = true;
            try {
                room.plan = await planGame(room);
            } catch (err) {
                console.error('[Mix Up] Could not plan the game:', err.message);
                return socket.emit('joinError', 'Could not load the game. Please try again.');
            } finally {
                room.isStarting = false;
            }
            if (activeMixupRooms[roomCode] !== room || room.gameState !== 'lobby') return;

            room.currentRound = 1;
            room.drawCount = 0;
            room.judgeCount = 0;
            room.gameState = 'rules';
            broadcast(roomCode);
        });

        // ---------- Event: Rules are done (rules -> first round) ----------
        socket.on('startRounds', ({ roomCode } = {}) => {
            const room = activeMixupRooms[roomCode];
            if (!room || room.gameState !== 'rules' || !canControl(room, socket)) return;
            startRound(roomCode);
        });

        // ---------- Memes: a caption ----------
        socket.on('submit_caption', ({ roomCode, caption } = {}) => {
            const room = activeMixupRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'meme_write') return;
            const text = String(caption || '').replace(/\s+/g, ' ').trim().slice(0, MAX_CAPTION);
            if (!text) return;
            player.caption = text;
            player.hasSubmitted = true;
            broadcast(roomCode);
            checkEveryoneDone(roomCode);
        });

        // ---------- Memes: a vote (never for your own caption) ----------
        socket.on('submit_vote', ({ roomCode, captionId } = {}) => {
            const room = activeMixupRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'meme_vote' || player.hasVoted) return;
            const caption = room.round.captions.find((c) => c.id === captionId);
            if (!caption || caption.playerId === socket.id) return;
            player.vote = caption.id;
            player.hasVoted = true;
            broadcast(roomCode);
            checkEveryoneDone(roomCode);
        });

        // ---------- Pictionary: the drawer's pen (streamed in small batches) ----------
        // A stroke arrives as { id, c: color, w: width, p: [[x, y], ...] } with x and y from 0 to 1;
        // later batches of the same stroke add more points. The TV gets each batch as it comes.
        socket.on('draw_points', ({ roomCode, stroke } = {}) => {
            const room = activeMixupRooms[roomCode];
            const round = room?.round;
            if (!room || room.gameState !== 'draw' || round?.drawerId !== socket.id || !stroke) return;
            const points = (Array.isArray(stroke.p) ? stroke.p : [])
                .filter((pt) => Array.isArray(pt) && pt.length === 2 && pt.every((n) => typeof n === 'number' && n >= -0.05 && n <= 1.05))
                .map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]);
            if (!points.length || round.pointCount + points.length > MAX_DRAW_POINTS) return;
            round.pointCount += points.length;

            const id = String(stroke.id || '').slice(0, 20);
            const color = /^#[0-9a-f]{6}$/i.test(stroke.c) ? stroke.c : '#222222';
            const width = Math.min(0.08, Math.max(0.002, Number(stroke.w) || 0.01));
            let saved = round.strokes.find((s) => s.id === id);
            if (!saved) {
                saved = { id, c: color, w: width, p: [] };
                round.strokes.push(saved);
            }
            saved.p.push(...points);
            socket.to(roomCode).emit('draw_points', { stroke: { id, c: color, w: width, p: points } });
        });

        socket.on('draw_clear', ({ roomCode } = {}) => {
            const room = activeMixupRooms[roomCode];
            if (!room || room.gameState !== 'draw' || room.round?.drawerId !== socket.id) return;
            room.round.strokes = [];
            room.round.pointCount = 0;
            MNS.to(roomCode).emit('drawing_snapshot', { strokes: [] });
        });

        socket.on('get_drawing', ({ roomCode } = {}) => {
            const room = activeMixupRooms[roomCode];
            if (!room?.players[socket.id] || room.round?.type !== 'draw') return;
            socket.emit('drawing_snapshot', { strokes: room.round.strokes || [] });
        });

        // ---------- Pictionary: a guess (the first right one ends the round) ----------
        socket.on('submit_guess', ({ roomCode, guess } = {}) => {
            const room = activeMixupRooms[roomCode];
            const player = room?.players[socket.id];
            const round = room?.round;
            if (!room || !player || player.isCaster || room.gameState !== 'draw' || round.drawerId === socket.id) return;
            const text = String(guess || '').replace(/\s+/g, ' ').trim().slice(0, MAX_GUESS);
            if (!text) return;

            if (isRightGuess(text, round.prompt)) {
                socket.emit('guess_result', { correct: true });
                return endDrawing(roomCode, socket.id);
            }
            // Wrong guesses show up on the TV (it's half the fun)
            round.guesses.push({ name: player.name, text });
            if (round.guesses.length > 30) round.guesses.shift();
            socket.emit('guess_result', { correct: false });
            broadcast(roomCode);
        });

        // ---------- Threefold: answers, saved as they're typed, then locked in ----------
        const saveAnswers = (room, player, items) => {
            player.matchList = (Array.isArray(items) ? items : []).slice(0, MATCH_CARD.listSize)
                .map((item) => (typeof item === 'string' ? item.trim().slice(0, MAX_ANSWER) : ''));
        };
        socket.on('update_answers', ({ roomCode, items } = {}) => {
            const room = activeMixupRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'match_write' || player.hasSubmitted) return;
            saveAnswers(room, player, items);
            broadcast(roomCode);
        });
        socket.on('submit_answers', ({ roomCode, items } = {}) => {
            const room = activeMixupRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'match_write' || player.hasSubmitted) return;
            saveAnswers(room, player, items);
            player.hasSubmitted = true;
            broadcast(roomCode);
            checkEveryoneDone(roomCode);
        });

        // ---------- Threefold: the judge moves answers between the matches ----------
        // groupId: the group to drop the answer into, or null to put it on its own
        const judgedRoom = (roomCode) => {
            const room = activeMixupRooms[roomCode];
            if (!room || room.gameState !== 'match_review' || room.round?.judgeId !== socket.id || !room.round.review) return null;
            return room;
        };
        socket.on('review_move', ({ roomCode, itemId, groupId = null } = {}) => {
            const room = judgedRoom(roomCode);
            if (!room) return;
            const review = room.round.review;
            if (!canMove(review, itemId, groupId)) return;
            moveAnswer(review, itemId, groupId);
            broadcast(roomCode);
        });
        // "Start over": back to the computer's matches
        socket.on('review_reset', ({ roomCode } = {}) => {
            const room = judgedRoom(roomCode);
            if (!room) return;
            const review = room.round.review;
            review.groups = review.autoGroups.map((g) => ({ id: g.id, itemIds: [...g.itemIds] }));
            broadcast(roomCode);
        });
        // "Looks good!": done judging
        socket.on('review_done', ({ roomCode } = {}) => {
            if (judgedRoom(roomCode)) scoreMatches(roomCode);
        });

        // ---------- Event: The caster wants another game with the same players ----------
        socket.on('playAgain', ({ roomCode } = {}) => {
            const room = activeMixupRooms[roomCode];
            if (!room || !room.players[socket.id]?.isCaster) return;
            if (room.gameState !== 'scoreboard' || !room.isGameOver) return;
            resetForNewGame(roomCode);
        });

        // ---------- Event: The caster is done for the night ----------
        socket.on('endGame', ({ roomCode } = {}) => {
            const room = activeMixupRooms[roomCode];
            if (!room || !room.players[socket.id]?.isCaster) return;
            socket.leave(roomCode);
            closeRoom(roomCode, 'Thanks for playing! The host ended the game.');
        });

        // ---------- Event: Leave / Disconnect ----------
        socket.on('leaveRoom', ({ roomCode } = {}) => {
            const code = (roomCode || '').trim().toUpperCase();
            if (!activeMixupRooms[code]?.players[socket.id]) return;
            socket.leave(code);
            playerLeftRoom(socket.id, code);
        });

        socket.on('disconnect', () => {
            Object.keys(activeMixupRooms)
                .filter((code) => activeMixupRooms[code].players[socket.id])
                .forEach((code) => playerLeftRoom(socket.id, code));
        });
    });
}
