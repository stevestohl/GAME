import Temple_Trivia from "../models/Temple_Trivia.js";

// ==========================================
// HTTP REST API Controllers Only
// ==========================================

/**
 * Gets all trivia documents from the database.
 */
export const getAllTrivia = async (req, res) => {
  try {
    const triviaDocs = await Temple_Trivia.find({});
    res.status(200).json({
      success: true,
      count: triviaDocs.length,
      data: triviaDocs,
      message: "Trivia documents fetched successfully over HTTP."
    });
  } catch (err) {
    console.error("Error in getAllTrivia:", err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/**
 * Fetch a single Trivia document by its MongoDB ObjectID.
 */
export const getTriviaByID = async (req, res) => {
  try {
    const triviaDoc = await Temple_Trivia.findById(req.params.id);

    if (!triviaDoc) {
      return res.status(404).json({ 
        success: false,
        message: "Trivia question not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: triviaDoc
    });
  } catch (err) {
    console.error("Error in getTriviaByID:", err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/**
 * Simple uptime health check for the Trivia engine.
 */
export const getTriviaBackendStatus = async (req, res) => {
  try {
    res.status(200).json({
      status: "online",
      message: "Welcome to the Trivia-Temple API!"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};