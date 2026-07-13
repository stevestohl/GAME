import Prompt2Model from "../models/Prompt2.js";

// ==========================================
// HTTP REST API Controllers Only
// ==========================================

// Gets all cards for Prompt2 (e.g., for an admin dashboard or deck preview)
export const getAllPrompt2Cards = async (req, res) => {
    try {
        const prompt2Cards = await Prompt2Model.find({});
        res.status(200).json({ 
            success: true, 
            data: prompt2Cards,
            message: "Prompt2 cards fetched successfully over HTTP." 
        });
    } catch (error) {
        console.error("Error in getAllPrompt2Cards:", error.message);
        res.status(500).json({ success: false, message: "Server Error fetching prompt cards." });
    }
};