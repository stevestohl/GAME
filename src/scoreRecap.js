// 🏆 What the narrator (and the scoreboard headline) says about the scores.
// Shared by Couch Cast and Trivia Cast.

// When one player is ahead, the narrator rotates through these so it doesn't repeat itself
const LEADER_LINES = [
    (name, score) => `${name} is pulling ahead with ${score} points!`,
    (name) => `${name} takes the lead! Everyone else, time to step it up.`,
    (name, score) => `All hail ${name}, sitting on top with ${score} points!`,
];

const TIE_LINES = [
    "Looks like everyone's neck and neck!",
    "It's a close call! Everyone's even Steven.",
];

const NO_WINNERS = "Looks like there were no winners that time. On to the next round!";

// "Ann", "Ann and Bo", "Ann, Bo and Cy"
const joinNames = (names) => (names.length <= 1
    ? names.join('')
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

/**
 * @param {object}   recap
 * @param {object[]} recap.players         everyone playing (not the TV), with their `score`
 * @param {boolean}  recap.roundHadWinner  did anyone score in the round that just ended?
 * @param {number}   recap.round           round number (picks which leader line to use)
 * @param {boolean}  recap.isGameOver      the final scores
 * @returns {{ headline: string, spoken: string }}
 */
export function scoreRecap({ players = [], roundHadWinner = true, round = 1, isGameOver = false }) {
    const ranked = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
    const topScore = ranked[0]?.score || 0;
    const leaders = ranked.filter((p) => (p.score || 0) === topScore);
    const everyoneTied = leaders.length === ranked.length;
    const pick = (lines) => lines[(Math.max(1, round) - 1) % lines.length];

    // ---- The end of the game ----
    if (isGameOver) {
        if (!ranked.length || topScore === 0) {
            const line = "That's the game! Nobody scored, so I guess everybody wins. Thanks for playing!";
            return { headline: "Nobody scored... everybody wins!", spoken: line };
        }
        if (leaders.length > 1) {
            const names = joinNames(leaders.map((p) => p.name));
            return {
                headline: `It's a tie! ${names} share the crown!`,
                spoken: `That's the game, and it's a tie between ${names}, with ${topScore} points each! Thanks for playing!`,
            };
        }
        const champ = leaders[0];
        return {
            headline: `👑 ${champ.name} Wins the Game!`,
            spoken: `That's the game! ${champ.name} wins with ${champ.score} points. Thanks for playing!`,
        };
    }

    // ---- Between rounds ----
    if (!roundHadWinner || topScore === 0) {
        return { headline: 'No winners that time... on to the next round!', spoken: NO_WINNERS };
    }

    if (leaders.length > 1) {
        // Everyone level: the classic lines. Only some level at the top: name them.
        const line = everyoneTied || leaders.length > 3
            ? pick(TIE_LINES)
            : `It's a close call! ${joinNames(leaders.map((p) => p.name))} are even Steven.`;
        return { headline: line, spoken: line };
    }

    const leader = leaders[0];
    const line = pick(LEADER_LINES)(leader.name, leader.score);
    return { headline: `👑 ${line}`, spoken: line };
}
