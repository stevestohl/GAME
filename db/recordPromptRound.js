import mongoose from "mongoose";
import PromptAnswer from "../models/PromptAnswer.js";

// An ID is only stored if it really is a MongoDB ID (anything else would make the save fail)
const toObjectId = (value) => (value && mongoose.isValidObjectId(value) ? value : null);

// Answers arrive either as plain text (Couch Cast) or as a whole card object (Prompt 2)
const answerText = (answer) => {
    if (!answer) return null;
    if (typeof answer === 'string') return answer.trim() || null;
    return answer.text || null;
};

/**
 * 📊 Save how a round of Couch Cast or Prompt 2 went (the promptanswers collection).
 * Runs in the background: a database hiccup must never hold up the game.
 *
 * @param {object} round
 * @param {'couchcast'|'prompt2'|'reshuffled'} round.game
 * @param {object} round.room              the live room
 * @param {object} round.judge             the player who judged this round
 * @param {object[]} round.players         everyone who could answer (not the judge, not the TV)
 * @param {string|null} round.winningPlayerId  socket id of the winner, or null if the round was skipped
 * @param {'judge'|'random'|'none'} round.pickedBy
 * @param {number|null} round.timeLimitMs
 * @param {number} round.pointsForWin
 * @param {object} [round.hands]           socket id -> the cards that player was dealt
 */
export const recordPromptRound = ({ game, room, judge, players, winningPlayerId, pickedBy, timeLimitMs = null, pointsForWin = 0, hands = {} }) => {
    try {
        const prompt = room.currentPrompt;
        const promptOptions = Array.isArray(room.promptOptions) && room.promptOptions.length
            ? room.promptOptions.map((p) => p?.text).filter(Boolean)
            : undefined;
        const submissionCount = players.filter((p) => answerText(p.currentAnswer)).length;

        const rows = players.map((p) => {
            const answer = answerText(p.currentAnswer);
            const hand = hands[p.id];
            // Couch Cast sends the card's text; find which dealt card it was.
            // (Re-Shuffled can play a card in other words, so it remembers the card's id instead.)
            const playedCard = typeof p.currentAnswer === 'object'
                ? p.currentAnswer
                : (hand || []).find((card) => card.text === answer)
                    || (answer && p.currentCardId ? (hand || []).find((card) => String(card._id) === String(p.currentCardId)) : undefined);
            const isWinner = !!winningPlayerId && p.id === winningPlayerId;

            return {
                game,
                gameId: room.gameId,
                roomCode: room.roomCode,
                expansion: room.expansion || 'core',
                playerCount: players.length,

                roundNumber: room.currentRound,
                totalRounds: room.totalRounds || 3,
                promptId: toObjectId(prompt?._id),
                promptText: typeof prompt === 'string' ? prompt : prompt?.text,
                promptExpansion: prompt?.expansion,
                promptOptions,
                judgePlayerId: judge?.playerId,
                judgeName: judge?.name,

                playerId: p.playerId,
                playerName: p.name,

                answer,
                cardId: p.currentIsWriteIn ? null : toObjectId(playedCard?._id),
                isWriteIn: !!p.currentIsWriteIn,
                handOptions: hand ? hand.map((card) => card.text) : undefined,
                responseTimeMs: answer && p.answeredAt && room.writingStartedAt ? p.answeredAt - room.writingStartedAt : null,
                timeLimitMs,

                isWinner,
                winnerPickedBy: pickedBy,
                submissionCount,
                pointsAwarded: isWinner ? pointsForWin : 0,
            };
        });

        if (rows.length === 0) return;
        PromptAnswer.insertMany(rows).catch((err) => {
            console.error(`[${game}] Could not save round answers:`, err.message);
        });
    } catch (err) {
        console.error(`[${game}] Could not prepare round answers:`, err.message);
    }
};
