import ReshuffledCard from "../models/ReshuffledCard.js";
import { normalizeExpansion } from "./drawCards.js";

// 🔀 Draws random Couch Cast Re-Shuffled cards (the couchcast_reshuffled database), the same way
// drawCards does for Prompt 2: the chosen deck first, then topped up from core if it runs short.
//   excludeIds: cards that must not come up (already in a hand, or already seen this game)
//   match:      extra conditions, e.g. { kinds: 'action' } for action cards only
export const drawReshuffled = async (type, expansion, size, excludeIds = [], match = {}) => {
    if (size <= 0) return [];
    const coreMatch = { $in: ['core', null] };
    const deck = normalizeExpansion(expansion);
    const isCore = deck === 'core';
    const base = { type, active: { $ne: false }, ...match };
    const notThese = excludeIds.length ? { _id: { $nin: excludeIds } } : {};

    const cards = await ReshuffledCard.aggregate([
        { $match: { ...base, expansion: isCore ? coreMatch : deck, ...notThese } },
        { $sample: { size } },
    ]);

    if (isCore || cards.length >= size) return cards;

    const extras = await ReshuffledCard.aggregate([
        { $match: { ...base, expansion: coreMatch, _id: { $nin: [...excludeIds, ...cards.map((c) => c._id)] } } },
        { $sample: { size: size - cards.length } },
    ]);
    return [...cards, ...extras];
};
