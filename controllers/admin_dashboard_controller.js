import mongoose from "mongoose";
import PromptAnswer from "../models/PromptAnswer.js";
import { CONTENT_SOURCES } from "../db/adminContent.js";
import { tidyLevel } from "./admin_content_controller.js";

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

// ---------- GET /api/admin/dashboard/library?createdBy ----------
// 📚 How much content there is, across every deck: every admin sees all of Game Temple's content here (so everyone
// can spot a thin deck, like Holiday), even though they can only edit their own decks on the Content tab. TopCake's
// content is the owner's only. For each content source: the total, how much is in play, the split by type or level,
// a count per deck, how much was added in the last 30 days, and who added it. `createdBy` narrows it all to what one
// person added ('system' = the original set, content nobody added on the admin site). Sources that only edit tags
// (canAdd: false, like Re-Shuffled's card tags) share their cards with another source: they report how many cards
// have been checked, and aren't counted twice.
const RECENT_DAYS = 30;

// Content added by one person, or by nobody on the admin site (no createdBy at all counts as the original set)
const addedBy = (createdBy) => {
    if (!createdBy) return null;
    return createdBy === 'system' ? { $or: [{ createdBy: 'system' }, { createdBy: null }] } : { createdBy };
};

const librarySource = async (id, source, createdBy, since) => {
    const { model, deckField, fields } = source;
    // The type (prompt/response) or the level (easy/medium/hard), whichever this content has
    const splitKey = fields.type ? 'type' : fields.difficulty ? 'difficulty' : null;
    // Cards that can be taken out of play without deleting them; some sources keep the switch off the Content tab
    const hasActive = !!fields.active || !!model.schema?.path?.('active');
    const hasReviewed = !!fields.reviewed;
    const sinceId = mongoose.Types.ObjectId.createFromTime(Math.floor(since.getTime() / 1000));
    // The creator filter applies to every count except `people`, which lists everyone for the filter itself
    const who = addedBy(createdBy);
    const only = (condition) => ({ $match: who && condition ? { $and: [who, condition] } : who || condition || {} });

    const [result] = await model.aggregate([
        { $facet: {
            // One row per deck × type/level × checked: the totals are added up from these
            groups: [only(), { $group: {
                _id: {
                    deck: deckField ? { $ifNull: [`$${deckField}`, 'core'] } : null,
                    split: splitKey ? `$${fields[splitKey].path || splitKey}` : null,
                    checked: hasReviewed ? { $eq: ['$reviewed', true] } : null,
                },
                n: { $sum: 1 },
            } }],
            // Never set means in play, like on the Content tab
            ...(hasActive ? { inPlay: [only({ active: { $ne: false } }), { $count: 'n' }] } : {}),
            // A database id holds the moment it was made, so this works for content with no date field too
            added: [only({ _id: { $gte: sinceId } }), { $count: 'n' }],
            people: [{ $group: { _id: { $ifNull: ['$createdBy', 'system'] }, n: { $sum: 1 } } }, { $sort: { n: -1 } }],
        } },
    ]);

    const tidy = (value) => (splitKey === 'difficulty' ? tidyLevel(value) : String(value || '').trim().toLowerCase()) || 'not set';
    let total = 0;
    let checked = 0;
    const split = {};
    const byDeck = {};
    for (const { _id: key, n } of result.groups) {
        total += n;
        if (key.checked) checked += n;
        const value = splitKey ? tidy(key.split) : null;
        if (value) split[value] = (split[value] || 0) + n;
        if (deckField) {
            const deck = byDeck[key.deck] || (byDeck[key.deck] = { deck: key.deck, total: 0, checked: 0, split: {} });
            deck.total += n;
            if (key.checked) deck.checked += n;
            if (value) deck.split[value] = (deck.split[value] || 0) + n;
        }
    }
    // Choices in their own order (prompt, response / easy, medium, hard), anything else after
    const choices = splitKey ? fields[splitKey].choices : [];
    const order = [...choices, ...Object.keys(split).filter((value) => !choices.includes(value)).sort()];
    const listSplit = (counts) => order.filter((value) => counts[value]).map((value) => ({ value, count: counts[value] }));

    return {
        id,
        game: source.game,
        label: source.label,
        noun: source.noun,
        tagsOnly: source.canAdd === false,
        total,
        inPlay: hasActive ? (result.inPlay[0]?.n || 0) : null,   // null: this content can't be taken out of play
        added: result.added[0]?.n || 0,
        checked: hasReviewed ? checked : null,
        split: splitKey ? { field: splitKey, label: fields[splitKey].label, counts: listSplit(split) } : null,
        decks: deckField
            ? Object.values(byDeck)
                .sort((a, b) => b.total - a.total || String(a.deck).localeCompare(String(b.deck)))
                .map((d) => ({ deck: d.deck, total: d.total, checked: hasReviewed ? d.checked : null, split: listSplit(d.split) }))
            : null,
        people: result.people.map((p) => ({ name: p._id, count: p.n })),
    };
};

export const library = async (req, res) => {
    const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000);
    const createdBy = String(req.query.createdBy || '').trim().toLowerCase().slice(0, 32);
    const isOwner = req.adminUser.role === 'owner';
    const visible = Object.entries(CONTENT_SOURCES).filter(([, source]) => isOwner || source.game !== 'topcake');

    // One source that can't be counted (say, TopCake's database is asleep) shouldn't hide the rest
    const sources = await Promise.all(visible.map(([id, source]) => librarySource(id, source, createdBy, since).catch((err) => {
        console.error(`[Admin] Library count for ${id} failed:`, err.message);
        return { id, game: source.game, label: source.label, noun: source.noun, error: "Couldn't count this one right now." };
    })));

    // Everyone who has added content, most first, for the filter (tag screens share their cards: not counted twice)
    const creators = {};
    sources.filter((s) => !s.error && !s.tagsOnly).forEach((s) => s.people.forEach((p) => {
        creators[p.name] = (creators[p.name] || 0) + p.count;
    }));

    res.json({
        sources,
        days: RECENT_DAYS,
        createdBy,
        me: req.adminUser.username,
        creators: Object.entries(creators).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    });
};
