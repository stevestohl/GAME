// ✏️ List matching for List Cast and Listopia.
//
// When a round ends, every player's list is compared with everyone else's.
// Two answers "match" when they're the same thing written a little differently:
//   - capitals, accents, punctuation and spaces don't matter  ("Ice-Cream" = "ice cream" = "icecream")
//   - a leading "a", "an" or "the" doesn't matter               ("The Beatles" = "beatles")
//   - plurals don't matter                                      ("cats" = "cat", "boxes" = "box", "berries" = "berry")
//   - a small typo doesn't matter                               ("spagetti" = "spaghetti")
//
// What a match is worth depends on the round's card (the three Listography cards):
//   One-on-One     -> list up to 10. An answer scores only if exactly ONE other player wrote it too.
//   Threefold      -> list up to 3.  Every other player who wrote your answer scores you a point.
//   Forgotten Four -> list up to 4.  An answer scores only if NOBODY else wrote it. Matches are
//                     crossed out, and everything left over goes to a vote ("does it really count?").

/** The round cards. `points` is per scoring answer (Threefold: per player matched). */
export const CARD_TYPES = {
    one_on_one: {
        id: 'one_on_one',
        name: 'One-on-One',
        listSize: 10,
        writingSeconds: 90,
        goal: 'Match exactly ONE other player',
        howTo: 'List up to 10. An answer scores only if exactly one other player wrote it too. Two or more? It\'s out.',
    },
    threefold: {
        id: 'threefold',
        name: 'Threefold',
        listSize: 3,
        writingSeconds: 45,
        goal: 'Match as many players as you can',
        howTo: 'List up to 3. Score for every player who wrote the same answer as you.',
    },
    forgotten_four: {
        id: 'forgotten_four',
        name: 'Forgotten Four',
        listSize: 4,
        writingSeconds: 60,
        goal: 'Match NOBODY',
        howTo: 'List up to 4. Only answers nobody else wrote score, and the group votes on whether they really count.',
    },
};
export const CARD_ORDER = ['one_on_one', 'threefold', 'forgotten_four'];

/** Always gives back a real card (unknown ids fall back to Forgotten Four, the original List Cast rules) */
export const getCard = (id) => CARD_TYPES[id] || CARD_TYPES.forgotten_four;

/**
 * A card for every round: all three cards shuffled, then shuffled again for the next three, and so on,
 * so every card shows up and the same card never comes up three times running.
 */
export function drawCardTypes(rounds, random = Math.random) {
    const result = [];
    while (result.length < rounds) {
        const bag = [...CARD_ORDER];
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        // Don't open a new bag with the card that just ended the last one
        if (result.length && bag[0] === result[result.length - 1]) bag.push(bag.shift());
        result.push(...bag);
    }
    return result.slice(0, rounds);
}

const ARTICLES = new Set(['a', 'an', 'the']);

const stripAccents = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '');

// A rough singular: good enough to line up "cats"/"cat", "boxes"/"box", "puppies"/"puppy".
// Anything it misses is usually caught by the typo check below.
const singular = (word) => {
    if (word.length <= 3) return word;
    if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
    if (/(ches|shes|sses|uses|xes|zes)$/.test(word)) return word.slice(0, -2);
    if (word.endsWith('s') && !/(ss|us|is)$/.test(word)) return word.slice(0, -1);
    return word;
};

// The answer's words: lowercase, no accents or punctuation, no leading "a/an/the"
const toWords = (text) => {
    if (typeof text !== 'string') return [];
    const words = stripAccents(text.toLowerCase())
        .replace(/&/g, ' and ')
        .replace(/['’`]/g, '')            // "mcdonald's" -> "mcdonalds"
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean);
    while (words.length > 1 && ARTICLES.has(words[0])) words.shift();
    return words;
};

/** Turns an answer into a compact key used for comparing. "The Hot Dogs!" -> "hotdog" */
export function normalizeItem(text) {
    return toWords(text).map(singular).join('');
}

// The same, but with plurals left alone ("tacos"), for the typo check on short words
const plainKey = (text) => toWords(text).join('');

/** True when two answers are the same thing (plurals, spacing, punctuation and small typos aside) */
export function isSameAnswer(a, b) {
    return isSameItem(a.key, b.key) || isSameItem(a.plain, b.plain);
}

// How many single-letter edits (add, remove, change, or swap two neighbours) turn a into b
const editDistance = (a, b) => {
    const rows = a.length + 1;
    const cols = b.length + 1;
    const d = Array.from({ length: rows }, (_, i) => [i, ...Array(cols - 1).fill(0)]);
    for (let j = 0; j < cols; j++) d[0][j] = j;

    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
            }
        }
    }
    return d[a.length][b.length];
};

// "pizzza" -> "piza", "tacoss" -> "taco": a doubled-up key is almost always a typo
const squashDoubles = (key) => key.replace(/(.)\1+/g, '$1');

