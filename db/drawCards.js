import Prompt2Model from "../models/Prompt2.js";

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
