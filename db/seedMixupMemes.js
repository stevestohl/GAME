// 🖼️ Copies Imgflip's 100 most popular blank meme templates into MongoDB (collection `mixupmemes`)
// for Temple Mix Up's meme rounds.
//
//   npm run seed:memes
//
// Safe to run again (and worth doing every few months, as new memes get popular): memes already
// saved are updated (name, picture link, size) but keep their usage history and any you've hidden;
// new popular ones are added. Nothing is ever deleted.
// Imgflip's list is free and needs no account: https://api.imgflip.com/get_memes
import "dotenv/config";
import mongoose from "mongoose";
import MixupMeme from "../models/MixupMeme.js";

const IMGFLIP_LIST = 'https://api.imgflip.com/get_memes';

const seed = async () => {
    const response = await fetch(IMGFLIP_LIST);
    const body = await response.json();
    if (!body.success) throw new Error(`Imgflip said no: ${body.error_message || response.status}`);
    const memes = body.data.memes;
    console.log(`Imgflip has ${memes.length} popular templates.`);

    await mongoose.connect(process.env.DB || process.env.DATABASE_ACCESS);

    const result = await MixupMeme.bulkWrite(memes.map((m) => ({
        updateOne: {
            filter: { imgflipId: String(m.id) },
            update: {
                $set: { name: m.name, url: m.url, width: m.width, height: m.height, boxCount: m.box_count, source: 'imgflip' },
                $setOnInsert: { imgflipId: String(m.id), active: true, timesUsed: 0 },
            },
            upsert: true,
        },
    })));

    const total = await MixupMeme.countDocuments({ active: { $ne: false } });
    console.log(`Added ${result.upsertedCount} new memes, refreshed ${result.modifiedCount}. ${total} memes are in play.`);
    await mongoose.disconnect();
};

seed().catch(async (err) => {
    console.error('Loading memes failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
