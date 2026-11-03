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

// Reading and writing a field that may live deeper in the document ("forms.verb")
const getPath = (doc, path) => path.split('.').reduce((value, key) => value?.[key], doc);
const setPath = (doc, path, value) => {
    const keys = path.split('.');
    let at = doc;
    keys.slice(0, -1).forEach((key) => { at[key] = at[key] || {}; at = at[key]; });
    at[keys[keys.length - 1]] = value;
};
const fieldValue = (doc, key, field) => {
    if (field.read) return field.read(doc);
    const value = getPath(doc, field.path || key);
    if (field.level) return tidyLevel(value);
    if (field.kind === 'bool') return value ?? field.defaultValue ?? true;
    return value;
};

// Older questions aren't tidy: "Easy", "easy, like Ricardo"
const tidyLevel = (value) => String(value || '').trim().split(/[^a-z]/i)[0].toLowerCase();

// A database document -> a grid row (the deck field is always called "deck" on screen)
const toRow = (doc, source) => {
    const row = { id: String(doc._id), createdBy: doc.createdBy || 'system', updatedBy: doc.updatedBy || null, updatedAt: doc.updatedAt || null };
    if (source.deckField) row.deck = doc[source.deckField] || 'core';
    Object.entries(source.fields).forEach(([key, field]) => { row[key] = fieldValue(doc, key, field); });
    return row;
};

