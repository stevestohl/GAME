// 🐍 Snake Snack: the snake game the phones play in Temple Mix Up's lobby while everyone joins. Swipe to steer,
// eat the other players' avatars, and don't bite yourself. Each phone runs its own board and tells the server
// when something's eaten, so a slow connection never gets in the way of the controls. The room keeps
// `room.snake` (sent to every screen); it's reset for each new game.

const MIN_EAT_GAP_MS = 70;      // faster than the snake can move: ignore it
const MAX_LENGTH = 2000;

const lastEatAt = new Map();    // eater's socket id -> when their last bite counted

export const newSnake = () => ({
    scores: Object.create(null),   // player name (unique in a room) -> { name, avatar, eaten, timesEaten, crashes, longest }
});

const scoreFor = (snake, player) => {
    const score = snake.scores[player.name] || (snake.scores[player.name] = { name: player.name, avatar: player.avatar, eaten: 0, timesEaten: 0, crashes: 0, longest: 0 });
    score.avatar = player.avatar;
    return score;
};

const cleanLength = (length) => (Number.isInteger(length) && length > 0 ? Math.min(length, MAX_LENGTH) : 0);

/** `eaterId` ate `targetId`'s avatar, reaching `length`. Returns who got eaten, or null if it doesn't count. */
export function snakeEat(room, eaterId, targetId, length) {
    const eater = room.players[eaterId];
    const target = room.players[targetId];
    if (room.gameState !== 'lobby' || !room.snake) return null;
    if (!eater || eater.isCaster || !target || target.isCaster || eaterId === targetId) return null;

    const now = Date.now();
    if (now - (lastEatAt.get(eaterId) || 0) < MIN_EAT_GAP_MS) return null;
    lastEatAt.set(eaterId, now);

    const score = scoreFor(room.snake, eater);
    score.eaten += 1;
    score.longest = Math.max(score.longest, cleanLength(length));
    scoreFor(room.snake, target).timesEaten += 1;
    return target;
}

/** `playerId` bit their own tail at `length`. Returns true if it counts. */
export function snakeCrash(room, playerId, length) {
    const player = room.players[playerId];
    if (room.gameState !== 'lobby' || !room.snake || !player || player.isCaster) return false;
    const score = scoreFor(room.snake, player);
    score.crashes += 1;
    score.longest = Math.max(score.longest, cleanLength(length));
    return true;
}

export function snakePlayerGone(socketId) {
    lastEatAt.delete(socketId);
}
