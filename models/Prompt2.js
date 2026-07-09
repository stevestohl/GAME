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
        type: String, // Fixed: changed lowercase 'text' to 'String'
        default: "core",
        required: [true, 'Expansion type required']
    },
    createdBy: {
        type: String, // Fixed: changed lowercase 'text' to 'String'
        default: 'system',
        required: [true, 'created by Required']
    },
    isVerbPhrase: {
        type: Boolean,
        default: true,
        required: [true, 'Auto translate isVerbPhrase required']
    }
});

export default mongoose.model('Prompt2', Prompt2Schema);