import mongoose from "mongoose";

// 📊 One row per player per round in Couch Cast and Prompt 2.
// Written when a round's winner is crowned (or the round is skipped). Built for analysis:
// what people played, how fast, and which answers the judges picked.
const PromptAnswerSchema = new mongoose.Schema({
    // --- Which game ---
    game: { type: String, enum: ['couchcast', 'prompt2', 'reshuffled'], required: true },
    gameId: { type: String, required: true, index: true },   // unique per game played (room codes get reused)
    roomCode: { type: String, required: true },
    expansion: { type: String, default: 'core' },            // the deck that was chosen for the game
    playerCount: { type: Number },                           // players answering this round (not the judge)

    // --- Which round ---
    roundNumber: { type: Number },
    totalRounds: { type: Number },
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt2' },
    promptText: { type: String },
    promptExpansion: { type: String },                       // the deck the prompt itself belongs to
    promptOptions: { type: [String], default: undefined },   // the prompts the judge chose from (Couch Cast only)
    judgePlayerId: { type: String },
    judgeName: { type: String },

    // --- Who answered ---
    playerId: { type: String },                              // anonymous ID saved on the player's device
    playerName: { type: String },                            // the nickname they typed

    // --- What they did ---
    answer: { type: String, default: null },                 // null = didn't answer in time
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt2', default: null },   // the response card played, when known
    isWriteIn: { type: Boolean, default: false },            // typed their own answer (Couch Cast only)
    handOptions: { type: [String], default: undefined },     // the cards they could choose from (Couch Cast only)
    responseTimeMs: { type: Number, default: null },         // from the prompt being chosen to their answer
    timeLimitMs: { type: Number, default: null },            // null = no clock (Prompt 2)

    // --- How the round ended ---
    isWinner: { type: Boolean, default: false },
    winnerPickedBy: { type: String, enum: ['judge', 'random', 'none'] },   // random = judge ran out of time; none = nobody answered
    submissionCount: { type: Number },                       // how many answers the judge chose between
    pointsAwarded: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('PromptAnswer', PromptAnswerSchema);
