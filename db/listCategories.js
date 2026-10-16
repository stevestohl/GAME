// 📝 List categories for List Cast and Listopia.
// Each round shows one of these and everyone writes a list for it.
//
// The real list lives in MongoDB (the `listcategories` collection, see models/ListCategory.js):
// add, edit or switch off topics there. The lists below are only
//   1. the starter set that `npm run seed:lists` loads into MongoDB, and
//   2. a backup the game uses if the database can't be reached, so a game never fails to start.
import mongoose from "mongoose";
import ListCategory from "../models/ListCategory.js";

export const LIST_CATEGORIES = {
    core: [
        'Things in a junk drawer',
        'Pizza toppings',
        'Things you take on a road trip',
        'Breakfast foods',
        'Things that are yellow',
        'Board games',
        'Excuses for being late',
        'Things at a birthday party',
        'Ice cream flavors',
        'Things in a hospital',
        'Cartoon characters',
        'Things you find at the beach',
        'Sports that use a ball',
        'Things with wheels',
        'Fast food chains',
        'Things you plug in',
        'Famous duos',
        'Things that fly',
        'Things in a bathroom',
        'Halloween costumes',
        'Zoo animals',
        'Things you do on a rainy day',
        'Words that rhyme with "cat"',
        'Kitchen appliances',
        'Things that are cold',
        'Superheroes',
        'Jobs that need a uniform',
        'Things you find in a wallet',
        'Fruits',
        'Things that are sticky',
        'Camping gear',
        'Things people collect',
        'Musical instruments',
        'Things in a classroom',
        'Card games',
        'Reasons to call in sick',
        'Things that come in pairs',
        'Snacks at the movies',
        'Things that have buttons',
        'Things you see at a wedding',
        'Famous landmarks',
        'Things that make noise',
        'Dog breeds',
        'Things you shouldn\'t say on a first date',
        'Cocktails',
        'Things that are round',
        'Video games',
        'Things in a toolbox',
        'Things you do at a sleepover',
        'Vegetables',
        'Things that smell good',
        'Breakfast cereals',
        'Things you find in a purse or backpack',
        'Holiday traditions',
        'Things that can be broken',
        'Bar snacks',
        'Things you do before bed',
        'Famous TV families',
        'Things that are hot',
        'Things you buy at a gas station',
    ],
    halloween: [
        'Halloween candy',
        'Monsters',
        'Scary movies',
        'Things in a witch\'s cauldron',
        'Things you hear in a haunted house',
        'Costumes for couples',
        'Things that are orange',
        'Creepy places',
        'Things a vampire hates',
        'Things you carve',
        'Things in a graveyard',
        'Spooky sounds',
        'Things that glow in the dark',
        'Famous villains',
        'Things that crawl',
        'Things on a Halloween party menu',
        'Reasons to run away screaming',
        'Things a zombie might say',
        'Last words in a horror movie',
        'Things you find in an attic',
    ],
};

const shuffle = (items) => {
    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
};

// Backup: draw from the lists in this file
const drawFromFile = (expansion, count, exclude = []) => {
    const deck = LIST_CATEGORIES[expansion] || [];
    const core = LIST_CATEGORIES.core;
    const pool = [...shuffle(deck), ...shuffle(core)].filter((text) => !exclude.includes(text));
    return [...new Set(pool)].slice(0, count);
};

// Random active topics from one deck in MongoDB ('core' also matches topics saved without a deck)
const drawFromDB = async (deck, count, exclude) => {
    const match = { active: { $ne: false }, text: { $nin: exclude } };
    match.expansion = deck === 'core' ? { $in: ['core', null] } : deck;
    const docs = await ListCategory.aggregate([{ $match: match }, { $sample: { size: count } }]);
    return docs.map((doc) => doc.text);
};

/**
 * Topics for one game, never repeating within the game.
 * MongoDB first: that deck's topics, topped up from core if the deck is small.
 * If the database isn't connected (or is empty), falls back to the lists in this file.
 */
export async function drawListCategories(expansion, count) {
    const deck = expansion || 'core';
    let topics = [];

    if (mongoose.connection.readyState === 1) {
        try {
            topics = await drawFromDB(deck, count, []);
            if (topics.length < count && deck !== 'core') {
                topics = [...topics, ...(await drawFromDB('core', count - topics.length, topics))];
            }
        } catch (err) {
            console.error('[Lists] Could not load list topics from MongoDB, using the backup list:', err.message);
            topics = [];
        }
    }

    if (topics.length < count) {
        topics = [...topics, ...drawFromFile(deck, count - topics.length, topics)];
    }
    return topics;
}
