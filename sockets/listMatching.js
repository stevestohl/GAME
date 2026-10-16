// ✏️ List matching for List Cast and Listopia.
//
// When a round ends, every player's list is compared with everyone else's.
// Two answers "match" when they're the same thing written a little differently:
//   - capitals, accents, punctuation and spaces don't matter  ("Ice-Cream" = "ice cream" = "icecream")
//   - a leading "a", "an" or "the" doesn't matter               ("The Beatles" = "beatles")
//   - plurals don't matter                                      ("cats" = "cat", "boxes" = "box", "berries" = "berry")
//   - a small typo doesn't matter                               ("spagetti" = "spaghetti")
//
// Matching answers are crossed out automatically. Everything left over goes to a vote.

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
 * Compares everyone's lists.
 * @param {Array<{seat:number, name:string, list:string[]}>} players
 * @returns {Array<{seat, name, items: Array<{id, text, status, matchedWith}>}>}
 *   status: 'matched' (someone else wrote it: crossed out)
 *           'dup'     (you wrote it twice: the repeat is crossed out)
 *           'open'    (nobody else wrote it: goes to the vote)
 */
export function compareLists(players) {
    const board = players.map((p) => ({ seat: p.seat, name: p.name, items: [] }));
    const all = [];

    board.forEach((entry, pi) => {
        const seen = [];
        (players[pi].list || []).forEach((raw, index) => {
            const text = typeof raw === 'string' ? raw.trim() : '';
            const key = normalizeItem(text);
            if (!key) return;

            const item = { id: `${entry.seat}-${index}`, text, key, plain: plainKey(text), status: 'open', matchedWith: [] };
            if (seen.some((other) => isSameAnswer(other, item))) item.status = 'dup';
            else seen.push(item);

            entry.items.push(item);
            all.push({ seat: entry.seat, item });
        });
    });

    all.forEach(({ seat, item }) => {
        if (item.status === 'dup') return;
        const matches = all.filter((o) => o.seat !== seat && o.item.status !== 'dup' && isSameAnswer(item, o.item));
        if (matches.length > 0) {
            item.status = 'matched';
            const names = matches.map((o) => board.find((b) => b.seat === o.seat)?.name).filter(Boolean);
            item.matchedWith = [...new Set(names)];
        }
    });

    // The keys were only needed for comparing
    board.forEach((entry) => entry.items.forEach((item) => { delete item.key; delete item.plain; }));
    return board;
}

/**
 * Counts the votes on every answer that wasn't crossed out.
 * Each voter's ballot lists the answers they said "doesn't count"; everything else is a "counts".
 * An answer is thrown out only when MORE than half of the other players voted against it (a tie keeps it).
 * @param {Array} board            from compareLists
 * @param {Array<{seat:number, ballot:string[]}>} voters   everyone who could vote this round
 */
export function resolveVotes(board, voters) {
    board.forEach((entry) => {
        entry.items.forEach((item) => {
            if (item.status !== 'open') {
                item.counts = false;
                return;
            }
            const eligible = voters.filter((v) => v.seat !== entry.seat);
            const noVotes = eligible.filter((v) => (v.ballot || []).includes(item.id)).length;
            item.noVotes = noVotes;
            item.voterCount = eligible.length;
            item.counts = noVotes * 2 <= eligible.length;
        });
    });
    return board;
}
