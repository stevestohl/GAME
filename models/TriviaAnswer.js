import mongoose from "mongoose";

// 📊 One row per player per question in a Trivia Cast game.
// Written when a question's answer is revealed. Built for analysis:
// what people picked, whether it was right, and how fast they answered.
const TriviaAnswerSchema = new mongoose.Schema({
    // --- Which game ---
    game: { type: String, default: 'triviacast' },
    gameId: { type: String, required: true, index: true },   // unique per game played (room codes get reused)
    roomCode: { type: String, required: true },
    expansion: { type: String, default: 'core' },            // the deck that was chosen for the game
    playerCount: { type: Number },                           // players in the room for this question

    // --- Which question ---
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TriviaTemple' },
    questionText: { type: String },
    questionExpansion: { type: String },                     // the deck the question itself belongs to
    category: { type: String },
    difficulty: { type: String },
    questionNumber: { type: Number },                        // 1 = first question of the game
    totalQuestions: { type: Number },
    options: { type: [String] },                             // the four answers, in the order shown
    correctAnswer: { type: String },
    correctPosition: { type: Number },                       // 0 = A, 1 = B, 2 = C, 3 = D

    // --- Who answered ---
    playerId: { type: String },                              // anonymous ID saved on the player's device
    playerName: { type: String },                            // the nickname they typed

    // --- What they did ---
    answer: { type: String, default: null },                 // null = ran out of time
    answerPosition: { type: Number, default: null },         // 0 = A ... 3 = D, null = no answer
    isCorrect: { type: Boolean, default: false },
    responseTimeMs: { type: Number, default: null },         // from the question appearing to their tap
    timeLimitMs: { type: Number },
    pointsAwarded: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('TriviaAnswer', TriviaAnswerSchema);
