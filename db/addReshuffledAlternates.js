// 🔀 Adds funny alternates to Couch Cast Re-Shuffled response cards (couchcast_reshuffled.cards).
//
//   npm run reshuffled:alternates path/to/alternates.json
//
// The file is a list of cards, matched by their exact text:
//   [
//     { "card": "Licking the vending machine.",
//       "alternates": ["Licking the vending machine for good luck.", "Licking the vending machine and getting stuck."] }
//   ]
// Add "replace": true to a card's entry to swap out its alternates instead of adding to them:
//     { "card": "...", "alternates": ["...", "..."], "replace": true }
// Each alternate should be the same kind of answer as its card (an action for an action card,
// a thing for a thing card) so it still fits the same prompts; the script warns when it isn't.
// It works out each alternate's forms ("to ___" and "Captain ___" versions) the same way the
// seed does. Safe to run again: alternates a card already has are skipped, never doubled up.
import "dotenv/config";
import fs from "fs";
import mongoose from "mongoose";
import ReshuffledCard from "../models/ReshuffledCard.js";
import { loadVerbFixes, tagResponse, unconverted } from "./reshuffledForms.js";

const run = async () => {
    const file = process.argv[2];
    if (!file) throw new Error('Which file? Usage: npm run reshuffled:alternates path/to/alternates.json');
    const entries = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(entries)) throw new Error('The file should be a list: [{ "card": "...", "alternates": ["...", "..."] }]');

    await mongoose.connect(process.env.DB || process.env.DATABASE_ACCESS);
    await loadVerbFixes();

    let added = 0;
    let skipped = 0;
    const missing = [];
    const kindWarnings = [];

    for (const { card: cardText, alternates = [], replace = false } of entries) {
        const cards = await ReshuffledCard.find({ type: 'response', text: String(cardText).trim() });
        if (!cards.length) { missing.push(cardText); continue; }

        for (const card of cards) {
            if (replace) card.alternates = [];
            const have = new Set((card.alternates || []).map((a) => a.text.toLowerCase()));
            for (const raw of alternates) {
                const text = String(raw).trim();
                if (!text || have.has(text.toLowerCase())) { skipped++; continue; }

                const { kinds, forms } = tagResponse({ text });
                if (kinds[0] !== (card.kinds || [])[0]) kindWarnings.push(`"${text}" reads as ${kinds[0]}, but "${card.text}" is ${(card.kinds || [])[0]}`);

                card.alternates.push({ text, forms });
                have.add(text.toLowerCase());
                added++;
            }
            await card.save();
        }
    }

    console.log(`Added ${added} alternates (${skipped} already there).`);
    if (missing.length) console.log(`\nNo card with this exact text (${missing.length}):\n  ${missing.join('\n  ')}`);
    if (kindWarnings.length) console.log(`\nWorth a look, a different kind of answer than its card (${kindWarnings.length}):\n  ${kindWarnings.join('\n  ')}`);

    if (unconverted.size) {
        console.log(`\n⚠️  Couldn't make a "to ___" verb from: ${[...unconverted].join(', ')}`);
        console.log('   Add each to the verbfixes collection, e.g. { ing: "chewing", base: "chew" }, then run this again.\n');
    }

    const withAlternates = await ReshuffledCard.countDocuments({ type: 'response', 'alternates.1': { $exists: true } });
    const responses = await ReshuffledCard.countDocuments({ type: 'response' });
    console.log(`\n${withAlternates} of ${responses} response cards now have 2 or more alternates.`);

    await mongoose.disconnect();
};

run().catch(async (err) => {
    console.error('Adding alternates failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
