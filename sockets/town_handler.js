// 🏙️ Temple Town: a property game for the TV and phones. Buy lots, put up buildings, and charge your friends rent.
//
// The town is a map of five neighborhoods, four lots each (no track, no dice). Every round:
//   headline:        a narrated news flash sets tonight's payouts and one twist for everyone
//   auction:         2-4 lots go on sale; everyone bids in secret on their phone
//   auction_results: the TV reveals the bids one lot at a time. Highest bid wins (a tie goes to whoever is further behind)
//   build:           upgrade your lots: an empty lot becomes a Shop, then a Tower. Buildings rise live on the TV
//   night:           everyone secretly picks a neighborhood to go out in (or stays in for a small, safe payout)
//   payday:          each neighborhood's payout is shared by everyone who went there, and visitors pay rent
//                    to every owner there (never to themselves). The neighborhood's Boss also takes a fee
//   standings:       net worth so far, then the next round's headline (or the final standings)
// Nobody is knocked out: you can go into the red (then you can't bid or build until you're back above zero).
// After the last round, the highest net worth wins: cash, plus what your lots and buildings cost, plus Boss bonuses.
// A neighborhood's Boss is whoever owns the most lots there (at least two, and no ties).
// Room codes start with "B".
import { newSnake, snakeEat, snakeCrash, snakePlayerGone } from "./snakeGame.js";
import { guardCreateRoom } from '../db/gameVisibility.js';
import { randomUUID } from "crypto";
import { startRoomJanitor } from "./roomJanitor.js";

const activeTownRooms = {};

// Lets the HTTP side (voice-overs) check that a room is real and still open
export const getTownRoom = (roomCode) => activeTownRooms[roomCode] || null;

// --- The town ---
// price: an empty lot's lowest bid (and what it's worth); buzz: what the neighborhood pays out on a normal night
const HOODS = [
    { id: 'docks', name: 'The Docks', price: 100, buzz: 200, lots: ['Fish Market', 'Boat Shed', 'Pier Shack', 'Lighthouse'] },
    { id: 'market', name: 'Old Market', price: 150, buzz: 250, lots: ['Clock Corner', 'Cheese Cellar', 'Bakery Row', 'Lantern Alley'] },
    { id: 'fair', name: 'Fairgrounds', price: 200, buzz: 300, lots: ['Ferris Field', 'Corn Dog Stand', 'Petting Barn', 'Bandstand'] },
    { id: 'neon', name: 'Neon Strip', price: 250, buzz: 350, lots: ['Arcade', 'Karaoke Box', 'Midnight Diner', 'Disco Hall'] },
    { id: 'hill', name: 'Hilltop', price: 300, buzz: 400, lots: ['Observatory', 'Vineyard', 'Golf Green', 'Castle View'] },
];
const HOOD_BY_ID = Object.fromEntries(HOODS.map((h) => [h.id, h]));

// What's on a lot: 0 an empty lot, 1 a Shop, 2 a Tower
const LEVEL_NAMES = ['Empty lot', 'Shop', 'Tower'];
const RENT = [20, 60, 150];          // what each visitor pays the owner, per lot
const DRAW = [0, 50, 125];           // what each building adds to its neighborhood's payout (crowds come to see it)
const BUILD_COST = [1, 1.5];         // a Shop costs the lot's price; a Tower costs 1.5 times it on top

// --- Game settings ---
// 3 to 20 rounds. The 20 lots are usually all sold within about 8 rounds; after that a round skips the land grab.
export const ROUND_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 3);
const MIN_PLAYERS = 3;
const START_CASH = 1500;
const HOME_PAY = 100;                // staying in
const BOSS_FEE = 40;                 // each visitor to a neighborhood pays its Boss this too
const BOSS_BONUS = 250;              // a Boss's neighborhood is worth this much extra
const BID_STEP = 10;

const SECOND = 1000;
const HEADLINE_TIME = 8 * SECOND;
const AUCTION_TIME = 35 * SECOND;
const REVEAL_PER_LOT = 3 * SECOND;   // the bids light up one lot at a time
const REVEAL_EXTRA = 2.5 * SECOND;
const BUILD_TIME = 35 * SECOND;
const NIGHT_TIME = 25 * SECOND;
const PAYDAY_TIME = 13 * SECOND;
const STANDINGS_TIME = 8 * SECOND;
const GRACE = 1500;                  // a last-second tap still counts

const roundTo = (n, step = BID_STEP) => Math.round(n / step) * step;
const shuffle = (list) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

