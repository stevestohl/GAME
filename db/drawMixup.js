import MixupMeme from "../models/MixupMeme.js";
import PictionaryPrompt from "../models/PictionaryPrompt.js";

// 🎲 Temple Mix Up's memes and Pictionary prompts cycle: the least-used ones come up first
// (ties broken at random), so every one gets played before any comes back around.
const pickLeastUsed = (Model, count, excludeIds = []) => Model.aggregate([
    { $match: { active: { $ne: false }, ...(excludeIds.length ? { _id: { $nin: excludeIds } } : {}) } },
    { $addFields: { shuffle: { $rand: {} } } },
    { $sort: { timesUsed: 1, shuffle: 1 } },
    { $limit: count },
    { $project: { shuffle: 0 } },
]);

export const pickMemes = (count) => pickLeastUsed(MixupMeme, count);
export const pickPictionaryPrompts = (count) => pickLeastUsed(PictionaryPrompt, count);

// Marked as used when the round is actually played (a game that ends early doesn't use up the rest)
const markUsed = (Model, id) => Model.updateOne({ _id: id }, { $inc: { timesUsed: 1 }, $set: { lastUsedAt: new Date() } })
    .catch((err) => console.error('[Mix Up] Could not mark as used:', err.message));

export const markMemeUsed = (id) => markUsed(MixupMeme, id);
export const markPromptUsed = (id) => markUsed(PictionaryPrompt, id);
