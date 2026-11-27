// 🧶 Word Weave's rules: the word list, the letters, making a grid, finding every word in it, and the score.
//
// A word is woven through letters that touch (across, up and down, or corner to corner), using each letter once.
// It needs at least MIN_LENGTH letters and has to be in the word list: ENABLE, a public-domain list of about
// 173,000 words (db/words/enable1.txt, see the README there). It's read once, when the server starts.
// Our letters have no Q, so words with a Q are left out of the list, and so are a few slurs and crude words.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const WORD_FILE = fileURLToPath(new URL('../db/words/enable1.txt', import.meta.url));

export const MIN_LENGTH = 3;
export const SIZES = [4, 5];

// ---------- 🚫 Words that never count (and never show on the TV) ----------
// Written in ROT13 so the file reads cleanly: STEMS block every word that starts with them, WORDS just themselves.
const rot13 = (text) => text.replace(/[a-z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 97 + 13) % 26) + 97));
const BLOCKED_STEMS = 'shpx fuvg phag avtt xvxr snttbg jrgonpx pbpxfhpx zbgureshpx juber fyhg ovgpu qvyqb gjng'
    .split(' ').map(rot13);
const BLOCKED_WORDS = new Set((
    'snt sntf snttl qlxr qlxrf qlxrl fcvp fcvpx fcvpf fcvpxf puvax puvaxf tbbx tbbxf pbba pbbaf jbc jbcf qntb qntbf '
    + 'qntbrf tlc tlcf tlccrq tlccvat tlccre tlccref ergneq ergneqf fdhnj fdhnjf erqfxva erqfxvaf ubaxl ubaxvr ubaxvrf '
    + 'ubzb ubzbf fcnm encr encrf encrq encvat encvfg encvfgf anmv anmvf wvfz wvfzf fcbbx fcbbxf'
).split(' ').map(rot13));
export const isBlocked = (word) => BLOCKED_WORDS.has(word) || BLOCKED_STEMS.some((stem) => word.startsWith(stem));

// ---------- 📖 The word list ----------
let WORDS = null;      // sorted, for "does any word start with this?"
let WORD_SET = null;   // for "is this a word?"

export function loadWords() {
    if (WORDS) return WORDS.length;
    const started = Date.now();
    const words = readFileSync(WORD_FILE, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter((word) => word.length >= MIN_LENGTH && /^[a-z]+$/.test(word) && !word.includes('q') && !isBlocked(word));
    words.sort();
    WORDS = words;
    WORD_SET = new Set(words);
    console.log(`[Word Weave] ${words.length} words loaded in ${Date.now() - started} ms.`);
    return words.length;
}

/** Is this (lowercase) word in the list? */
export const isWord = (word) => {
    loadWords();
    return WORD_SET.has(word);
};

/** Does any word in the list start with this? (A binary search over the sorted list) */
const hasPrefix = (prefix) => {
    let lo = 0;
    let hi = WORDS.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (WORDS[mid] < prefix) lo = mid + 1;
        else hi = mid;
    }
    return lo < WORDS.length && WORDS[lo].startsWith(prefix);
};

// ---------- 🔤 The letters ----------
// Word Weave's own letter set: no Q, and each letter drawn by how often it turns up in everyday words.
// A grid gets a fair share of vowels, no letter more than twice (three times on 5 × 5), and at most one
// hard letter (J, K, V, X or Z; two on 5 × 5).
const VOWEL_WEIGHTS = { E: 12, A: 9, I: 8, O: 8, U: 4 };
const CONSONANT_WEIGHTS = {
    S: 7, T: 7, R: 7, N: 7, L: 5, D: 4, C: 4, H: 3, M: 3, P: 3, G: 3, B: 2, F: 2, Y: 2, W: 2,
    K: 1.2, V: 1, X: 0.5, Z: 0.5, J: 0.4,
};
const HARD = new Set(['J', 'K', 'V', 'X', 'Z']);
const VOWEL_SHARE = { 4: [5, 7], 5: [8, 11] };     // how many vowels a grid gets, fewest to most
const MAX_SAME = { 4: 2, 5: 3 };
const MAX_HARD = { 4: 1, 5: 2 };
// A grid with fewer words than this is drawn again (the most words of a few tries wins if none get there)
const ENOUGH_WORDS = { 4: 45, 5: 110 };
const TRIES = 16;

const pick = (weights, allowed, rng) => {
    const letters = Object.keys(weights).filter(allowed);
    const total = letters.reduce((sum, l) => sum + weights[l], 0);
    let roll = rng() * total;
    for (const letter of letters) {
        roll -= weights[letter];
        if (roll < 0) return letter;
    }
    return letters[letters.length - 1];
};

/** A size × size grid of random letters (row by row, as one list) */
export function drawLetters(size, rng = Math.random) {
    const [fewest, most] = VOWEL_SHARE[size];
    const vowels = fewest + Math.floor(rng() * (most - fewest + 1));
    const counts = {};
    let hard = 0;
    const allowed = (letter) => (counts[letter] || 0) < MAX_SAME[size] && (!HARD.has(letter) || hard < MAX_HARD[size]);
    const letters = [];
    for (let i = 0; i < size * size; i++) {
        const letter = pick(i < vowels ? VOWEL_WEIGHTS : CONSONANT_WEIGHTS, allowed, rng);
        counts[letter] = (counts[letter] || 0) + 1;
        if (HARD.has(letter)) hard += 1;
        letters.push(letter);
    }
    // Shuffle them into place
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters;
}