// ===================== HEADLINES =====================
// One news flash a round, for everyone. `hood` ones pick a neighborhood when the game is planned.
const OPENING = { id: 'opening', title: 'Grand Opening!', text: 'Temple Town opens for business! Every neighborhood pays $100 more tonight.', allAdd: 100 };
const FINALE = { id: 'finale', title: 'Last Night in Town', text: 'One last night out! Every neighborhood pays $200 more tonight.', allAdd: 200 };
const HEADLINES = [
    { id: 'festival', hood: true, title: (h) => `${h} Food Festival`, text: (h) => `${h} pays double tonight.`, mult: 2 },
    { id: 'concert', hood: true, title: (h) => `Concert in ${h}`, text: (h) => `${h} pays $400 more tonight.`, add: 400 },
    { id: 'blackout', hood: true, title: (h) => `Blackout in ${h}!`, text: (h) => `${h} pays nothing tonight. Its owners won't like that.`, closed: true },
    { id: 'rain', title: 'Rainy Night', text: 'Staying in pays $300 tonight.', homePay: 300 },
    { id: 'tourists', title: 'Tour Bus Arrives', text: 'Every neighborhood pays $150 more tonight.', allAdd: 150 },
    { id: 'rentfree', title: 'Rent Holiday', text: 'No rent anywhere tonight. Go wherever you like!', rentMult: 0 },
    { id: 'rentday', title: 'Rent Day', text: 'Every rent is doubled tonight. Choose carefully!', rentMult: 2 },
    { id: 'buildsale', title: "Builder's Sale", text: 'Shops and Towers cost half price this round.', buildDiscount: 0.5 },
    { id: 'landrush', title: 'Land Rush', text: 'An extra lot goes up for sale this round.', extraLots: 1 },
    { id: 'refund', title: 'Tax Refund', text: 'Everyone gets $150.', giftAll: 150 },
    { id: 'grant', title: 'Small Business Grant', text: 'Whoever is in last place gets $300.', giftLast: 300 },
];

/** The headline for each round: the opening first, the finale last, and no repeats in between */
const planHeadlines = (totalRounds) => {
    const middle = [];
    let deck = [];
    while (middle.length < totalRounds - 2) {
        if (!deck.length) deck = shuffle(HEADLINES);
        const card = deck.pop();
        if (middle.length && middle[middle.length - 1].id === card.id) continue;
        if (card.hood) {
            const hood = HOODS[Math.floor(Math.random() * HOODS.length)];
            middle.push({ ...card, hoodId: hood.id, title: card.title(hood.name), text: card.text(hood.name) });
        } else middle.push({ ...card });
    }
    return [OPENING, ...middle, FINALE];
};

// ===================== THE MONEY =====================
const lotsIn = (room, hoodId) => room.lots.filter((l) => l.hood === hoodId);

// A building's full price on a lot (level 0: the Shop, level 1: the Tower), in whole $10s
const fullBuildCost = (lot, level) => roundTo(lot.price * BUILD_COST[level]);

/** What a lot (and its buildings) is worth: what it all costs at full price */
const lotValue = (lot) => {
    const shop = lot.level >= 1 ? fullBuildCost(lot, 0) : 0;
    const tower = lot.level >= 2 ? fullBuildCost(lot, 1) : 0;
    return lot.price + shop + tower;
};

/** The next building's price on this lot this round (null if it's already a Tower) */
const buildCost = (room, lot) => {
    if (lot.level >= 2) return null;
    const discount = room.round?.headline?.buildDiscount || 1;
    return roundTo(fullBuildCost(lot, lot.level) * discount);
};

/** The neighborhood's Boss: most lots there, at least two, no ties */
const bossOf = (room, hoodId) => {
    const counts = {};
    lotsIn(room, hoodId).forEach((l) => { if (l.ownerKey) counts[l.ownerKey] = (counts[l.ownerKey] || 0) + 1; });
    const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!ranked.length || ranked[0][1] < 2 || (ranked[1] && ranked[1][1] === ranked[0][1])) return null;
    return ranked[0][0];
};

const netWorth = (room, player) => {
    const lots = room.lots.filter((l) => l.ownerKey === player.key);
    const bosses = HOODS.filter((h) => bossOf(room, h.id) === player.key).length;
    return player.cash + lots.reduce((sum, l) => sum + lotValue(l), 0) + bosses * BOSS_BONUS;
};

