import Prompt2 from "../models/Prompt2.js";

// -----Get All Prompt2 Cards-----
const getAllPrompt2Cards = async (req, res) => {
    try {
        // Fixed: Use the imported 'Prompt2' model variable name
        const prompt2Cards = await Prompt2.find({});
        
        // Fixed: Use 'res' instead of the phantom 'reverse' object
        res.status(200).json({ prompt2Cards, count: prompt2Cards.length });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}

export {
    getAllPrompt2Cards
}