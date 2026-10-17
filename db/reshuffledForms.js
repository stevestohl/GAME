// 🔀 Couch Cast Re-Shuffled: works out how a response card reads in each kind of blank.
// Shared by the seed script (npm run seed:reshuffled) and the alternates import
// (npm run reshuffled:alternates), so a card and its alternates are tagged the same way.
//   "Taking over the world." -> kinds ['action'], forms.verb "take over the world"
//   "A fragile ego."         -> kinds ['thing'],  forms.bare "Fragile Ego"
import nlp from "compromise";
import ReshuffledVerbFix from "../models/ReshuffledVerbFix.js";

// -ing word -> base verb, from the `verbfixes` collection (call loadVerbFixes() once first)
let VERB_FIXES = {};

export const loadVerbFixes = async () => {
    VERB_FIXES = Object.fromEntries((await ReshuffledVerbFix.find({}).lean()).map((fix) => [fix.ing, fix.base]));
    return Object.keys(VERB_FIXES).length;
};

const ARTICLES = /^(a|an|the|some|your|my)\s+/i;
// Drops the card's full stop, even inside a closing quote: 'Calling your boss "Mom."' -> '..."Mom"'
const stripEnd = (text) => text.trim().replace(/[.!]+(["'”’]?)$/, '$1');

// Words ending in -ing that start a thing, not an action ("Wedding crashers", "Resting Bitch Face")
const ING_NOUNS = /^(blood-curdling|spine-chilling|bone-chilling|mind-blowing|self-deprecating|impending|crippling|resting|glowing|boring|amazing|annoying|flaming|blinding|deafening|nothing|something|anything|everything|morning|evening|ceiling|wedding|building|clothing|thing|things|king|kings|ring|rings|string|sibling|siblings|darling|pudding|stuffing|frosting|icing|bedding|wing|wings|spring|swing|sing|ding|bling|viking|vikings|duckling|dumpling|dumplings|lightning|earring|earrings|offspring|herring|feelings|painting|paintings|meeting|meetings|building|ending|beginning|ceiling|awning|lasagna)$/i;

// The first word (after any "Accidentally", "Literally"...) that ends in -ing, or -1
const leadingGerund = (words) => {
    for (let i = 0; i < Math.min(words.length, 3); i++) {
        const word = words[i].replace(/[^a-z-]/gi, '');
        if (VERB_FIXES[word.toLowerCase()]) return i;
        if (/[a-z]{2,}ing$/i.test(word) && !ING_NOUNS.test(word)) return i;
        const tags = nlp(word).terms().json()[0]?.terms[0]?.tags || [];
        if (!tags.includes('Adverb')) return -1;
    }
    return -1;
};

// -ing words that couldn't be turned into a base verb: add them to the `verbfixes` collection
export const unconverted = new Set();

const toBase = (word) => {
    const lower = word.toLowerCase();
    if (VERB_FIXES[lower]) return VERB_FIXES[lower];
    // "binge-watching" -> "binge-watch": convert the last part
    const dash = lower.lastIndexOf('-');
    if (dash > 0) return lower.slice(0, dash + 1) + toBase(lower.slice(dash + 1));
    const base = nlp(lower).verbs().toInfinitive().text();
    if (base) return base;
    unconverted.add(lower);
    return lower;
};

// "Taking over the world." -> "take over the world"
// A second action joined by "and"/"or"/"then" changes too: "...and taking notes" -> "...and take notes"
const toVerbForm = (words, i) => {
    const out = [...words.slice(0, i).map((w) => w.toLowerCase()), toBase(words[i]), ...words.slice(i + 1)];
    for (let j = i + 1; j < out.length - 1; j++) {
        if (/^(and|or|then)$/i.test(out[j]) && /^[a-z-]+ing$/i.test(out[j + 1]) && !/^(nothing|something|anything|everything|morning|evening|ceiling|wedding|building|clothing)$/i.test(out[j + 1])) {
            out[j + 1] = toBase(out[j + 1]);
        }
    }
    return out.join(' ');
};

// "A fragile ego." -> "Fragile Ego", "A drawer of cables" -> "Drawer of Cables"
const SMALL_WORDS = /^(a|an|the|of|with|and|or|in|on|at|to|for|from|by|as|but|nor)$/i;
const toBareForm = (text) => stripEnd(text).replace(ARTICLES, '')
    .split(' ')
    .map((w, i) => (!w ? w : i > 0 && SMALL_WORDS.test(w) ? w.toLowerCase() : w.replace(/[a-z]/i, (ch) => ch.toUpperCase())))
    .join(' ');

// The automatic tags for a response card or alternate (prompts are tagged by hand, in MongoDB)
export const tagResponse = (card) => {
    const words = stripEnd(card.text).split(/\s+/);
    const i = leadingGerund(words);
    if (i >= 0) return { kinds: ['action'], forms: { verb: toVerbForm(words, i) } };
    return { kinds: ['thing'], forms: { bare: toBareForm(card.text) } };
};
