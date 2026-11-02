// 🏗️ Tower Party: a co-op mini-game the phones play in the lobby while everyone joins.
// The players take turns: your avatar swings above the tower and you tap to drop it on top.
// Land it close to the block below and the tower grows (dead on is a "Perfect" and snaps into place);
// miss by too much and the whole tower topples, and the team starts a new one.
// The team's best height and what each player added are kept for the end credits.
//
// The room keeps `room.tower` (sent to every screen); turn clocks live here, off the room.

const TURN_MS = 9000;        // a turn left untouched passes to the next player
const LAND_WITHIN = 0.8;     // how far off the block below (in block widths) still lands
const PERFECT_WITHIN = 0.12; // this close snaps right on top
const SWING_WIDTH = 1.6;     // how far either side the avatar swings (block widths)

const turnTimers = new Map();   // roomCode -> timeout

export const newTower = () => ({
    blocks: [],        // [{ playerId, avatar, name, x }] from the bottom up
    best: 0,           // the team's tallest tower this game
    towers: 0,         // how many towers the team has built (and toppled)
    turnId: null,      // whose avatar is swinging
    turnNumber: 0,     // counts up every turn, so phones know a new one started
    swing: null,       // { period, width } for the turn: the higher the tower, the faster the swing
    last: null,        // what just happened: { type: 'landed' | 'perfect' | 'toppled' | 'skipped', playerId, height }
    stats: {},         // playerId -> { name, avatar, stacked, perfects }
});

// The players in join order (the TV doesn't play)
const towerPlayers = (room) => Object.values(room.players)
    .filter((p) => !p.isCaster && p.isConnected !== false)
    .sort((a, b) => a.joinOrder - b.joinOrder);

const clearTurn = (roomCode) => {
    clearTimeout(turnTimers.get(roomCode));
    turnTimers.delete(roomCode);
};

/** Hand the swinging avatar to the next player (after `afterId`, or the first one) */
const nextTurn = (room, broadcast, afterId = room.tower.turnId) => {
    clearTurn(room.roomCode);
    const tower = room.tower;
    const players = towerPlayers(room);
    if (room.gameState !== 'lobby' || !players.length) {
        tower.turnId = null;
        tower.swing = null;
        return;
    }
    const at = players.findIndex((p) => p.id === afterId);
    const next = players[(at + 1) % players.length];
    tower.turnId = next.id;
    tower.turnNumber += 1;
    tower.swing = { period: Math.max(0.9, 2.2 - tower.blocks.length * 0.09), width: SWING_WIDTH };

    const turn = tower.turnNumber;
    turnTimers.set(room.roomCode, setTimeout(() => {
        if (room.tower?.turnNumber !== turn) return;
        room.tower.last = { type: 'skipped', playerId: next.id, height: room.tower.blocks.length };
        nextTurn(room, broadcast);
        broadcast();
    }, TURN_MS));
};

/** Someone joined or left the lobby: make sure the avatar is swinging over a player who's here */
export function towerRosterChanged(room, broadcast) {
    if (!room.tower) room.tower = newTower();
    if (room.gameState !== 'lobby') return;
    const here = towerPlayers(room).some((p) => p.id === room.tower.turnId);
    if (!here) nextTurn(room, broadcast, null);
}

/** The player whose turn it is let go at `x` (block widths from the middle). Returns true if it counted. */
export function towerDrop(room, playerId, x, broadcast) {
    const tower = room.tower;
    if (!tower || room.gameState !== 'lobby' || tower.turnId !== playerId) return false;
    const player = room.players[playerId];
    if (!player) return false;

    const dropX = Math.max(-SWING_WIDTH, Math.min(SWING_WIDTH, Number(x) || 0));
    const top = tower.blocks[tower.blocks.length - 1];
    const below = top ? top.x : 0;
    const off = Math.abs(dropX - below);
    // Scores follow the player, not the connection (a phone that drops and rejoins gets a new socket id)
    const statKey = player.playerId || playerId;
    const stat = tower.stats[statKey] || (tower.stats[statKey] = { name: player.name, avatar: player.avatar, stacked: 0, perfects: 0 });
    stat.name = player.name;
    stat.avatar = player.avatar;

    if (top && off > LAND_WITHIN) {
        // 💥 Over it goes: the team starts again (the best height is kept)
        tower.towers += 1;
        tower.last = { type: 'toppled', playerId, height: tower.blocks.length };
        tower.blocks = [];
    } else {
        const perfect = !top || off <= PERFECT_WITHIN;
        tower.blocks.push({ playerId, avatar: player.avatar, name: player.name, x: perfect ? below : dropX });
        stat.stacked += 1;
        if (perfect && top) stat.perfects += 1;
        tower.best = Math.max(tower.best, tower.blocks.length);
        tower.last = { type: perfect && top ? 'perfect' : 'landed', playerId, height: tower.blocks.length };
    }
    nextTurn(room, broadcast, playerId);
    broadcast();
    return true;
}

/** The real game started (or the room closed): stop the turns, keep the scores for the credits */
export function towerStop(room) {
    clearTurn(room.roomCode);
    if (room.tower) {
        room.tower.turnId = null;
        room.tower.swing = null;
    }
}

/** A brand-new game in the same room: a fresh tower and fresh scores */
export function towerReset(room, broadcast) {
    clearTurn(room.roomCode);
    room.tower = newTower();
    towerRosterChanged(room, broadcast);
}
