import mongoose from "mongoose";

// 📝 A list topic for List Cast and Listopia ("Things in a junk drawer").
// Lives in the `listcategories` collection. Edit them in MongoDB Compass / Atlas:
//   - add a topic:      insert a document with `text` and `expansion` ('core', 'halloween', or a new deck)
//   - hide a topic:     set `active` to false (it stops coming up, but isn't deleted)
//   - a brand-new deck: use a new `expansion` value, then add a matching entry to LIST_DECKS in src/cardDecks.js
const ListCategorySchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'List topic text required'],
        trim: true,
    },
    expansion: {
        type: String,
        default: "core",
        required: [true, 'Expansion (deck) required'],
    },
    active: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: String,
        default: 'system',
    },
}, {
    collection: 'listcategories',
});

export default mongoose.model('ListCategory', ListCategorySchema, 'listcategories');
