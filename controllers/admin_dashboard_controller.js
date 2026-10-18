import PromptAnswer from "../models/PromptAnswer.js";

// 📊 The Dashboard tab's numbers. Each report is limited to the decks the signed-in account
// manages for that game (the owner sees everything).

const decksFor = (user, game) => (user.role === 'owner'
    ? null
    : [...new Set(user.access.filter((a) => a.game === game).map((a) => a.deck))]);

// ---------- GET /api/admin/dashboard/couchcast/top-responses?limit&writeIns ----------
// The answers judges pick most in Couch Cast and Prompt 2: how often each one won (judge's pick
// only, not random picks when the judge ran out of time), how often it was played, and its win rate.
export const topResponses = async (req, res) => {
    const decks = decksFor(req.adminUser, 'couchcast');
    if (decks && decks.length === 0) return res.status(403).json({ message: "You don't manage any Couch Cast decks." });

    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const includeWriteIns = req.query.writeIns === 'true';

    const match = { game: { $in: ['couchcast', 'prompt2'] }, answer: { $nin: [null, ''] } };
    if (!includeWriteIns) match.isWriteIn = { $ne: true };
    if (decks) match.expansion = { $in: decks };

    const judgeWin = { $and: ['$isWinner', { $eq: ['$winnerPickedBy', 'judge'] }] };

    const rows = await PromptAnswer.aggregate([
        { $match: match },
        // The same card can be stored with different spacing/capitals over time: group by the text
        { $group: {
            _id: { $toLower: { $trim: { input: '$answer' } } },
            answer: { $first: '$answer' },
            wins: { $sum: { $cond: [judgeWin, 1, 0] } },
            played: { $sum: 1 },
            writeIn: { $max: '$isWriteIn' },
            decks: { $addToSet: '$expansion' },
            lastWon: { $max: { $cond: [judgeWin, '$createdAt', null] } },
        } },
        { $match: { wins: { $gt: 0 } } },
        { $addFields: { winRate: { $divide: ['$wins', '$played'] } } },
        { $sort: { wins: -1, winRate: -1, lastWon: -1 } },
        { $limit: limit },
    ]);

    // Totals for context under the chart
    const [totals] = await PromptAnswer.aggregate([
        { $match: match },
        { $group: { _id: null, answers: { $sum: 1 }, judgeWins: { $sum: { $cond: [judgeWin, 1, 0] } }, games: { $addToSet: '$gameId' } } },
        { $project: { _id: 0, answers: 1, judgeWins: 1, games: { $size: '$games' } } },
    ]);

    res.json({
        rows: rows.map((r) => ({ answer: r.answer, wins: r.wins, played: r.played, winRate: r.winRate, writeIn: !!r.writeIn, decks: r.decks.filter(Boolean), lastWon: r.lastWon })),
        totals: totals || { answers: 0, judgeWins: 0, games: 0 },
        decks,
    });
};