/**
 * True when two normalized keys are the same answer (allowing a small typo in longer words).
 * Careful on purpose: a crossed-out answer can't be voted back in, so when in doubt this says
 * "different" and lets the players vote on it instead. ("horse" vs "house" stay different.)
 */
export function isSameItem(keyA, keyB) {
    if (!keyA || !keyB) return false;
    if (keyA === keyB) return true;
    if (keyA.length >= 4 && keyB.length >= 4 && squashDoubles(keyA) === squashDoubles(keyB)) return true;

    const shorter = Math.min(keyA.length, keyB.length);
    if (shorter < 6) return false;                       // short words: one letter changes the meaning
    if (keyA[0] !== keyB[0]) return false;               // typos rarely hit the first letter ("mother" vs "bother")
    if (Math.abs(keyA.length - keyB.length) > 2) return false;
    const allowed = shorter >= 10 ? 2 : 1;
    return editDistance(keyA, keyB) <= allowed;
}

/**
 * Compares everyone's lists and applies the round card's rules.
 * @param {Array<{seat:number, name:string, list:string[]}>} players
 * @param {string} cardId   one of CARD_TYPES (defaults to Forgotten Four)
 * @returns {Array<{seat, name, items: Array<{id, text, status, matchedWith, matchCount, points}>}>}
 *   status: 'dup'       you wrote it twice: the repeat is crossed out (every card)
 *           'open'      Forgotten Four: nobody else wrote it, so it goes to the vote
 *           'matched'   Forgotten Four: someone else wrote it too: crossed out
 *           'scored'    One-on-One / Threefold: it matched the way the card wants: points!
 *           'crowded'   One-on-One: two or more others wrote it: crossed out
 *           'unmatched' One-on-One / Threefold: nobody else wrote it: no points
 *   points: how many scoring units the answer is worth (votes can still take Forgotten Four ones away)
 */
export function compareLists(players, cardId) {
    const card = getCard(cardId);
    const board = players.map((p) => ({ seat: p.seat, name: p.name, items: [] }));
    const all = [];

    board.forEach((entry, pi) => {
        const seen = [];
        (players[pi].list || []).slice(0, card.listSize).forEach((raw, index) => {
            const text = typeof raw === 'string' ? raw.trim() : '';
            const key = normalizeItem(text);
            if (!key) return;

            const item = { id: `${entry.seat}-${index}`, text, key, plain: plainKey(text), status: 'open', matchedWith: [], matchCount: 0, points: 0 };
            if (seen.some((other) => isSameAnswer(other, item))) item.status = 'dup';
            else seen.push(item);

            entry.items.push(item);
            all.push({ seat: entry.seat, item });
        });
    });

    all.forEach(({ seat, item }) => {
        if (item.status === 'dup') return;
        const matches = all.filter((o) => o.seat !== seat && o.item.status !== 'dup' && isSameAnswer(item, o.item));
        const seats = [...new Set(matches.map((o) => o.seat))];
        item.matchCount = seats.length;
        item.matchedWith = seats.map((s) => board.find((b) => b.seat === s)?.name).filter(Boolean);

        if (card.id === 'one_on_one') {
            item.status = seats.length === 1 ? 'scored' : seats.length === 0 ? 'unmatched' : 'crowded';
            item.points = seats.length === 1 ? 1 : 0;
        } else if (card.id === 'threefold') {
            item.status = seats.length > 0 ? 'scored' : 'unmatched';
            item.points = seats.length;
        } else {
            item.status = seats.length > 0 ? 'matched' : 'open';
            item.points = seats.length > 0 ? 0 : 1;
        }
    });

    // The keys were only needed for comparing
    board.forEach((entry) => entry.items.forEach((item) => { delete item.key; delete item.plain; }));
    return board;
}

/**
 * Counts the votes on every answer that went to a vote (Forgotten Four's survivors).
 * Each voter's ballot lists the answers they said "doesn't count"; everything else is a "counts".
 * An answer is thrown out only when MORE than half of the other players voted against it (a tie keeps it).
 * Answers that scored by matching (One-on-One, Threefold) don't need a vote: they count as they are.
 * @param {Array} board            from compareLists
 * @param {Array<{seat:number, ballot:string[]}>} voters   everyone who could vote this round
 */
export function resolveVotes(board, voters) {
    board.forEach((entry) => {
        entry.items.forEach((item) => {
            if (item.status === 'scored') {
                item.counts = true;
                return;
            }
            if (item.status !== 'open') {
                item.counts = false;
                item.points = 0;
                return;
            }
            const eligible = voters.filter((v) => v.seat !== entry.seat);
            const noVotes = eligible.filter((v) => (v.ballot || []).includes(item.id)).length;
            item.noVotes = noVotes;
            item.voterCount = eligible.length;
            item.counts = noVotes * 2 <= eligible.length;
            if (!item.counts) item.points = 0;
        });
    });
    return board;
}
