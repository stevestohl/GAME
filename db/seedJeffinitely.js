// 🕺 Starter cards for Couch Cast's Jeffinitely deck: the '70s, '80s and '90s all at once.
//
//   npm run seed:jeffinitely
//
// Safe to run again: a card with the same text is left alone, so edits made on the admin site stay.
// Add more here, or on the admin site's Content tab. (The tags below match each card to the prompts
// it reads well in; see models/ReshuffledCard.js.)
import "dotenv/config";
import mongoose from "mongoose";
import ReshuffledCard from "../models/ReshuffledCard.js";

const DECK = 'jeffinitely';

const PROMPTS = [
    { text: "The real reason '80s hair was so big? It was hiding _______.", slot: 'thing' },
    { text: "Back in my day we didn't have the internet. We had _______.", slot: 'thing' },
    { text: "The mixtape I made for my crush in 1989 was mostly _______.", slot: 'thing' },
    { text: "Mom's 1974 party salad had three ingredients: Jell-O, mayonnaise and _______.", slot: 'thing' },
    { text: "Be kind, rewind, and never, ever tell anyone about _______.", slot: 'any' },
    { text: "The video store finally went out of business because of _______.", slot: 'thing' },
    { text: "My parents' basement still has a shrine to _______.", slot: 'thing' },
    { text: "The dial-up kept dropping because my mom was _______.", slot: 'action' },
    { text: "What was really going on at the roller rink after dark?", slot: 'any' },
    { text: "What got me grounded for the entire summer of '96?", slot: 'any' },
];

const RESPONSES = [
    // Things
    { text: "A waterbed with a slow leak.", kinds: ['thing'], forms: { bare: "Waterbed with a Slow Leak" } },
    { text: "Shag carpet that has seen things.", kinds: ['thing'], forms: { bare: "Shag Carpet That Has Seen Things" } },
    { text: "A Trapper Keeper full of secrets.", kinds: ['thing'], forms: { bare: "Trapper Keeper Full of Secrets" } },
    { text: "My dad's 1978 mustache.", kinds: ['thing'], forms: { bare: "Dad's 1978 Mustache" } },
    { text: "A dangerous amount of Aqua Net.", kinds: ['thing'], forms: { bare: "Dangerous Amount of Aqua Net" } },
    { text: "A pager nobody has ever paged.", kinds: ['thing'], forms: { bare: "Pager Nobody Has Ever Paged" } },
    { text: "A lava lamp and some poor decisions.", kinds: ['thing'], forms: { bare: "Lava Lamp and Some Poor Decisions" } },
    { text: "A neon windbreaker you could hear from space.", kinds: ['thing'], forms: { bare: "Neon Windbreaker You Could Hear from Space" } },
    { text: "The last Tamagotchi I let die.", kinds: ['thing'], forms: { bare: "Last Tamagotchi I Let Die" } },
    { text: "A mood ring stuck on \"panic.\"", kinds: ['thing'], forms: { bare: "Mood Ring Stuck on \"Panic\"" } },
    { text: "Parachute pants with a concerning number of zippers.", kinds: ['thing'], forms: { bare: "Parachute Pants with a Concerning Number of Zippers" } },
    { text: "The guy who ran the mall arcade.", kinds: ['thing'], forms: { bare: "Guy Who Ran the Mall Arcade" } },
    { text: "A stack of free AOL CDs.", kinds: ['thing'], forms: { bare: "Stack of Free AOL CDs" } },

    // Things you do
    { text: "Taping songs off the radio.", kinds: ['action'], forms: { verb: "tape songs off the radio" } },
    { text: "Blowing into a Nintendo cartridge.", kinds: ['action'], forms: { verb: "blow into a Nintendo cartridge" } },
    { text: "Doing the Hustle at a funeral.", kinds: ['action'], forms: { verb: "do the Hustle at a funeral" } },
    { text: "Waiting 40 minutes for one photo to load.", kinds: ['action'], forms: { verb: "wait 40 minutes for one photo to load" } },
    { text: "Giving myself a home perm.", kinds: ['action'], forms: { verb: "give myself a home perm" } },
    { text: "Roller skating away from my problems.", kinds: ['action'], forms: { verb: "roller skate away from my problems" } },
    { text: "Calling the movie times line just to hear a voice.", kinds: ['action'], forms: { verb: "call the movie times line just to hear a voice" } },
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
    console.log(`Jeffinitely: added ${added} new cards (${cards.length - added} were already there).`);
    await mongoose.disconnect();
};

run().catch(async (err) => {
    console.error('Could not add the Jeffinitely cards:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
