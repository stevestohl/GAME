// 🎄 Starter cards for Couch Cast's Holiday deck.
//
//   npm run seed:holiday
//
// Safe to run again: a card with the same text is left alone, so edits made on the admin site stay.
// Add more here, or on the admin site's Content tab. (The tags below match each card to the prompts
// it reads well in; see models/ReshuffledCard.js.)
import "dotenv/config";
import mongoose from "mongoose";
import ReshuffledCard from "../models/ReshuffledCard.js";

const DECK = 'holiday';

const PROMPTS = [
    { text: "Santa's naughty list got a lot longer this year because of _______.", slot: 'thing' },
    { text: "Grandma's holiday letter this year is three pages about _______.", slot: 'thing' },
    { text: "What ruined this year's family holiday photo?", slot: 'any' },
];

const RESPONSES = [
    // Things
    { text: "A fruitcake older than I am.", kinds: ['thing'], forms: { bare: "Fruitcake Older Than I Am" } },
    { text: "The elf on the shelf, who knows too much.", kinds: ['thing'], forms: { bare: "Elf on the Shelf, Who Knows Too Much" } },
    { text: "An inflatable Santa slowly losing the will to live.", kinds: ['thing'], forms: { bare: "Inflatable Santa Slowly Losing the Will to Live" } },
    { text: "The tangled ball of lights from 1994.", kinds: ['thing'], forms: { bare: "Tangled Ball of Lights from 1994" } },
    { text: "A light-up sweater with a dying battery.", kinds: ['thing'], forms: { bare: "Light-Up Sweater with a Dying Battery" } },
    { text: "Regifted socks with my name still on the tag.", kinds: ['thing'], forms: { bare: "Regifted Socks with My Name Still on the Tag" } },

    // Things you do
    { text: "Eating the cookies meant for Santa.", kinds: ['action'], forms: { verb: "eat the cookies meant for Santa" } },
    { text: "Rewrapping a gift I got last year.", kinds: ['action'], forms: { verb: "rewrap a gift I got last year" } },
    { text: "Fighting a stranger for the last parking spot at the mall.", kinds: ['action'], forms: { verb: "fight a stranger for the last parking spot at the mall" } },
    { text: "Pretending to love this sweater.", kinds: ['action'], forms: { verb: "pretend to love this sweater" } },
];

const run = async () => {
    await mongoose.connect(process.env.DB || process.env.DATABASE_ACCESS);
    const cards = [
        ...PROMPTS.map((card) => ({ ...card, type: 'prompt' })),
        ...RESPONSES.map((card) => ({ ...card, type: 'response' })),
    ];
    let added = 0;
    for (const card of cards) {
        const result = await ReshuffledCard.updateOne(
            { text: card.text, type: card.type, expansion: DECK },
            { $setOnInsert: { ...card, expansion: DECK, active: true, reviewed: true, createdBy: 'system' } },
            { upsert: true },
        );
        added += result.upsertedCount;
    }
    console.log(`Holiday: added ${added} new cards (${cards.length - added} were already there).`);
    await mongoose.disconnect();
};

run().catch(async (err) => {
    console.error('Could not add the Holiday cards:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
