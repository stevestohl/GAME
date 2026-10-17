// 🔀 Fills the Couch Cast Re-Shuffled deck (database `couchcast_reshuffled`, collection `cards`)
// from the Prompt 2 cards, tagging each one as it goes:
//   prompts   -> `slot`: new prompts start as 'any'; after that the slot is yours to set in MongoDB
//                (the seed never changes a prompt's slot once it's in the deck)
//   responses -> `kinds`: 'action' if it starts with an -ing verb ("Licking the vending machine"),
//                otherwise 'thing' ("A haunted toaster"), worked out with compromise.js
//                `forms.verb`: the "to ___" version of an action ("lick the vending machine"),
//                using the `verbfixes` collection for words compromise.js gets wrong ("trying" -> "try")
//                `forms.bare`: a thing without its "a/an/the", in Title Case ("Haunted Toaster")
//
// Safe to run again: it only reads Prompt 2 (never changes it), adds new cards, and refreshes
// the tags on cards (and their alternates) nobody has hand-checked yet. It never removes alternates.
// Cards marked `reviewed: true` are left alone.
//
//   npm run seed:reshuffled
//
// At the end it prints how many cards landed in each group.
import "dotenv/config";
import mongoose from "mongoose";
import Prompt2Model from "../models/Prompt2.js";
import ReshuffledCard from "../models/ReshuffledCard.js";
import { loadVerbFixes, tagResponse, unconverted } from "./reshuffledForms.js";

const seed = async () => {
    const uri = process.env.DB || process.env.DATABASE_ACCESS;
    if (!uri) throw new Error('No database address: set DB in .env');
    await mongoose.connect(uri);

    console.log(`Loaded ${await loadVerbFixes()} verb fixes.`);

    const source = await Prompt2Model.find({}).lean();
    console.log(`Read ${source.length} Prompt 2 cards.`);

    const reviewed = new Set((await ReshuffledCard.find({ reviewed: true }, { sourceId: 1 }).lean())
        .map((c) => String(c.sourceId)));

    const ops = source
        .filter((card) => !reviewed.has(String(card._id)))
        .map((card) => ({
            updateOne: {
                filter: { sourceId: card._id },
                update: card.type === 'prompt'
                    ? {
                        // A prompt's slot is set by hand: only a brand-new prompt gets the 'any' default
                        $set: { text: card.text, type: card.type, expansion: card.expansion || 'core' },
                        $setOnInsert: { sourceId: card._id, slot: 'any', alternates: [], reviewed: false, active: true },
                    }
                    : {
                        $set: { text: card.text, type: card.type, expansion: card.expansion || 'core', ...tagResponse(card) },
                        $setOnInsert: { sourceId: card._id, alternates: [], reviewed: false, active: true },
                    },
                upsert: true,
            },
        }));

    if (ops.length) {
        const result = await ReshuffledCard.bulkWrite(ops);
        console.log(`Added ${result.upsertedCount}, refreshed ${result.modifiedCount}, skipped ${reviewed.size} hand-checked.`);
    }

    // Alternates follow the same rules: refresh their "to ___" / "Captain ___" forms too
    let refreshedAlternates = 0;
    for (const card of await ReshuffledCard.find({ reviewed: { $ne: true }, 'alternates.0': { $exists: true } })) {
        card.alternates.forEach((alt) => { alt.forms = tagResponse({ text: alt.text }).forms; });
        await card.save();
        refreshedAlternates += card.alternates.length;
    }
    if (refreshedAlternates) console.log(`Refreshed the forms on ${refreshedAlternates} alternates.`);

    if (unconverted.size) {
        console.log(`\n⚠️  Couldn't make a "to ___" verb from: ${[...unconverted].join(', ')}`);
        console.log('   Add each to the verbfixes collection, e.g. { ing: "chewing", base: "chew" }, then run this again.\n');
    }

    // 📊 How the deck splits up
    const counts = await ReshuffledCard.aggregate([
        { $match: { active: { $ne: false } } },
        { $group: { _id: { expansion: '$expansion', type: '$type', group: { $ifNull: ['$slot', { $arrayElemAt: ['$kinds', 0] }] } }, n: { $sum: 1 } } },
        { $sort: { '_id.expansion': 1, '_id.type': 1, n: -1 } },
    ]);
    console.log('\nDeck       Card      Group     Count');
    counts.forEach(({ _id, n }) => console.log(`${_id.expansion.padEnd(10)} ${_id.type.padEnd(9)} ${String(_id.group).padEnd(9)} ${n}`));

    await mongoose.disconnect();
};

seed().catch(async (err) => {
    console.error('Seeding failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
