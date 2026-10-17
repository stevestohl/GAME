import mongoose from "mongoose";

// 🔀 Couch Cast Re-Shuffled: -ing words the automatic "to ___" conversion gets wrong.
// Lives next to the cards in the `couchcast_reshuffled` database (collection `verbfixes`).
// The seed script (npm run seed:reshuffled) uses these when it builds an action card's
// `forms.verb`, e.g. "Trying your best." -> "try your best".
// To fix another word, add a document: { ing: "having", base: "have" }
const ReshuffledVerbFixSchema = new mongoose.Schema({
    ing: { type: String, required: [true, 'The -ing word is required'], trim: true, lowercase: true, unique: true },
    base: { type: String, required: [true, 'The base verb is required'], trim: true, lowercase: true },
}, {
    collection: 'verbfixes',
});

const reshuffledDb = mongoose.connection.useDb('couchcast_reshuffled', { useCache: true });

export default reshuffledDb.model('ReshuffledVerbFix', ReshuffledVerbFixSchema);
