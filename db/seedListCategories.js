// 🌱 Loads the starter List Cast / Listopia topics (db/listCategories.js) into MongoDB.
//
//   npm run seed:lists
//
// Safe to run again: topics already in the database (same text and deck) are skipped,
// so it never makes duplicates and never touches topics you've edited or switched off.
import 'dotenv/config';
import mongoose from 'mongoose';
import ListCategory from '../models/ListCategory.js';
import { LIST_CATEGORIES } from './listCategories.js';

const url = process.env.DB || process.env.DATABASE_ACCESS;
if (!url) {
    console.error('No database address found. Set DB in your .env file.');
    process.exit(1);
}

try {
    await mongoose.connect(url);
    const existing = await ListCategory.find({}, { text: 1, expansion: 1 }).lean();
    const have = new Set(existing.map((doc) => `${doc.expansion || 'core'}|${doc.text.trim().toLowerCase()}`));

    const toAdd = [];
    Object.entries(LIST_CATEGORIES).forEach(([expansion, topics]) => {
        topics.forEach((text) => {
            const key = `${expansion}|${text.trim().toLowerCase()}`;
            if (!have.has(key)) {
                toAdd.push({ text, expansion, active: true, createdBy: 'system' });
                have.add(key);
            }
        });
    });

    if (toAdd.length) await ListCategory.insertMany(toAdd);
    const total = await ListCategory.countDocuments();
    console.log(`Added ${toAdd.length} list topics. The listcategories collection now has ${total}.`);
} catch (err) {
    console.error('Could not load the list topics:', err.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
