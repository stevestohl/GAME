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
