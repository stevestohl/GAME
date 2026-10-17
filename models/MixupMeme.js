import mongoose from "mongoose";

// 🖼️ A blank meme template for Temple Mix Up's meme rounds (collection `mixupmemes`).
// Copied from Imgflip's list of the 100 most popular templates by `npm run seed:memes`
// (safe to re-run any time to pick up new popular memes). The TV shows the picture straight
// from Imgflip's image link, with the players' captions drawn on top by the game.
//
// Memes cycle: every meme is used once before any comes back, by picking the least-used ones
// first. `timesUsed` and `lastUsedAt` go up each time a meme is played in a round.
//   - hide a meme:   set `active` to false (it stops coming up, but isn't deleted)
//   - your own meme: insert a document with `name`, `url` (a blank picture), `width` and `height`
const MixupMemeSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Meme name required'], trim: true },
    url: { type: String, required: [true, 'Image link required'], trim: true },
    width: { type: Number },
    height: { type: Number },
    boxCount: { type: Number },                  // how many text boxes the meme normally has (for reference)
    imgflipId: { type: String, index: true },    // Imgflip's id, so re-seeding updates instead of duplicating
    source: { type: String, default: 'imgflip' },
    active: { type: Boolean, default: true },
    timesUsed: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
}, {
    collection: 'mixupmemes',
    timestamps: true,
});

export default mongoose.model('MixupMeme', MixupMemeSchema);
