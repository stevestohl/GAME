import ReshuffledCard from "../models/ReshuffledCard.js";
import Temple_Trivia from "../models/Temple_Trivia.js";

// Cleans up a deck name coming from the client; anything unusable becomes 'core'
// 🎚️ Trivia levels: which to try, in order, when a level runs short ('mixed' takes anything)
const LEVEL_ORDER = {
    easy: ['easy', 'medium', 'hard'],
    medium: ['medium', 'easy', 'hard'],
    hard: ['hard', 'medium', 'easy'],
};
export const normalizeLevel = (level) => (Object.hasOwn(LEVEL_ORDER, level) ? level : 'mixed');

export const normalizeExpansion = (expansion) => {
    return typeof expansion === 'string' && expansion.trim()
        ? expansion.trim().toLowerCase()
        : 'core';
};

// Draws random Prompt 2 cards from a deck (expansion): that deck's cards first,
// then tops up from the core deck if it runs short (small or not yet loaded).
// Prompt 2 deals from the same cards as Couch Cast (the couchcast_reshuffled database).
// excludeIds: cards that must not come up (e.g. ones already sitting in someone's hand).
export const drawCards = async (type, expansion, size, excludeIds = []) => {
    // Core also matches older cards saved without an expansion field
    const coreMatch = { $in: ['core', null] };
    const deck = normalizeExpansion(expansion);
    const isCore = deck === 'core';
    const notThese = excludeIds.length ? { _id: { $nin: excludeIds } } : {};

    const cards = await ReshuffledCard.aggregate([
        { $match: { type, active: { $ne: false }, expansion: isCore ? coreMatch : deck, ...notThese } },
        { $sample: { size } }
    ]);

    if (isCore || cards.length >= size) return cards;

    const extras = await ReshuffledCard.aggregate([
        { $match: { type, active: { $ne: false }, expansion: coreMatch, ...notThese, _id: { $nin: [...excludeIds, ...cards.map((c) => c._id)] } } },
        { $sample: { size: size - cards.length } }
    ]);
    return [...cards, ...extras];
};

// How many rounds (or trivia questions) a game runs for.
// Anything missing or out of range falls back to the default.
export const normalizeRounds = (rounds, fallback = 3, max = 20) => {
    const count = Number(rounds);
    return Number.isInteger(count) && count >= 1 && count <= max ? count : fallback;
};

// Draws random trivia questions from a deck (expansion): that deck's questions first,
// then tops up from core if it doesn't have enough.
// `level`: 'easy', 'medium' or 'hard' tries that level first, then borrows from the closest level in the same
// deck, then from core the same way. 'mixed' (the default) takes any level.
export const drawTriviaQuestions = async (expansion, size, level = 'mixed') => {
    // Core also matches older questions saved without an expansion field
    const coreMatch = { $in: ['core', null] };
    const deck = normalizeExpansion(expansion);
    const isCore = deck === 'core';
    const decks = isCore ? [coreMatch] : [deck, coreMatch];
    const levels = LEVEL_ORDER[normalizeLevel(level)] || [null];

    const questions = [];
    for (const expansionMatch of decks) {
        for (const wanted of levels) {
            if (questions.length >= size) break;
            // (Older questions aren't tidy: "Easy", "easy, like Ricardo")
            const difficulty = wanted ? { difficulty: { $regex: `^${wanted}`, $options: 'i' } } : {};
            const found = await Temple_Trivia.aggregate([
                { $match: { expansion: expansionMatch, ...difficulty, _id: { $nin: questions.map((q) => q._id) } } },
                { $sample: { size: size - questions.length } },
            ]);
            questions.push(...found);
        }
    }

    // Any borrowed questions shouldn't all come last
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    return questions;
};
