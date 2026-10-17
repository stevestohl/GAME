import mongoose from "mongoose";

// ⭐ Couch Cast Re-Shuffled: a judge's vote for a funny prompt.
// While everyone else writes, the judge can star any of the prompts they were offered that round
// (the one they picked and the ones they passed on, as many as they like). Each star is one document
// in the `promptvotes` collection of the `couchcast_reshuffled` database, for building an
// "All-Stars" deck later. Each prompt card also keeps running totals: `starVotes` and `timesShown`.
//
// Handy queries in Compass / Atlas:
//   most-starred prompts:  cards, filter { type: 'prompt' }, sort { starVotes: -1 }
//   star rate:             starVotes / timesShown (a prompt that's starred most times it's shown)
const ReshuffledPromptVoteSchema = new mongoose.Schema({
    promptId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    promptText: { type: String },
    expansion: { type: String },
    wasPicked: { type: Boolean },          // the judge chose this prompt for the round (vs. passed on it)

    gameId: { type: String, required: true },
    roomCode: { type: String },
    round: { type: Number, required: true },
    judgePlayerId: { type: String },
    judgeName: { type: String },
}, {
    collection: 'promptvotes',
    timestamps: { createdAt: true, updatedAt: false },
});

// One star per prompt per round
ReshuffledPromptVoteSchema.index({ gameId: 1, round: 1, promptId: 1 }, { unique: true });

const reshuffledDb = mongoose.connection.useDb('couchcast_reshuffled', { useCache: true });

export default reshuffledDb.model('ReshuffledPromptVote', ReshuffledPromptVoteSchema);