/** Tonight's payout in a neighborhood (shared by everyone who goes) */
const payoutFor = (room, hoodId) => {
    const headline = room.round?.headline || {};
    const hood = HOOD_BY_ID[hoodId];
    if (headline.closed && headline.hoodId === hoodId) return 0;
    const draws = lotsIn(room, hoodId).reduce((sum, l) => sum + DRAW[l.level], 0);
    const mult = headline.hoodId === hoodId && headline.mult ? headline.mult : 1;
    const add = (headline.hoodId === hoodId && headline.add ? headline.add : 0) + (headline.allAdd || 0);
    return roundTo((hood.buzz + draws) * mult + add);
};

const rentMult = (room) => room.round?.headline?.rentMult ?? 1;
const homePay = (room) => room.round?.headline?.homePay ?? HOME_PAY;

/** Who a visitor to this neighborhood pays, and how much: [{ toKey, amount, why }] */
const billFor = (room, hoodId, visitorKey) => {
    const mult = rentMult(room);
    if (!mult) return [];
    const bills = [];
    lotsIn(room, hoodId).forEach((l) => {
        if (l.ownerKey && l.ownerKey !== visitorKey) bills.push({ toKey: l.ownerKey, amount: RENT[l.level] * mult, why: l.name });
    });
    const boss = bossOf(room, hoodId);
    if (boss && boss !== visitorKey) bills.push({ toKey: boss, amount: BOSS_FEE * mult, why: 'Boss fee' });
    return bills;
};

// What the screens are allowed to see. Bids stay secret until the reveal, and where everyone's going until payday.
const getSafeRoom = (room) => {
    if (!room) return null;
    const state = room.gameState;
    const round = room.round;

    const players = {};
    Object.values(room.players).forEach((p) => {
        const worth = p.isCaster ? 0 : netWorth(room, p);
        players[p.id] = {
            id: p.id,
            key: p.key || null,
            name: p.name,
            avatar: p.avatar || null,
            seat: p.joinOrder,
            isCaster: p.isCaster,
            isPlayerHost: p.isPlayerHost,
            isConnected: p.isConnected,
            joinOrder: p.joinOrder,
            cash: p.cash ?? 0,
            worth,
            worthAtStart: p.worthAtStart ?? worth,   // at the start of this round, for "+$240 this round"
            hasSubmitted: !!p.hasSubmitted,
        };
    });

    let roundView = null;
    if (round) {
        roundView = {
            number: room.currentRound,
            headline: { id: round.headline.id, title: round.headline.title, text: round.headline.text, hoodId: round.headline.hoodId || null },
            forSale: round.forSale || [],
            homePay: homePay(room),
            rentMult: rentMult(room),
            payouts: Object.fromEntries(HOODS.map((h) => [h.id, payoutFor(room, h.id)])),
        };
        if (['auction_results', 'build', 'night', 'payday', 'standings'].includes(state)) roundView.sales = round.sales || [];
        if (state === 'payday' || state === 'standings') roundView.payday = round.payday || null;
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
        isPaused: !!room.isPaused,
        minPlayers: MIN_PLAYERS,
        town: {
            hoods: HOODS.map(({ id, name, price, buzz }) => ({ id, name, price, buzz, boss: bossOf(room, id) })),
            lots: room.lots.map((l) => ({ ...l, value: lotValue(l), rent: RENT[l.level], nextCost: buildCost(room, l) })),
            rules: { startCash: START_CASH, homePay: HOME_PAY, bossFee: BOSS_FEE, bossBonus: BOSS_BONUS, rent: RENT, draw: DRAW, levelNames: LEVEL_NAMES, bidStep: BID_STEP },
        },
        round: roundView,
        players,
    };
};

const makeRoomCode = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code;
    do {
        code = 'B';
        for (let i = 0; i < 3; i++) code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    } while (activeTownRooms[code]);
    return code;
};

const freshLots = () => HOODS.flatMap((h) => h.lots.map((name, i) => ({
    id: `${h.id}-${i}`, hood: h.id, name, price: h.price, ownerKey: null, level: 0, paid: 0,
})));

