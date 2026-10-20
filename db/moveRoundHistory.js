// 📦 Copies the Couch Cast / Prompt 2 round history (collection `promptanswers`) from the main
// database into `couchcast_reshuffled`, so the history sits next to the cards it's about.
//
//   npm run move:rounds
//
// Safe to run again: rows already copied are skipped (matched by _id), so run it once more
// after the new server is live to catch any rounds the old one saved in the meantime.
// Nothing is deleted: the old copy stays in the main database until you drop it yourself.
import "dotenv/config";
import mongoose from "mongoose";

const FROM = 'promptanswers';

const move = async () => {
    await mongoose.connect(process.env.DB || process.env.DATABASE_ACCESS);
    const main = mongoose.connection.db;
    const cardsDb = mongoose.connection.client.db('couchcast_reshuffled');

    const rows = await main.collection(FROM).find({}).toArray();
    console.log(`${main.databaseName}.${FROM} has ${rows.length} rows.`);

    if (rows.length) {
        const result = await cardsDb.collection(FROM).bulkWrite(rows.map((row) => ({
            updateOne: { filter: { _id: row._id }, update: { $setOnInsert: row }, upsert: true },
        })), { ordered: false });
        console.log(`Copied ${result.upsertedCount} new rows (the rest were already there).`);
    }

    const total = await cardsDb.collection(FROM).countDocuments();
    console.log(`couchcast_reshuffled.${FROM} now has ${total} rows.`);
    await mongoose.disconnect();
};

move().catch((err) => {
    console.error('Could not move the round history:', err);
    process.exit(1);
});