// Which decks an account's limit covers (older content with no deck counts as core)
const deckScope = (decks, source) => {
    if (!decks || !source.deckField) return {};
    return { [source.deckField]: { $in: decks.includes('core') ? [...decks, null] : decks } };
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
        if (field.kind === 'url') {
            value = String(value ?? '').trim();
            if (!/^https?:\/\/\S+$/i.test(value)) return { error: `${field.label} must be a web link, starting with https://` };
            if (field.max && value.length > field.max) return { error: `${field.label} is limited to ${field.max} characters.` };
        }
        if (field.kind === 'choice') {
            if (field.allowBlank && !value) value = null;
            else if (!field.choices.includes(value)) return { error: `${field.label} must be one of: ${field.choices.join(', ')}.` };
        }
        if (field.kind === 'list') {
            const lines = Array.isArray(value) ? value : String(value ?? '').split('\n');
            value = lines.map((line) => String(line).replace(/\s+/g, ' ').trim()).filter(Boolean);
            if ((field.required || field.min) && value.length < (field.min || 1)) return { error: `${field.label} needs at least ${field.min || 1}.` };
            if (field.maxItems && value.length > field.maxItems) return { error: `${field.label} can have at most ${field.maxItems}.` };
            if (field.max && value.some((line) => line.length > field.max)) return { error: `${field.label} are limited to ${field.max} characters each.` };
        }
        if (field.kind === 'tags') {
            value = (Array.isArray(value) ? value : []).filter((tag) => field.choices.includes(tag));
        }
        if (field.kind === 'bool') value = value === true || value === 'true';
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
    const scope = deckScope(decks, source);
    const match = { ...scope };
    for (const filter of source.filters) {
        const value = req.query[filter];
        if (value === undefined || value === '') continue;
        const field = filter === 'deck' ? deckField : source.fields[filter]?.path || filter;
        const defined = source.fields[filter];
        if (defined?.kind === 'bool') {
            const isOn = defined.defaultValue === false ? { $eq: true } : { $ne: false };
            match[field] = value === 'true' ? isOn : (defined.defaultValue === false ? { $ne: true } : { $eq: false });
            continue;
        }
        if (defined?.level) {
            match[field] = { $regex: `^${escapeRegex(String(value))}`, $options: 'i' };
            continue;
        }
        if (filter === 'createdBy' && value === 'system') match.$and = [...(match.$and || []), { $or: [{ createdBy: 'system' }, { createdBy: { $exists: false } }] }];
        else match[field] = String(value);
    }
    // Picked a deck in the filter that this account doesn't manage: nothing to show
    if (decks && deckField && typeof match[deckField] === 'string' && !decks.includes(match[deckField])) match[deckField] = { $in: [] };
    const search = String(req.query.search || '').trim().slice(0, 100);
    if (search) {
        const pattern = new RegExp(escapeRegex(search), 'i');
        match.$and = [...(match.$and || []), { $or: source.search.map((f) => ({ [f]: pattern })) }];
    }

    const limit = PAGE_SIZES.includes(Number(req.query.limit)) ? Number(req.query.limit) : 30;
    const total = await model.countDocuments(match);
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(pages, Math.max(1, Number(req.query.page) || 1));

    const sortKey = source.sortable.includes(req.query.sort) ? req.query.sort : source.titleField;
    const sortField = sortKey === 'deck' ? deckField : source.fields[sortKey]?.path || sortKey;
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
        const field = filter === 'deck' ? deckField : source.fields[filter]?.path || filter;
        const defined = source.fields[filter];
        const counts = await model.aggregate([
            { $match: scope },
            { $group: { _id: { $ifNull: [`$${field}`, filter === 'createdBy' ? 'system' : filter === 'deck' ? 'core' : null] }, n: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        if (defined?.kind === 'bool') {
            // Never set means the default
            const on = counts.filter((c) => (c._id ?? defined.defaultValue ?? true) === true).reduce((sum, c) => sum + c.n, 0);
            const off = counts.reduce((sum, c) => sum + c.n, 0) - on;
            facets[filter] = [{ value: 'true', count: on }, { value: 'false', count: off }];
        } else if (defined?.level) {
            // "Easy" and "easy" are one choice
            const tidy = {};
            counts.forEach((c) => { const key = tidyLevel(c._id); if (key) tidy[key] = (tidy[key] || 0) + c.n; });
            facets[filter] = Object.keys(tidy).sort().map((value) => ({ value, count: tidy[value] }));
        } else {
            facets[filter] = counts.filter((c) => c._id !== null).map((c) => ({ value: String(c._id), count: c.n }));
        }
    }

    res.json({ rows: docs.map((d) => toRow(d, source)), total, page, pages, limit, facets, decks });
};

// ---------- POST /api/admin/content/:source ----------
export const createContent = async (req, res) => {
    const found = getSource(req, res);
    if (!found) return;
    const { source, decks } = found;
    if (source.canAdd === false) return res.status(405).json({ message: `Add ${source.noun}s on the Couch Cast list.` });

    const { values, error } = checkFields(source, req.body || {}, { partial: false });
    if (error) return res.status(400).json({ message: error });
    const deckCheck = source.deckField ? checkDeck(req.body?.deck, decks) : {};
    if (deckCheck.error) return res.status(400).json({ message: deckCheck.error });

    const now = new Date();
    const doc = { ...source.defaults };
    Object.entries(values).forEach(([key, value]) => {
        const field = source.fields[key];
        setPath(doc, field.path || key, field.write ? field.write(value, null) : value);
    });
    if (source.deckField) doc[source.deckField] = deckCheck.deck;
    Object.assign(doc, {
        createdBy: req.adminUser.username,
        createdAt: now,
        updatedBy: req.adminUser.username,
        updatedAt: now,
    });
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
    if (decks && source.deckField && !decks.includes(doc[source.deckField] || 'core')) return res.status(403).json({ message: "You don't manage that deck." });

    const { values, error } = checkFields(source, req.body || {}, { partial: true });
    if (error) return res.status(400).json({ message: error });
    const changes = {};
    Object.entries(values).forEach(([key, value]) => {
        const field = source.fields[key];
        // A level that's only been tidied for the grid stays as it is, unless someone really changed it
        if (field.level && value === tidyLevel(getPath(doc, field.path || key))) return;
        changes[field.path || key] = field.write ? field.write(value, doc) : value;
    });
    if (source.deckField && 'deck' in (req.body || {})) {
        const deckCheck = checkDeck(req.body.deck, decks);
        if (deckCheck.error) return res.status(400).json({ message: deckCheck.error });
        changes[source.deckField] = deckCheck.deck;
    }
    changes.updatedBy = req.adminUser.username;
    changes.updatedAt = new Date();

    await source.model.collection.updateOne({ _id: doc._id }, { $set: changes });
    const updated = { ...doc };
    Object.entries(changes).forEach(([path, value]) => setPath(updated, path, value));
    res.json({ row: toRow(updated, source) });
};

// ---------- DELETE /api/admin/content/:source/:id ----------
export const deleteContent = async (req, res) => {
    const found = getSource(req, res);
    if (!found) return;
    const { source, decks } = found;
    if (source.canDelete === false) return res.status(405).json({ message: `Delete ${source.noun}s on the Couch Cast list.` });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Not found.' });

    const doc = await source.model.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found.' });
    if (decks && source.deckField && !decks.includes(doc[source.deckField] || 'core')) return res.status(403).json({ message: "You don't manage that deck." });

    await source.model.collection.deleteOne({ _id: doc._id });
    res.json({ deleted: true });
};
