import MixupMeme from "../models/MixupMeme.js";
import PictionaryPrompt from "../models/PictionaryPrompt.js";
import { LEVEL_ORDER, normalizeLevel } from "./drawCards.js";

// 🎲 Temple Mix Up's memes and Pictionary prompts cycle: the least-used ones come up first
// (ties broken at random), so every one gets played before any comes back around.
const pickLeastUsed = (Model, count, excludeIds = [], match = {}) => Model.aggregate([
    { $match: { active: { $ne: false }, ...match, ...(excludeIds.length ? { _id: { $nin: excludeIds } } : {}) } },
    { $addFields: { shuffle: { $rand: {} } } },
    { $sort: { timesUsed: 1, shuffle: 1 } },
    { $limit: count },
    { $project: { shuffle: 0 } },
]);

// One deck's content ('core' also matches anything saved without a deck)
const inDeck = (deck) => ({ expansion: deck === 'core' ? { $in: ['core', null] } : deck });

// A deck too small for the game is topped up from core, so a round never comes up empty
export const pickMemes = async (count, deck = 'core') => {
    const memes = await pickLeastUsed(MixupMeme, count, [], inDeck(deck));
    if (memes.length >= count || deck === 'core') return memes;
    return [...memes, ...await pickLeastUsed(MixupMeme, count - memes.length, [], inDeck('core'))];
};

// `level`: 'easy', 'medium' or 'hard' tries that level first, then borrows from the closest one. 'mixed' deals evenly
// from all three (or least-used-first would hand a game nothing but whichever level was added most recently).
// `deck`: its prompts come first, topped up from core if it's too small.
export const pickPictionaryPrompts = async (count, level = 'mixed', deck = 'core') => {
    const clean = normalizeLevel(level);
    const prompts = [];
    const dealFrom = async (from, wanted) => {
        const take = async (difficulty, howMany) => {
            if (howMany <= 0) return;
            prompts.push(...await pickLeastUsed(PictionaryPrompt, howMany, prompts.map((p) => p._id), { difficulty, ...inDeck(from) }));
        };
        if (clean === 'mixed') {
            const levels = ['easy', 'medium', 'hard'];
            for (let i = 0; i < levels.length; i++) await take(levels[i], Math.ceil((wanted - i) / levels.length));
        }
        for (const difficulty of LEVEL_ORDER[clean] || LEVEL_ORDER.medium) await take(difficulty, count - prompts.length);
    };
    await dealFrom(deck, count);
    if (prompts.length < count && deck !== 'core') await dealFrom('core', count - prompts.length);
    return prompts.sort(() => Math.random() - 0.5);
};

// Marked as used when the round is actually played (a game that ends early doesn't use up the rest)
const markUsed = (Model, id) => Model.updateOne({ _id: id }, { $inc: { timesUsed: 1 }, $set: { lastUsedAt: new Date() } })
    .catch((err) => console.error('[Mix Up] Could not mark as used:', err.message));

export const markMemeUsed = (id) => markUsed(MixupMeme, id);
export const markPromptUsed = (id) => markUsed(PictionaryPrompt, id);