// Each tile's neighbours, for each size
const NEIGHBOURS = {};
const neighboursFor = (size) => {
    if (NEIGHBOURS[size]) return NEIGHBOURS[size];
    const list = [];
    for (let i = 0; i < size * size; i++) {
        const row = Math.floor(i / size);
        const col = i % size;
        const near = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = row + dr;
                const c = col + dc;
                if ((dr || dc) && r >= 0 && r < size && c >= 0 && c < size) near.push(r * size + c);
            }
        }
        list.push(near);
    }
    NEIGHBOURS[size] = list;
    return list;
};

/** Do these two tiles touch? */
export const touches = (size, a, b) => neighboursFor(size)[a]?.includes(b) || false;

/** Every word in the list that can be woven on this grid, each with one way to weave it (tile numbers) */
export function solveGrid(letters) {
    loadWords();
    const size = Math.round(Math.sqrt(letters.length));
    const near = neighboursFor(size);
    const lower = letters.map((l) => l.toLowerCase());
    const found = new Map();
    const used = new Array(letters.length).fill(false);
    const path = [];
    const walk = (tile, sofar) => {
        const word = sofar + lower[tile];
        if (!hasPrefix(word)) return;
        used[tile] = true;
        path.push(tile);
        if (word.length >= MIN_LENGTH && WORD_SET.has(word) && !found.has(word)) found.set(word, [...path]);
        near[tile].forEach((next) => { if (!used[next]) walk(next, word); });
        path.pop();
        used[tile] = false;
    };
    for (let tile = 0; tile < letters.length; tile++) walk(tile, '');
    return found;
}

/** A round's grid: drawn a few times if need be, so there's always plenty to find */
export function makeGrid(size, rng = Math.random) {
    let best = null;
    for (let i = 0; i < TRIES; i++) {
        const letters = drawLetters(size, rng);
        const solution = solveGrid(letters);
        if (!best || solution.size > best.solution.size) best = { letters, solution };
        if (solution.size >= ENOUGH_WORDS[size]) break;
    }
    return best;
}

/** One way to weave `word` (lowercase) on the grid, as tile numbers, or null if it can't be done */
export function findPath(letters, word) {
    const size = Math.round(Math.sqrt(letters.length));
    const near = neighboursFor(size);
    const lower = letters.map((l) => l.toLowerCase());
    const used = new Array(letters.length).fill(false);
    const path = [];
    const walk = (tile, at) => {
        if (used[tile] || lower[tile] !== word[at]) return false;
        used[tile] = true;
        path.push(tile);
        if (at === word.length - 1 || near[tile].some((next) => walk(next, at + 1))) return true;
        path.pop();
        used[tile] = false;
        return false;
    };
    for (let tile = 0; tile < letters.length; tile++) if (walk(tile, 0)) return path;
    return null;
}

/** What someone typed or traced, as a lowercase word (or '' if it's nothing) */
export const cleanWord = (text) => String(text || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 25);

// ---------- 🏆 Scoring ----------
// Longer words are worth more, growing like the Fibonacci numbers: 3 letters 1, 4 letters 2, 5 letters 3,
// 6 letters 5, 7 letters 8, and 8 or more 13. A word that two or more players found is crossed out for all of them.
export const POINTS_TABLE = [[3, 1], [4, 2], [5, 3], [6, 5], [7, 8], [8, 13]];
export const pointsFor = (word) => {
    if (word.length >= 8) return 13;
    return POINTS_TABLE.find(([length]) => length === word.length)?.[1] || 0;
};

const MISSED_SHOWN = 8;

/**
 * The round's score.
 *   entries:  [{ key, words: ['cat', ...] }], one for each player (their words, in the order they found them)
 *   letters, solution: the grid and every word in it (from makeGrid)
 * Gives each player's words (crossed out or not, and their points), the words that were crossed out and who
 * found them, the best word anyone kept, and the longest words nobody found.
 */
export function scoreRound(entries, letters, solution, rng = Math.random) {
    const finders = new Map();   // word -> keys of the players who found it
    entries.forEach(({ key, words }) => {
        new Set(words).forEach((word) => {
            if (!finders.has(word)) finders.set(word, []);
            finders.get(word).push(key);
        });
    });
    const pathOf = (word) => solution.get(word) || findPath(letters, word);

    const players = entries.map(({ key, words }) => {
        const scored = [...new Set(words)].map((word) => {
            const cancelled = finders.get(word).length > 1;
            return { word, points: cancelled ? 0 : pointsFor(word), cancelled, path: pathOf(word) };
        });
        scored.sort((a, b) => b.points - a.points || b.word.length - a.word.length || a.word.localeCompare(b.word));
        return {
            key,
            words: scored,
            points: scored.reduce((sum, w) => sum + w.points, 0),
            kept: scored.filter((w) => !w.cancelled).length,
        };
    });

    const shared = [...finders.entries()]
        .filter(([, keys]) => keys.length > 1)
        .map(([word, keys]) => ({ word, by: keys, path: pathOf(word) }))
        .sort((a, b) => b.word.length - a.word.length || b.by.length - a.by.length || a.word.localeCompare(b.word));

    let best = null;
    players.forEach((p) => p.words.forEach((w) => {
        if (w.cancelled) return;
        if (!best || w.word.length > best.word.length || (w.word.length === best.word.length && w.word < best.word)) {
            best = { word: w.word, key: p.key, points: w.points, path: w.path };
        }
    }));

    // The longest words nobody found (ties in a random order, so it isn't always the A words)
    const missed = [...solution.keys()]
        .filter((word) => !finders.has(word))
        .map((word) => ({ word, roll: rng() }))
        .sort((a, b) => b.word.length - a.word.length || a.roll - b.roll)
        .slice(0, MISSED_SHOWN)
        .map(({ word }) => ({ word, points: pointsFor(word), path: solution.get(word) }));

    return { players, shared, best, missed, possible: solution.size, foundByAnyone: finders.size };
}
