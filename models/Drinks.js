import mongoose from "mongoose";

const DrinkSchema = new mongoose.Schema({
    drinkName: {
        type: String,
        required: true,
        trim: true
    },
    recipe: {
        type: String,
        required: true
    },
    mixType: {
        type: String,
        trim: true
    },
    garnish: {
        type: String,
        trim: true
    }, 
    createdByAnon: {
        type: Boolean
    }
}, { timestamps: true })

export default mongoose.model("Drink", DrinkSchema)