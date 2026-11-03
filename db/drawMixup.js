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

export const pickMemes = (count) => pickLeastUsed(MixupMeme, count);

// `level`: 'easy', 'medium' or 'hard' tries that level first, then borrows from the closest one. 'mixed' deals evenly
// from all three (or least-used-first would hand a game nothing but whichever level was added most recently).
export const pickPictionaryPrompts = async (count, level = 'mixed') => {
    const clean = normalizeLevel(level);
    const prompts = [];
    const take = async (difficulty, howMany) => {
        if (howMany <= 0) return;
        prompts.push(...await pickLeastUsed(PictionaryPrompt, howMany, prompts.map((p) => p._id), { difficulty }));
    };
    if (clean === 'mixed') {
        const levels = ['easy', 'medium', 'hard'];
        for (let i = 0; i < levels.length; i++) await take(levels[i], Math.ceil((count - i) / levels.length));
    }
    for (const difficulty of LEVEL_ORDER[clean] || LEVEL_ORDER.medium) await take(difficulty, count - prompts.length);
    return prompts.sort(() => Math.random() - 0.5);
};

// Marked as used when the round is actually played (a game that ends early doesn't use up the rest)
const markUsed = (Model, id) => Model.updateOne({ _id: id }, { $inc: { timesUsed: 1 }, $set: { lastUsedAt: new Date() } })
    .catch((err) => console.error('[Mix Up] Could not mark as used:', err.message));

export const markMemeUsed = (id) => markUsed(MixupMeme, id);
export const markPromptUsed = (id) => markUsed(PictionaryPrompt, id);
