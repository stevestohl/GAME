import Prompt2 from "../models/Prompt2.js";

// 🃏 What the admin site's Content tab can edit, one entry per "content source" (a collection of
// cards/questions/topics shared by one or more games). Each source names:
//   game      the MANAGED_GAMES id (db/adminCatalog.js) an admin needs access to
//   model     the Mongoose model, and deckField: the field holding the deck id ('core', 'jeffinitely'...)
//   fields    the editable fields (besides the deck): how to show and check each one
//   filters   which columns get a filter dropdown; sortable: which columns sort
//   search    the fields the search box looks in
// Adding another game later = adding another entry here (the grid and the API are shared).
export const CONTENT_SOURCES = {
    couchcast: {
        game: 'couchcast',
        label: 'Couch Cast & Prompt 2 cards',
        noun: 'card',
        model: Prompt2,
        deckField: 'expansion',
        fields: {
            text: { label: 'Card text', kind: 'text', required: true, max: 200 },
            type: { label: 'Type', kind: 'choice', choices: ['prompt', 'response'], required: true },
        },
        columns: ['text', 'type', 'deck', 'createdBy', 'updatedAt'],
        filters: ['type', 'deck', 'createdBy'],
        sortable: ['text', 'type', 'deck', 'createdBy', 'updatedAt'],
        search: ['text'],
        // New cards: the extra fields the games expect
        defaults: { isVerbPhrase: false },
    },
};

// The parts of a source the admin screens need (no Mongoose model)
export const describeSource = (id) => {
    const s = CONTENT_SOURCES[id];
    return {
        id,
        game: s.game,
        label: s.label,
        noun: s.noun,
        fields: s.fields,
        columns: s.columns,
        filters: s.filters,
        sortable: s.sortable,
    };
};
