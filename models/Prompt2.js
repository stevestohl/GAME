import mongoose from "mongoose";

const Prompt2Schema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Prompt or Response required']
    },
    type: {
        type: String,
        enum: ["prompt", "response"],
        default: "response",
        required: [true, 'Cardtype Required (prompt/response)']
    },
    expansion: {
        type: String, 
        default: "core",
        required: [true, 'Expansion type required']
    },
    createdBy: {
        type: String, 
        default: 'system',
        required: [true, 'created by Required']
    },
    isVerbPhrase: {
        type: Boolean,
        default: true,
        required: [true, 'Auto translate isVerbPhrase required']
    }
}, { 
    // Option A: Forces Mongoose to target your exact collection name
    collection: 'prompt2' 
});

// Option B: Alternatively, passing 'prompt2' as the 3rd argument does the same thing:
export default mongoose.model('Prompt2', Prompt2Schema, 'prompt2');