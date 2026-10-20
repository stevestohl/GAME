import mongoose from "mongoose";

// 🔀 A card for Couch Cast Re-Shuffled.
// Lives in its OWN database (`couchcast_reshuffled`, collection `cards`) on the same Atlas cluster.
// Couch Cast, Prompt 2 and Couch Cast Re-Shuffled all deal from these cards.
// The cards start as a copy of the Prompt 2 deck (run `npm run seed:reshuffled`), then get tagged:
//
//   Prompts have a `slot`: what kind of answer reads well in the blank
//     'any'    -> anything works            "_______ is my love language."
//     'thing'  -> a thing, person or place  "I got a tattoo of _______."
//     'action' -> something you do (-ing)   "My dog is surprisingly good at _______."
//     'verb'   -> a "to ___" verb           "...only uses its power to ____."
//     'word'   -> a name-like word          "The new superhero in town is Captain _______."
//
//   Responses have `kinds`: which blanks they fit ('thing' and/or 'action'),
//   plus ready-made `forms` for the fussier blanks:
//     forms.verb -> "Taking over the world." becomes "take over the world" for 'verb' prompts
//     forms.bare -> "A fragile ego." becomes "Fragile Ego" for 'word' prompts
//   and `alternates`: funnier versions of the card, shown when a player presses and holds it.
//     Each one is the same kind of answer as the card (so it fits the same prompts) and gets
//     its own forms: { text: "Licking the vending machine for luck.", forms: { verb: "lick the vending machine for luck" } }
//     Add them with `npm run reshuffled:alternates <file.json>` (see db/addReshuffledAlternates.js), or in Compass.
//
// Edit cards in MongoDB Compass / Atlas. Set `reviewed: true` on any card you've fixed by hand,
// and re-running the seed script will leave it alone.
const ReshuffledCardSchema = new mongoose.Schema({
    text: { type: String, required: [true, 'Card text required'], trim: true },
    type: { type: String, enum: ['prompt', 'response'], required: [true, 'Card type required (prompt/response)'] },
    expansion: { type: String, default: 'core', required: [true, 'Expansion (deck) required'] },

    // Prompts only
    slot: { type: String, enum: ['any', 'thing', 'action', 'verb', 'word'], default: undefined },
    timesShown: { type: Number },   // how many times it's been offered to a judge
    starVotes: { type: Number },    // how many judges starred it as funny (see models/ReshuffledPromptVote.js)

    // Responses only
    kinds: { type: [String], enum: ['thing', 'action'], default: undefined },
    forms: {
        verb: { type: String },
        bare: { type: String },
    },
    alternates: {
        type: [{
            _id: false,
            text: { type: String, required: true, trim: true },
            forms: { verb: { type: String }, bare: { type: String } },
        }],
        default: [],
    },

    sourceId: { type: mongoose.Schema.Types.ObjectId },   // the Prompt 2 card it was copied from
    reviewed: { type: Boolean, default: false },          // true = hand-checked; the seed script won't overwrite it
    createdBy: { type: String },                          // admin who added it on the admin site's Content tab
    active: { type: Boolean, default: true },             // false = keep it, but stop dealing it
}, {
    collection: 'cards',
});

// Same cluster connection, different database
const reshuffledDb = mongoose.connection.useDb('couchcast_reshuffled', { useCache: true });

export default reshuffledDb.model('ReshuffledCard', ReshuffledCardSchema);
