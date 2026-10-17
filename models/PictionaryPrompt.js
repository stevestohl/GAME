import mongoose from "mongoose";

// ✏️ Something to draw in Temple Mix Up's Pictionary rounds (collection `pictionaryprompts`).
// Add more with `npm run pictionary:add <file.json>`, or straight in MongoDB Compass / Atlas.
// Prompts cycle like the memes: the least-used ones come up first.
//   - hide a prompt:  set `active` to false
//   - `alsoAccept`:   other answers that count as right, e.g. "pizza" for "slice of pizza"
const PictionaryPromptSchema = new mongoose.Schema({
    text: { type: String, required: [true, 'Prompt text required'], trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    alsoAccept: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    timesUsed: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
}, {
    collection: 'pictionaryprompts',
    timestamps: true,
});

export default mongoose.model('PictionaryPrompt', PictionaryPromptSchema);
