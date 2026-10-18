import mongoose from "mongoose";
import { CONTENT_SOURCES, describeSource } from "../db/adminContent.js";
import { DECK_ID } from "../db/adminCatalog.js";

// 🃏 The Content tab's API: list (paged, searched, filtered, sorted), add, edit and delete content,
// always limited to the decks the signed-in account manages for that game (the owner manages all).

const PAGE_SIZES = [10, 30, 50, 100];

// Which decks this account may touch for a source: null means "all" (the owner)
const allowedDecks = (user, source) => (user.role === 'owner'
    ? null
    : [...new Set(user.access.filter((a) => a.game === source.game).map((a) => a.deck))]);

const getSource = (req, res) => {
    const source = CONTENT_SOURCES[req.params.source];
    if (!source) {
        res.status(404).json({ message: 'Unknown content.' });
        return null;
    }
    const decks = allowedDecks(req.adminUser, source);
    if (decks && decks.length === 0) {
        res.status(403).json({ message: "You don't manage any decks for this game." });
        return null;
    }
    return { source, decks };
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A database document -> a grid row (the deck field is always called "deck" on screen)
const toRow = (doc, source) => {
    const row = { id: String(doc._id), deck: doc[source.deckField] || 'core', createdBy: doc.createdBy || 'system', updatedBy: doc.updatedBy || null, updatedAt: doc.updatedAt || doc.createdAt || null };
    Object.keys(source.fields).forEach((key) => { row[key] = doc[key]; });
    return row;
};

// Check the edited fields from the screen; returns { values } or { error }
const checkFields = (source, body, { partial }) => {
    const values = {};
    for (const [key, field] of Object.entries(source.fields)) {
        if (!(key in body)) {
            if (!partial && field.required) return { error: `${field.label} is required.` };
            continue;
        }
        let value = body[key];
        if (field.kind === 'text') {
            value = String(value ?? '').replace(/\s+/g, ' ').trim();
            if (field.required && !value) return { error: `${field.label} can't be empty.` };
            if (field.max && value.length > field.max) return { error: `${field.label} is limited to ${field.max} characters.` };
        }
        if (field.kind === 'choice' && !field.choices.includes(value)) return { error: `${field.label} must be one of: ${field.choices.join(', ')}.` };
        values[key] = value;
    }
    return { values };
};

const checkDeck = (deck, decks) => {
    const clean = String(deck || '').trim().toLowerCase();
    if (!DECK_ID.test(clean)) return { error: 'Deck names are lowercase letters, numbers and dashes, like "jeffinitely".' };
    if (decks && !decks.includes(clean)) return { error: `You don't manage the "${clean}" deck.` };
    return { deck: clean };
};

// ---------- GET /api/admin/content: which content this account can edit ----------
export const listSources = (req, res) => {
    const sources = Object.entries(CONTENT_SOURCES)
        .map(([id, source]) => ({ ...describeSource(id), decks: allowedDecks(req.adminUser, source) }))
        .filter((s) => s.decks === null || s.decks.length > 0);
    res.json({ sources });
};

// ---------- GET /api/admin/content/:source?page&limit&search&sort&dir&<filters> ----------
export const listContent = async (req, res) => {
    const found = getSource(req, res);
    if (!found) return;
    const { source, decks } = found;
    const { model, deckField } = source;

    // What this account may see at all (the deck limit), then the filters and search on top
    const scope = decks ? { [deckField]: { $in: decks } } : {};
    const match = { ...scope };
    for (const filter of source.filters) {
        const value = req.query[filter];
        if (value === undefined || value === '') continue;
        const field = filter === 'deck' ? deckField : filter;
        if (filter === 'createdBy' && value === 'system') match.$and = [...(match.$and || []), { $or: [{ createdBy: 'system' }, { createdBy: { $exists: false } }] }];
        else match[field] = String(value);
    }
    if (decks && match[deckField] && !decks.includes(match[deckField])) match[deckField] = { $in: [] };
    const search = String(req.query.search || '').trim().slice(0, 100);
    if (search) {
        const pattern = new RegExp(escapeRegex(search), 'i');
        match.$and = [...(match.$and || []), { $or: source.search.map((f) => ({ [f]: pattern })) }];
    }

    const limit = PAGE_SIZES.includes(Number(req.query.limit)) ? Number(req.query.limit) : 30;
    const total = await model.countDocuments(match);
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(pages, Math.max(1, Number(req.query.page) || 1));

    const sortKey = source.sortable.includes(req.query.sort) ? req.query.sort : 'text';
    const sortField = sortKey === 'deck' ? deckField : sortKey;
    const dir = req.query.dir === 'desc' ? -1 : 1;

    // Sort like a person would: capitals and small letters together, numbers in number order
    const docs = await model.find(match)
        .collation({ locale: 'en', strength: 2, numericOrdering: true })
        .sort({ [sortField]: dir, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    // Choices for the filter dropdowns, with counts (within what this account may see)
    const facets = {};
    for (const filter of source.filters) {
        const field = filter === 'deck' ? deckField : filter;
        const counts = await model.aggregate([
            { $match: scope },
            { $group: { _id: { $ifNull: [`$${field}`, filter === 'createdBy' ? 'system' : filter === 'deck' ? 'core' : null] }, n: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        facets[filter] = counts.filter((c) => c._id !== null).map((c) => ({ value: String(c._id), count: c.n }));
    }

    res.json({ rows: docs.map((d) => toRow(d, source)), total, page, pages, limit, facets, decks });
};

// ---------- POST /api/admin/content/:source ----------
export const createContent = async (req, res) => {
    const found = getSource(req, res);
    if (!found) return;
    const { source, decks } = found;

    const { values, error } = checkFields(source, req.body || {}, { partial: false });
    if (error) return res.status(400).json({ message: error });
    const deckCheck = checkDeck(req.body?.deck, decks);
    if (deckCheck.error) return res.status(400).json({ message: deckCheck.error });

    const now = new Date();
    const doc = {
        ...source.defaults,
        ...values,
        [source.deckField]: deckCheck.deck,
        createdBy: req.adminUser.username,
        createdAt: now,
        updatedBy: req.adminUser.username,
        updatedAt: now,
    };
    const result = await source.model.collection.insertOne(doc);
    res.status(201).json({ row: toRow({ ...doc, _id: result.insertedId }, source) });
};

// ---------- PATCH /api/admin/content/:source/:id ----------
export const updateContent = async (req, res) => {
    const found = getSource(req, res);
    if (!found) return;
    const { source, decks } = found;
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Not found.' });

    const doc = await source.model.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found.' });
    if (decks && !decks.includes(doc[source.deckField] || 'core')) return res.status(403).json({ message: "You don't manage that deck." });

    const { values, error } = checkFields(source, req.body || {}, { partial: true });
    if (error) return res.status(400).json({ message: error });
    const changes = { ...values };
    if ('deck' in (req.body || {})) {
        const deckCheck = checkDeck(req.body.deck, decks);
        if (deckCheck.error) return res.status(400).json({ message: deckCheck.error });
        changes[source.deckField] = deckCheck.deck;
    }
    changes.updatedBy = req.adminUser.username;
    changes.updatedAt = new Date();

    await source.model.collection.updateOne({ _id: doc._id }, { $set: changes });
    res.json({ row: toRow({ ...doc, ...changes }, source) });
};

// ---------- DELETE /api/admin/content/:source/:id ----------
export const deleteContent = async (req, res) => {
    const found = getSource(req, res);
    if (!found) return;
    const { source, decks } = found;
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Not found.' });

    const doc = await source.model.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found.' });
    if (decks && !decks.includes(doc[source.deckField] || 'core')) return res.status(403).json({ message: "You don't manage that deck." });

    await source.model.collection.deleteOne({ _id: doc._id });
    res.json({ deleted: true });
};
