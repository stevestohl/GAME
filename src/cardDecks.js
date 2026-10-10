// 🃏 Card decks shared by Couch Cast and Prompt 2.
// `id` must match the `expansion` field on the cards in the prompt2 collection.
// `icon` picks the glass artwork in features/Menu/DeckCard.jsx.
// To add a deck: add its cards to Mongo with a new expansion value, then add an entry here.
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
