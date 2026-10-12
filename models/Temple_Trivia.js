import mongoose from "mongoose";

const TriviaTempleSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question required']
    },
    correct_answer: {
        type: String,
        required: [true, 'Answer required']
    },
    incorrect_answers: {
        type: [Array], 
        required: [true, 'Incorrect answers are required'] 
    },
    // Which deck the question belongs to (core, halloween, animals...)
    expansion: {
        type: String,
        default: 'core'
    },
    category: {
        type: String,
        default: 'General' 
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'], 
        required: true
    },
    points: {
        type: Number,
        default: 1
    }
}, { timestamps: true }); 
export default mongoose.model('TriviaTemple', TriviaTempleSchema);