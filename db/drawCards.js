import Prompt2Model from "../models/Prompt2.js";
import Temple_Trivia from "../models/Temple_Trivia.js";

// Cleans up a deck name coming from the client; anything unusable becomes 'core'
export const normalizeExpansion = (expansion) => {
    return typeof expansion === 'string' && expansion.trim()
        ? expansion.trim().toLowerCase()
        : 'core';
};

// Draws random cards from a deck (expansion): that deck's cards first,
// then tops up from the core deck if it runs short (small or not yet loaded).
export const drawCards = async (type, expansion, size) => {
    // Core also matches older cards saved without an expansion field
    const coreMatch = { $in: ['core', null] };
    const deck = normalizeExpansion(expansion);
    const isCore = deck === 'core';

    const cards = await Prompt2Model.aggregate([
        { $match: { type, expansion: isCore ? coreMatch : deck } },
        { $sample: { size } }
    ]);

    if (isCore || cards.length >= size) return cards;

    const extras = await Prompt2Model.aggregate([
        { $match: { type, expansion: coreMatch } },
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
export const drawTriviaQuestions = async (expansion, size) => {
    // Core also matches older questions saved without an expansion field
    const coreMatch = { $in: ['core', null] };
    const deck = normalizeExpansion(expansion);
    const isCore = deck === 'core';

    const questions = await Temple_Trivia.aggregate([
        { $match: { expansion: isCore ? coreMatch : deck } },
        { $sample: { size } }
    ]);

    if (isCore || questions.length >= size) return questions;

    const extras = await Temple_Trivia.aggregate([
        { $match: { expansion: coreMatch } },
        { $sample: { size: size - questions.length } }
    ]);
    return [...questions, ...extras];
};
