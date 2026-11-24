// 🔨 Whack-an-Avatar: the game the phones play in Trivia Cast's lobby while everyone joins. The other players'
// avatars pop up out of holes on your screen and you tap them before they duck back down; a golden one is worth
// three, and tapping the skunk costs you one. Most whacks leads the room.
// Each phone runs its own holes and tells the server about a whack, so there's no lag to tap around.
// The room keeps `room.whack` (sent to every screen); it's reset for each new game.

const MIN_WHACK_GAP_MS = 120;   // faster than a thumb can tap two holes: ignore it

const lastWhackAt = new Map();  // whacker's socket id -> when their last whack counted

export const newWhack = () => ({
    scores: Object.create(null),   // player name (unique in a room) -> { name, avatar, whacks, timesWhacked }
});

const scoreFor = (whack, player) => {
    const score = whack.scores[player.name] || (whack.scores[player.name] = { name: player.name, avatar: player.avatar, whacks: 0, timesWhacked: 0 });
    score.avatar = player.avatar;
    return score;
};

/** `whackerId` whacked `targetId`'s avatar (`golden`: the rare gold one, worth three). Returns who got whacked, or null. */
export function whackHit(room, whackerId, targetId, golden = false) {
    const whacker = room.players[whackerId];
    const target = room.players[targetId];
    if (room.gameState !== 'lobby' || !room.whack) return null;
    if (!whacker || whacker.isCaster || !target || target.isCaster || whackerId === targetId) return null;

    const now = Date.now();
    if (now - (lastWhackAt.get(whackerId) || 0) < MIN_WHACK_GAP_MS) return null;
    lastWhackAt.set(whackerId, now);

    scoreFor(room.whack, whacker).whacks += golden ? 3 : 1;
    scoreFor(room.whack, target).timesWhacked += 1;
    return target;
}

/** `whackerId` tapped the skunk: one whack off (never below none). Returns true if the score changed. */
export function whackSkunk(room, whackerId) {
    const whacker = room.players[whackerId];
    if (room.gameState !== 'lobby' || !room.whack || !whacker || whacker.isCaster) return false;
    const score = scoreFor(room.whack, whacker);
    if (score.whacks <= 0) return false;
    score.whacks -= 1;
    return true;
}

export function whackPlayerGone(socketId) {
    lastWhackAt.delete(socketId);
}
