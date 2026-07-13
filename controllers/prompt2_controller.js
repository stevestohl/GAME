import Prompt2Model from "../models/Prompt2.js";

// ==========================================
// HTTP REST API Controllers Only
// ==========================================

/**
 * Gets all cards for Prompt2 (e.g., for an admin dashboard or deck preview)
 */
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
        res.status(500).json({ 
            success: false, 
            message: "Server Error fetching prompt cards." 
        });
    }
};

/**
 * Gets 3 random prompt-type cards for the host selection screen
 */
export const getRandomPromptsForHost = async (req, res) => {
    try {
        const randomPrompts = await Prompt2Model.aggregate([
            { $match: { type: 'prompt' } },
            { $sample: { size: 3 } }
        ]);

        res.status(200).json({
            success: true,
            data: randomPrompts,
            message: "Successfully retrieved 3 random host prompts."
        });
    } catch (error) {
        console.error("Error in getRandomPromptsForHost:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch random prompts.",
            error: error.message 
        });
    }
};

/**
 * Gets 7 random response-type cards for a player's starting hand
 */
export const getRandomResponsesForPlayers = async (req, res) => {
    try {
        const randomResponses = await Prompt2Model.aggregate([
            { $match: { type: 'response' } },
            { $sample: { size: 7 } }
        ]);

        res.status(200).json({
            success: true,
            data: randomResponses,
            message: "Successfully retrieved 7 random player responses."
        });
    } catch (error) {
        console.error("Error in getRandomResponsesForPlayers:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch random responses.",
            error: error.message 
        });
    }
};