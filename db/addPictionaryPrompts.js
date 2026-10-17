// ✏️ Adds Pictionary prompts for Temple Mix Up (collection `pictionaryprompts`).
//
//   npm run pictionary:add path/to/prompts.json
//
// The file is a list:
//   [
//     { "text": "pizza", "difficulty": "easy" },
//     { "text": "lighthouse", "difficulty": "medium", "alsoAccept": ["light house"] }
//   ]
// Safe to run again: a prompt already saved (same text, any capitals) is skipped.
import "dotenv/config";
import fs from "fs";
import mongoose from "mongoose";
import PictionaryPrompt from "../models/PictionaryPrompt.js";

const run = async () => {
    const file = process.argv[2];
    if (!file) throw new Error('Which file? Usage: npm run pictionary:add path/to/prompts.json');
    const entries = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(entries)) throw new Error('The file should be a list: [{ "text": "...", "difficulty": "easy" }]');

    await mongoose.connect(process.env.DB || process.env.DATABASE_ACCESS);

    const have = new Set((await PictionaryPrompt.find({}, { text: 1 }).lean()).map((p) => p.text.toLowerCase()));
    const fresh = [];
    entries.forEach(({ text, difficulty = 'easy', alsoAccept = [] }) => {
        const clean = String(text || '').trim();
        if (!clean || have.has(clean.toLowerCase())) return;
        have.add(clean.toLowerCase());
        fresh.push({ text: clean, difficulty, alsoAccept });
    });
    if (fresh.length) await PictionaryPrompt.insertMany(fresh);

    const counts = await PictionaryPrompt.aggregate([{ $match: { active: { $ne: false } } }, { $group: { _id: '$difficulty', n: { $sum: 1 } } }]);
    console.log(`Added ${fresh.length} prompts (${entries.length - fresh.length} already there). In play: ${counts.map((c) => `${c.n} ${c._id}`).join(', ')}.`);
    await mongoose.disconnect();
};

run().catch(async (err) => {
    console.error('Adding prompts failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
