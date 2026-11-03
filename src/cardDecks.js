// 🃏 Card decks for the party games.
// `id` must match the `expansion` field on the cards/questions in MongoDB.
// `icon` picks the glass artwork in features/Menu/DeckCard.jsx.
// To add a deck: add its cards to Mongo with a new expansion value, then add an entry here.

// Couch Cast and Prompt 2 (the prompt2 collection)
export const CARD_DECKS = [
    {
        id: 'core',
        title: 'Core Deck',
        tag: 'The Original',
        icon: 'core',
        description: 'The classic mix of prompts and responses. Great for any crowd.',
        colors: ['#93a7f0', '#3a53c4'],
    },
    {
        id: 'halloween',
        title: 'Halloween',
        tag: 'Seasonal',
        icon: 'halloween',
        description: 'Spooky, silly and a little bit haunted. Perfect for fright night.',
        colors: ['#ff9a3d', '#5b2a86'],
    },
    {
        // Couch Cast only, for now (the server's list of each game's decks is db/gameCatalog.js)
        id: 'holiday',
        title: 'Holiday',
        tag: 'Seasonal',
        icon: 'holiday',
        description: 'Ugly sweaters, regifted socks and family photos gone wrong.',
        colors: ['#3ecf83', '#0c5c38'],
        background: 'linear-gradient(160deg, #35b873 0%, #178a52 50%, #0b5433 100%)',
        startsHidden: true,   // don't flash it at visitors before the server's answer arrives
    },
    {
        // Couch Cast only, for now (the server's list of each game's decks is db/gameCatalog.js)
        id: 'jeffinitely',
        title: 'Jeffinitely',
        tag: 'Totally Retro',
        icon: 'jeffinitely',
        description: "Shag carpet, big hair and dial-up. Three decades of questionable decisions.",
        colors: ['#ff5fa2', '#5b2a86'],
        background: 'linear-gradient(160deg, #ff8a3d 0%, #ff4f9a 38%, #7b3fd1 70%, #18b6c9 100%)',
        startsHidden: true,   // don't flash it at visitors before the server's answer arrives
    },
];

// Trivia (the trivia collection)
export const TRIVIA_DECKS = [
    {
        id: 'core',
        title: 'Core',
        tag: 'The Original',
        icon: 'trivia',
        description: 'General knowledge for any crowd.',
        colors: ['#93a7f0', '#3a53c4'],
    },
    {
        id: 'halloween',
        title: 'Halloween',
        tag: 'Seasonal',
        icon: 'halloween',
        description: 'Monsters, movies and spooky lore.',
        colors: ['#ff9a3d', '#5b2a86'],
    },
    {
        id: 'animals',
        title: 'Animals',
        tag: 'Wild',
        icon: 'animals',
        description: 'Fur, fins and feathers.',
        colors: ['#6fcf97', '#1b7a5a'],
    },
];

// List Cast and Listopia (categories live in db/listCategories.js on the server)
export const LIST_DECKS = [
    {
        id: 'core',
        title: 'Core Lists',
        tag: 'The Original',
        icon: 'list',
        description: 'Everyday lists for any crowd.',
        colors: ['#93a7f0', '#3a53c4'],
    },
    {
        id: 'halloween',
        title: 'Halloween',
        tag: 'Seasonal',
        icon: 'halloween',
        description: 'Monsters, candy and creepy places.',
        colors: ['#ff9a3d', '#5b2a86'],
    },
];

// How long a game can be. The first number in each list is the default.
export const ROUND_OPTIONS = [3, 5, 7, 10];        // Couch Cast and Prompt 2: rounds
export const QUESTION_OPTIONS = [5, 10, 15, 20];   // Trivia: questions
export const LIST_ROUND_OPTIONS = [5, 7, 10];      // List Cast and Listopia: rounds