export default function registerTownNamespace(TNS) {

    const broadcast = (roomCode) => {
        TNS.to(roomCode).emit('room_updated', getSafeRoom(activeTownRooms[roomCode]));
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
            if (activeTownRooms[roomCode] !== room || room.gameState !== state) return;
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

    // ⏸️ The caster pauses: the round's clock stops, every countdown holds still, and nobody can bid, build or go out
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

    const HELD_WHILE_PAUSED = new Set(['submit_bids', 'build', 'build_done', 'go_out']);

    const activePlayers = (room) => Object.values(room.players).filter((p) => !p.isCaster && p.isConnected);
    const allPlayers = (room) => Object.values(room.players).filter((p) => !p.isCaster);
    const playerCount = (room) => activePlayers(room).length;
    const byKey = (room, key) => allPlayers(room).find((p) => p.key === key) || null;

    // Each phone's private bits: its own bids and where it's going tonight
    const sendPrivateState = (socket, room) => {
        const player = room.players[socket.id];
        if (!player || player.isCaster) return;
        socket.emit('my_state', { bids: player.bids || {}, night: player.night || null });
    };

    const resetTurn = (room) => allPlayers(room).forEach((p) => { p.hasSubmitted = false; });

    // --- A new round: the headline first ---
    const startRound = (roomCode) => {
        const room = activeTownRooms[roomCode];
        if (!room) return;

        let headline = room.headlines[room.currentRound - 1] || OPENING;
        // A land rush with no land left: a tour bus instead
        if (headline.extraLots && !room.lotQueue.length) headline = HEADLINES.find((h) => h.id === 'tourists');
        room.round = { headline, forSale: [], sales: [], payday: null };

        allPlayers(room).forEach((p) => {
            p.worthAtStart = netWorth(room, p);
            p.bids = {};
            p.night = null;
            p.hasSubmitted = false;
        });

        // 🎁 Money handed out by the headline arrives straight away
        if (headline.giftAll) allPlayers(room).forEach((p) => { p.cash += headline.giftAll; });
        if (headline.giftLast) {
            const ranked = allPlayers(room).sort((a, b) => netWorth(room, a) - netWorth(room, b));
            const lowest = ranked.length ? netWorth(room, ranked[0]) : 0;
            ranked.filter((p) => netWorth(room, p) === lowest).forEach((p) => { p.cash += headline.giftLast; });
        }

        room.gameState = 'headline';
        room.endTime = Date.now() + HEADLINE_TIME;
        schedule(roomCode, room, 'headline', HEADLINE_TIME, () => startAuction(roomCode));
        broadcast(roomCode);
    };

    // ===================== LAND GRAB =====================
    const lotsPerRound = (room) => (playerCount(room) <= 4 ? 3 : 4);

    const startAuction = (roomCode) => {
        const room = activeTownRooms[roomCode];
        if (!room || room.gameState !== 'headline') return;
        const round = room.round;

        const count = Math.min(room.lotQueue.length, lotsPerRound(room) + (round.headline.extraLots || 0));
        round.forSale = room.lotQueue.splice(0, count);
        if (!round.forSale.length) return startBuild(roomCode);   // the whole town is sold

        // Nobody who can't afford even the cheapest lot has to wait around
        const cheapest = Math.min(...round.forSale.map((id) => room.lots.find((l) => l.id === id).price));
        resetTurn(room);
        allPlayers(room).forEach((p) => { if (p.cash < cheapest) p.hasSubmitted = true; });

        room.gameState = 'auction';
        room.endTime = Date.now() + AUCTION_TIME;
        schedule(roomCode, room, 'auction', AUCTION_TIME + GRACE, () => resolveAuction(roomCode));
        broadcast(roomCode);
        TNS.in(roomCode).fetchSockets().then((sockets) => sockets.forEach((s) => sendPrivateState(s, room)));
        if (activePlayers(room).every((p) => p.hasSubmitted)) resolveAuction(roomCode);
    };

    // Every lot's bids, highest first. A tie goes to whoever is further behind, then it's a coin toss.
    const resolveAuction = (roomCode) => {
        const room = activeTownRooms[roomCode];
        if (!room || room.gameState !== 'auction') return;
        const round = room.round;
        clearTimer(room);

        const worthAtStart = Object.fromEntries(allPlayers(room).map((p) => [p.key, netWorth(room, p)]));
        const coin = Object.fromEntries(allPlayers(room).map((p) => [p.key, Math.random()]));
        round.sales = round.forSale.map((lotId) => {
            const lot = room.lots.find((l) => l.id === lotId);
            const bids = allPlayers(room)
                .filter((p) => (p.bids?.[lotId] || 0) >= lot.price)
                .map((p) => ({ key: p.key, name: p.name, amount: p.bids[lotId] }))
                .sort((a, b) => b.amount - a.amount || worthAtStart[a.key] - worthAtStart[b.key] || coin[a.key] - coin[b.key]);
            // The winner pays (the bids were checked against their cash when they were placed)
            const winner = bids.find((b) => (byKey(room, b.key)?.cash ?? 0) >= b.amount) || null;
            if (winner) {
                const player = byKey(room, winner.key);
                player.cash -= winner.amount;
                lot.ownerKey = winner.key;
                lot.paid = winner.amount;
            } else {
                room.lotQueue.push(lotId);   // nobody wanted it: it comes up again later
            }
            const tied = winner ? bids.filter((b) => b.amount === winner.amount).length > 1 : false;
            return { lotId, winnerKey: winner?.key || null, amount: winner?.amount || 0, bids, tied };
        });

        room.gameState = 'auction_results';
        room.endTime = null;
        const revealTime = round.sales.length * REVEAL_PER_LOT + REVEAL_EXTRA;
        schedule(roomCode, room, 'auction_results', revealTime, () => startBuild(roomCode));
        broadcast(roomCode);
    };

    // ===================== BUILD =====================
    const canBuildSomething = (room, player) => player.cash > 0
        && room.lots.some((l) => l.ownerKey === player.key && l.level < 2 && player.cash >= buildCost(room, l));

    const startBuild = (roomCode) => {
        const room = activeTownRooms[roomCode];
        if (!room || !['headline', 'auction_results'].includes(room.gameState)) return;
        resetTurn(room);
        allPlayers(room).forEach((p) => { if (!canBuildSomething(room, p)) p.hasSubmitted = true; });

        // Nobody can build anything: straight on to the night out
        if (activePlayers(room).every((p) => p.hasSubmitted)) {
            room.gameState = 'build';
            return startNight(roomCode);
        }
        room.gameState = 'build';
        room.endTime = Date.now() + BUILD_TIME;
        schedule(roomCode, room, 'build', BUILD_TIME + GRACE, () => startNight(roomCode));
        broadcast(roomCode);
    };

    // ===================== NIGHT OUT =====================
    const startNight = (roomCode) => {
        const room = activeTownRooms[roomCode];
        if (!room || room.gameState !== 'build') return;
        clearTimer(room);
        resetTurn(room);
        allPlayers(room).forEach((p) => { p.night = null; });

        room.gameState = 'night';
        room.endTime = Date.now() + NIGHT_TIME;
        schedule(roomCode, room, 'night', NIGHT_TIME + GRACE, () => payday(roomCode));
        broadcast(roomCode);
        TNS.in(roomCode).fetchSockets().then((sockets) => sockets.forEach((s) => sendPrivateState(s, room)));
    };

    // ===================== PAYDAY =====================
    const payday = (roomCode) => {
        const room = activeTownRooms[roomCode];
        if (!room || room.gameState !== 'night') return;
        clearTimer(room);

        const players = allPlayers(room);
        // Anyone who didn't pick (or whose phone dropped out) stays in
        players.forEach((p) => { if (!p.night || (p.night !== 'home' && !HOOD_BY_ID[p.night])) p.night = 'home'; });

        const results = Object.fromEntries(players.map((p) => [p.key, { night: p.night, share: 0, rentPaid: 0, rentGot: 0, net: 0, cashBefore: p.cash }]));
        const transfers = [];
        const hoods = {};

        // Work it all out from the town as it stands, then pay up
        HOODS.forEach((hood) => {
            const visitors = players.filter((p) => p.night === hood.id);
            const pool = payoutFor(room, hood.id);
            const share = visitors.length ? Math.floor(pool / visitors.length / BID_STEP) * BID_STEP : 0;
            const rentTotal = {};
            visitors.forEach((v) => {
                results[v.key].share = share;
                billFor(room, hood.id, v.key).forEach((bill) => {
                    results[v.key].rentPaid += bill.amount;
                    if (results[bill.toKey]) results[bill.toKey].rentGot += bill.amount;
                    rentTotal[v.key] = (rentTotal[v.key] || 0) + bill.amount;
                    transfers.push({ fromKey: v.key, toKey: bill.toKey, amount: bill.amount, hood: hood.id, why: bill.why });
                });
            });
            hoods[hood.id] = { visitors: visitors.map((v) => v.key), pool, share, rent: rentTotal };
        });
        const home = players.filter((p) => p.night === 'home');
        home.forEach((p) => { results[p.key].share = homePay(room); });

        players.forEach((p) => {
            const r = results[p.key];
            r.net = r.share + r.rentGot - r.rentPaid;
            p.cash += r.net;
        });

        room.round.payday = { hoods, home: home.map((p) => p.key), homePay: homePay(room), results, transfers };
        room.gameState = 'payday';
        room.endTime = null;
        schedule(roomCode, room, 'payday', PAYDAY_TIME, () => showStandings(roomCode));
        broadcast(roomCode);
    };

    // --- Net worth between rounds; after the last round, the final standings ---
    const showStandings = (roomCode) => {
        const room = activeTownRooms[roomCode];
        if (!room) return;
        clearTimer(room);

        room.isGameOver = room.currentRound >= room.totalRounds;
        room.gameState = room.isGameOver ? 'final' : 'standings';
        room.endTime = null;
        broadcast(roomCode);
        if (room.isGameOver) return;   // stay on the final standings
        schedule(roomCode, room, 'standings', STANDINGS_TIME, () => {
            room.currentRound += 1;
            startRound(roomCode);
        });
    };

    // --- Done early? Move on as soon as everyone still here has finished ---
    const checkEveryoneDone = (roomCode) => {
        const room = activeTownRooms[roomCode];
        if (!room || room.isPaused) return;
        const here = activePlayers(room);
        if (!here.length || !here.every((p) => p.hasSubmitted)) return;
        if (room.gameState === 'auction') resolveAuction(roomCode);
        else if (room.gameState === 'build') startNight(roomCode);
        else if (room.gameState === 'night') payday(roomCode);
    };

    // --- A phone (or the TV) dropped out of a room ---
    const playerLeftRoom = (socketId, roomCode) => {
        const room = activeTownRooms[roomCode];
        const player = room?.players[socketId];
        if (!room || !player) return;

        player.isConnected = false;
        console.log(`[Temple Town] ${player.name} left room ${roomCode}`);

        if (Object.values(room.players).every((p) => !p.isConnected)) {
            room.destroyTimer = setTimeout(() => {
                console.log(`[Temple Town] Destroying abandoned room ${roomCode}`);
                clearTimer(room);
                delete activeTownRooms[roomCode];
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

        // In the lobby, someone who leaves is gone for good (their seat isn't saved)
        if (room.gameState === 'lobby' && !player.isCaster) delete room.players[socketId];

        checkEveryoneDone(roomCode);
        broadcast(roomCode);
    };

    // --- End a game for everyone still in it ---
    const closeRoom = (roomCode, message) => {
        const room = activeTownRooms[roomCode];
        if (!room) return;
        clearTimer(room);
        if (room.destroyTimer) clearTimeout(room.destroyTimer);
        console.log(`[Temple Town] Room ${roomCode} closed: ${message}`);
        TNS.to(roomCode).emit('room_closed', { roomCode, message });
        TNS.in(roomCode).socketsLeave(roomCode);
        delete activeTownRooms[roomCode];
    };

    const newGame = (room) => {
        room.lots = freshLots();
        room.lotQueue = shuffle(room.lots.map((l) => l.id));
        room.headlines = planHeadlines(room.totalRounds);
        room.currentRound = 1;
        room.round = null;
        room.isGameOver = false;
        room.endTime = null;
        room.isPaused = false;
        allPlayers(room).forEach((p) => {
            p.cash = START_CASH;
            p.worthAtStart = START_CASH;
            p.bids = {};
            p.night = null;
            p.hasSubmitted = false;
        });
    };

    // --- Same players, fresh game (the caster tapped "Play Again" on the final standings) ---
    const resetForNewGame = (roomCode) => {
        const room = activeTownRooms[roomCode];
        if (!room) return;
        clearTimer(room);
        Object.keys(room.players).forEach((id) => {
            const p = room.players[id];
            if (!p.isCaster && !p.isConnected) delete room.players[id];
        });
        const leader = activePlayers(room).sort((a, b) => a.joinOrder - b.joinOrder)[0];
        Object.values(room.players).forEach((p) => { p.isPlayerHost = !!leader && p.id === leader.id; });
        room.hostId = leader ? leader.id : null;
        room.gameId = randomUUID();
        room.snake = newSnake();
        newGame(room);
        room.gameState = 'lobby';
        console.log(`[Temple Town] Room ${roomCode}: playing again.`);
        broadcast(roomCode);
    };

    // --- One device, one game ---
    const leaveOtherRooms = (socket, exceptCode) => {
        Object.keys(activeTownRooms).forEach((code) => {
            if (code === exceptCode) return;
            const player = activeTownRooms[code].players[socket.id];
            if (!player) return;
            socket.leave(code);
            if (player.isCaster) closeRoom(code, 'The host ended that game.');
            else playerLeftRoom(socket.id, code);
        });
    };

    const canControl = (room, socket) => socket.id === room.hostId || room.players[socket.id]?.isCaster;

    // 🧹 Close rooms that are empty, finished or idle
    startRoomJanitor({
        label: 'Temple Town',
        namespace: TNS,
        rooms: activeTownRooms,
        isFinished: (room) => room.gameState === 'final',
        closeRoom,
    });

    TNS.on('connection', (socket) => {

        // ⏸️ Moves that arrive while the game is paused are dropped
        socket.use(([event, data], next) => {
            if (HELD_WHILE_PAUSED.has(event) && activeTownRooms[data?.roomCode]?.isPaused) return;
            next();
        });

        // ---------- Event: The TV makes a room ----------
        socket.on('createRoom', guardCreateRoom('town', socket, (data) => {
            leaveOtherRooms(socket);
            const roomCode = makeRoomCode();
            const totalRounds = ROUND_OPTIONS.includes(Number(data.totalRounds)) ? Number(data.totalRounds) : 8;
            const room = {
                roomCode,
                gameId: randomUUID(),
                gameState: 'lobby',
                totalRounds,
                hostId: null,
                timerId: null,
                snake: newSnake(),
                playerCount: 0,
                players: {
                    [socket.id]: {
                        id: socket.id, name: data.playerName || 'Caster', isCaster: true, isPlayerHost: false, isConnected: true, joinOrder: -1,
                    },
                },
            };
            newGame(room);
            activeTownRooms[roomCode] = room;
            socket.join(roomCode);
            socket.emit('roomCreated', { roomCode });
        }));

        // ---------- 🐍 Events: The lobby game ----------
        const sendSnakeScores = (roomCode, room) => {
            if (room.snakeTimer) return;
            room.snakeTimer = setTimeout(() => {
                room.snakeTimer = null;
                if (activeTownRooms[roomCode]) broadcast(roomCode);
            }, 250);
        };
        socket.on('snake_eat', ({ roomCode, targetId, length } = {}) => {
            const room = activeTownRooms[roomCode];
            if (!room) return;
            const target = snakeEat(room, socket.id, targetId, length);
            if (!target) return;
            socket.to(target.id).emit('snake_gotcha', { name: room.players[socket.id].name });
            sendSnakeScores(roomCode, room);
        });
        socket.on('snake_crash', ({ roomCode, length } = {}) => {
            const room = activeTownRooms[roomCode];
            if (room && snakeCrash(room, socket.id, length)) sendSnakeScores(roomCode, room);
        });
        socket.on('disconnect', () => snakePlayerGone(socket.id));

        // ---------- Event: Joining (phones, and the TV after a refresh) ----------
        socket.on('joinRoom', ({ roomCode, playerName, playerId, avatar } = {}) => {
            const cleanAvatar = typeof avatar === 'string' && /^[a-z0-9-]{1,24}$/.test(avatar) ? avatar : null;
            if (!roomCode) return;
            const code = String(roomCode).trim().toUpperCase();
            const room = activeTownRooms[code];
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
                delete room.players[existingKey];
                room.players[socket.id] = player;
            } else {
                const isFirstPlayer = !Object.values(room.players).some((p) => !p.isCaster && p.isConnected);
                player = {
                    playerId,
                    key: randomUUID().slice(0, 8),   // who owns what: stays the same through refreshes
                    avatar: cleanAvatar,
                    id: socket.id,
                    name: requestedName,
                    isCaster: false,
                    isPlayerHost: isFirstPlayer,
                    isConnected: true,
                    joinOrder: room.playerCount,
                    cash: START_CASH,
                    worthAtStart: START_CASH,
                    bids: {},
                    night: null,
                    // Joining mid-round: sit this part out (they can play from the next part on)
                    hasSubmitted: ['auction', 'build', 'night'].includes(room.gameState),
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
        });

        // ---------- Event: The room leader starts the game (lobby -> rules) ----------
        socket.on('startGame', ({ roomCode } = {}) => {
            const room = activeTownRooms[roomCode];
            if (!room || room.gameState !== 'lobby' || !canControl(room, socket)) return;
            if (playerCount(room) < MIN_PLAYERS) {
                return socket.emit('joinError', `You need at least ${MIN_PLAYERS} players to start.`);
            }
            newGame(room);
            room.gameState = 'rules';
            broadcast(roomCode);
        });

        // ---------- Event: Rules are done (rules -> first round) ----------
        socket.on('startRounds', ({ roomCode } = {}) => {
            const room = activeTownRooms[roomCode];
            if (!room || room.gameState !== 'rules' || !canControl(room, socket)) return;
            startRound(roomCode);
        });

        // ---------- Land Grab: secret bids, { lotId: amount }, locked in once ----------
        socket.on('submit_bids', ({ roomCode, bids } = {}) => {
            const room = activeTownRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'auction' || player.hasSubmitted) return;
            const clean = {};
            let total = 0;
            if (player.cash > 0 && bids && typeof bids === 'object') {
                room.round.forSale.forEach((lotId) => {
                    const lot = room.lots.find((l) => l.id === lotId);
                    const amount = Math.floor(Number(bids[lotId]) / BID_STEP) * BID_STEP;
                    if (!Number.isFinite(amount) || amount < lot.price) return;
                    clean[lotId] = amount;
                    total += amount;
                });
            }
            // You can't bid more than you have, all together
            if (total > player.cash) return socket.emit('town_error', "Those bids add up to more cash than you have.");
            player.bids = clean;
            player.hasSubmitted = true;
            sendPrivateState(socket, room);
            broadcast(roomCode);
            checkEveryoneDone(roomCode);
        });

        // ---------- Build: one upgrade at a time, paid for straight away ----------
        socket.on('build', ({ roomCode, lotId } = {}) => {
            const room = activeTownRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'build' || player.hasSubmitted) return;
            const lot = room.lots.find((l) => l.id === lotId);
            if (!lot || lot.ownerKey !== player.key || lot.level >= 2) return;
            const cost = buildCost(room, lot);
            if (player.cash < cost) return socket.emit('town_error', "You can't afford that yet.");
            player.cash -= cost;
            lot.level += 1;
            // Nothing else they can afford: they're done
            if (!canBuildSomething(room, player)) player.hasSubmitted = true;
            broadcast(roomCode);
            checkEveryoneDone(roomCode);
        });
        socket.on('build_done', ({ roomCode } = {}) => {
            const room = activeTownRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'build') return;
            player.hasSubmitted = true;
            broadcast(roomCode);
            checkEveryoneDone(roomCode);
        });

        // ---------- Night Out: a neighborhood (or 'home'), locked in once ----------
        socket.on('go_out', ({ roomCode, where } = {}) => {
            const room = activeTownRooms[roomCode];
            const player = room?.players[socket.id];
            if (!room || !player || player.isCaster || room.gameState !== 'night' || player.hasSubmitted) return;
            if (where !== 'home' && !HOOD_BY_ID[where]) return;
            player.night = where;
            player.hasSubmitted = true;
            sendPrivateState(socket, room);
            broadcast(roomCode);
            checkEveryoneDone(roomCode);
        });

        // ---------- ⏸️ Event: The caster pauses (or un-pauses) a running game ----------
        socket.on('set_paused', ({ roomCode, paused } = {}) => {
            const room = activeTownRooms[roomCode];
            if (!room || !room.players[socket.id]?.isCaster) return;
            if (['lobby', 'rules'].includes(room.gameState) || room.isGameOver) return;
            if (paused) pauseRoom(room); else resumeRoom(room);
            console.log(`[Temple Town] Room ${roomCode}: ${room.isPaused ? 'paused' : 'back on'}.`);
            broadcast(roomCode);
            if (!room.isPaused) checkEveryoneDone(roomCode);
        });

        // ---------- Event: The caster wants another game with the same players ----------
        socket.on('playAgain', ({ roomCode } = {}) => {
            const room = activeTownRooms[roomCode];
            if (!room || !room.players[socket.id]?.isCaster || room.gameState !== 'final') return;
            resetForNewGame(roomCode);
        });

        // ---------- Event: The caster is done for the night ----------
        socket.on('endGame', ({ roomCode } = {}) => {
            const room = activeTownRooms[roomCode];
            if (!room || !room.players[socket.id]?.isCaster) return;
            socket.leave(roomCode);
            closeRoom(roomCode, 'Thanks for playing! The host ended the game.');
        });

        // ---------- Event: Leave / Disconnect ----------
        socket.on('leaveRoom', ({ roomCode } = {}) => {
            const code = String(roomCode || '').trim().toUpperCase();
            if (!activeTownRooms[code]?.players[socket.id]) return;
            socket.leave(code);
            playerLeftRoom(socket.id, code);
        });

        socket.on('disconnect', () => {
            Object.keys(activeTownRooms)
                .filter((code) => activeTownRooms[code].players[socket.id])
                .forEach((code) => playerLeftRoom(socket.id, code));
        });
    });
}
