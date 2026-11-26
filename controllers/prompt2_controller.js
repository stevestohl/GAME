import ReshuffledCard from "../models/ReshuffledCard.js";
import { drawCards } from "../db/drawCards.js";

// ==========================================
// HTTP REST API Controllers Only
// ==========================================

/**
 * Gets all cards for Prompt2 (e.g., for an admin dashboard or deck preview)
 */
export const getAllPrompt2Cards = async (req, res) => {
    try {
        const prompt2Cards = await ReshuffledCard.find({ active: { $ne: false } });
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
 * (?expansion=halloween picks the deck; defaults to core)
 */
export const getRandomPromptsForHost = async (req, res) => {
    try {
        const randomPrompts = await drawCards('prompt', req.query.expansion, 3);

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

const HAND_SIZE = 7;
// 🔀 Every hand has at least this many of each kind of card ("a thing" and "something you do"), so whatever the
// prompt wants, every player has a couple of answers that read well. The same rule as Couch Cast on a TV.
const MIN_OF_EACH_KIND = 2;

/**
 * Gets a player's hand: 7 response cards, at least two of each kind, in a random order
 * (?expansion=halloween picks the deck; defaults to core, which also tops up a deck that runs short)
 */
export const getRandomResponsesForPlayers = async (req, res) => {
    try {
        const hand = [];
        for (const kind of ['action', 'thing']) {
            hand.push(...await drawCards('response', req.query.expansion, MIN_OF_EACH_KIND, hand.map((c) => c._id), { kinds: kind }));
        }
        hand.push(...await drawCards('response', req.query.expansion, HAND_SIZE - hand.length, hand.map((c) => c._id)));
        // Shuffled, so the sure-fire cards aren't always the first ones in the hand
        for (let i = hand.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [hand[i], hand[j]] = [hand[j], hand[i]];
        }
        const randomResponses = hand;

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