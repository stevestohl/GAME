import ReshuffledCard from "../models/ReshuffledCard.js";
import ListCategory from "../models/ListCategory.js";
import Temple_Trivia from "../models/Temple_Trivia.js";
import PictionaryPrompt from "../models/PictionaryPrompt.js";
import MixupMeme from "../models/MixupMeme.js";

// 🃏 What the admin site's Content tab can edit, one entry per "content source" (a collection of
// cards/questions/topics shared by one or more games). Each source names:
//   game      the MANAGED_GAMES id (db/adminCatalog.js) an admin needs access to
//   model     the Mongoose model, and deckField: the field holding the deck id ('core', 'jeffinitely'...).
//             No deckField: the content has no decks, so anyone with access to the game can edit all of it.
//   fields    the editable fields (besides the deck): how to show and check each one. kind is one of
//               text (long: a big box), choice, list (one per line), tags (pick several), bool, url
//             `upload` (on a url): gets an upload button, and pasted links are copied to our own storage
//             `path`: where it lives if it's not the field's own name ("forms.verb")
//             `level`: tidies older values ("Easy") in the grid and its filter
//             `read` / `write`: for fields that don't map one-to-one onto the document
//   filters   which columns get a filter dropdown; sortable: which columns sort
//   search    the fields the search box looks in
// Adding another game later = adding another entry here (the grid and the API are shared).
export const CONTENT_SOURCES = {
    couchcast: {
        game: 'couchcast',
        label: 'Couch Cast & Prompt 2 cards',
        noun: 'card',
        model: ReshuffledCard,   // the couchcast_reshuffled cards, dealt by both games
        deckField: 'expansion',
        fields: {
            text: { label: 'Card text', kind: 'text', required: true, max: 200 },
            type: { label: 'Type', kind: 'choice', choices: ['prompt', 'response'], required: true },
        },
        columns: ['text', 'type', 'deck', 'createdBy', 'updatedAt'],
        filters: ['type', 'deck', 'createdBy'],
        sortable: ['text', 'type', 'deck', 'createdBy', 'updatedAt'],
        search: ['text'],
        // New cards: the extra fields the games expect. (Tags like `slot`, `kinds` and `forms` are
        // left off: an untagged card still gets dealt, it just isn't matched to the prompt.)
        defaults: { active: true },
        titleField: 'text',
    },
    lists: {
        game: 'listcast',
        label: 'List Cast & Listopia topics',
        noun: 'topic',
        model: ListCategory,
        deckField: 'expansion',
        fields: {
            text: { label: 'List topic', kind: 'text', long: true, required: true, max: 120 },
            active: { label: 'In play', kind: 'bool' },
        },
        columns: ['text', 'deck', 'active', 'createdBy'],
        filters: ['deck', 'active', 'createdBy'],
        sortable: ['text', 'deck', 'createdBy'],
        search: ['text'],
        defaults: { active: true },
        titleField: 'text',
    },
    trivia: {
        game: 'triviacast',
        label: 'Trivia Cast & Trivia questions',
        noun: 'question',
        model: Temple_Trivia,
        deckField: 'expansion',
        fields: {
            question: { label: 'Question', kind: 'text', long: true, required: true, max: 300 },
            correct_answer: { label: 'Right answer', kind: 'text', required: true, max: 120 },
            incorrect_answers: { label: 'Wrong answers', kind: 'list', required: true, min: 3, maxItems: 3, max: 120 },
            difficulty: { label: 'Level', kind: 'choice', choices: ['easy', 'medium', 'hard'], level: true, required: true },
            category: { label: 'Category', kind: 'text', max: 60 },
        },
        columns: ['question', 'correct_answer', 'incorrect_answers', 'difficulty', 'category', 'deck'],
        filters: ['difficulty', 'category', 'deck'],
        sortable: ['question', 'correct_answer', 'difficulty', 'category', 'deck'],
        search: ['question', 'correct_answer', 'incorrect_answers', 'category'],
        defaults: { points: 1 },
        titleField: 'question',
    },
    drawing: {
        game: 'mixup',
        label: 'Temple Mix Up drawing words',
        noun: 'word',
        model: PictionaryPrompt,
        deckField: 'expansion',
        fields: {
            text: { label: 'Word to draw', kind: 'text', required: true, max: 60 },
            difficulty: { label: 'Level', kind: 'choice', choices: ['easy', 'medium', 'hard'], required: true },
            alsoAccept: { label: 'Also accept', kind: 'list', max: 60, maxItems: 10 },
            active: { label: 'In play', kind: 'bool' },
        },
        columns: ['text', 'difficulty', 'alsoAccept', 'deck', 'active', 'createdBy'],
        filters: ['difficulty', 'deck', 'active', 'createdBy'],
        sortable: ['text', 'difficulty', 'deck', 'createdBy'],
        search: ['text', 'alsoAccept'],
        defaults: { active: true, timesUsed: 0, alsoAccept: [] },
        titleField: 'text',
    },
    memes: {
        game: 'mixup',
        label: 'Temple Mix Up memes',
        noun: 'meme',
        model: MixupMeme,
        deckField: 'expansion',
        fields: {
            name: { label: 'Meme name', kind: 'text', required: true, max: 100 },
            url: { label: 'Picture', kind: 'url', upload: true, required: true, max: 500 },
            active: { label: 'In play', kind: 'bool' },
        },
        columns: ['url', 'name', 'deck', 'active', 'createdBy'],
        filters: ['deck', 'active', 'createdBy'],
        sortable: ['name', 'deck', 'createdBy'],
        search: ['name'],
        defaults: { active: true, timesUsed: 0, source: 'admin' },
        titleField: 'name',
    },
    // The same cards as Couch Cast's: this screen edits their tags, so cards are added and deleted over there
    reshuffled: {
        game: 'reshuffled',
        label: 'Couch Cast Re-Shuffled card tags',
        noun: 'card',
        model: ReshuffledCard,
        deckField: 'expansion',
        canAdd: false,
        canDelete: false,
        fields: {
            text: { label: 'Card text', kind: 'text', long: true, required: true, max: 200 },
            type: { label: 'Type', kind: 'choice', choices: ['prompt', 'response'], required: true },
            slot: { label: 'Blank takes', kind: 'choice', choices: ['any', 'thing', 'action', 'verb', 'word'], allowBlank: true },
            kinds: { label: 'Fits', kind: 'tags', choices: ['thing', 'action'] },
            formVerb: { label: 'As a verb', kind: 'text', path: 'forms.verb', max: 200 },
            formBare: { label: 'As a name', kind: 'text', path: 'forms.bare', max: 200 },
            alternates: {
                label: 'Funnier versions',
                kind: 'list',
                max: 200,
                maxItems: 10,
                // Kept as { text, forms }: lines that haven't changed keep their forms
                read: (doc) => (doc.alternates || []).map((alt) => alt.text),
                write: (lines, doc) => lines.map((text) => (doc?.alternates || []).find((alt) => alt.text === text) || { text }),
            },
            reviewed: { label: 'Checked', kind: 'bool', defaultValue: false },
        },
        columns: ['text', 'type', 'slot', 'kinds', 'formVerb', 'formBare', 'alternates', 'deck', 'reviewed'],
        filters: ['type', 'slot', 'deck', 'reviewed'],
        sortable: ['text', 'type', 'slot', 'deck'],
        search: ['text', 'forms.verb', 'forms.bare', 'alternates.text'],
        defaults: {},
        titleField: 'text',
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
        hasDeck: !!s.deckField,
        titleField: s.titleField,
        canAdd: s.canAdd !== false,
        canDelete: s.canDelete !== false,
        columns: s.columns,
        filters: s.filters,
        sortable: s.sortable,
    };
};
