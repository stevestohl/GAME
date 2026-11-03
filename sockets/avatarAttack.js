// 👾 Avatar Attack: a shooter the phones play in Trivia Cast's lobby while everyone joins. The other
// players' avatars fall from the top of your screen and you shoot them; most hits leads the room.
// Each phone runs its own falling avatars and tells the server about a hit, so there's no lag to
// aim around. The room keeps `room.attack` (sent to every screen); it's reset for each new game.

const MIN_HIT_GAP_MS = 100;     // faster than the blaster can fire: ignore it

const lastHitAt = new Map();    // shooter's socket id -> when their last hit counted

export const newAttack = () => ({
    scores: Object.create(null),   // player name (unique in a room) -> { name, avatar, hits, timesHit }
});

const scoreFor = (attack, player) => {
    const score = attack.scores[player.name] || (attack.scores[player.name] = { name: player.name, avatar: player.avatar, hits: 0, timesHit: 0 });
    score.avatar = player.avatar;
    return score;
};

/** `shooterId` hit `targetId`'s falling avatar. Returns who got hit, or null if it doesn't count. */
export function attackHit(room, shooterId, targetId) {
    const shooter = room.players[shooterId];
    const target = room.players[targetId];
    if (room.gameState !== 'lobby' || !room.attack) return null;
    if (!shooter || shooter.isCaster || !target || target.isCaster || shooterId === targetId) return null;

    const now = Date.now();
    if (now - (lastHitAt.get(shooterId) || 0) < MIN_HIT_GAP_MS) return null;
    lastHitAt.set(shooterId, now);

    scoreFor(room.attack, shooter).hits += 1;
    scoreFor(room.attack, target).timesHit += 1;
    return target;
}

export function attackPlayerGone(socketId) {
    lastHitAt.delete(socketId);
}
