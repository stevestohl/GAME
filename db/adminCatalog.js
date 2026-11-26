// 🗂️ What the admin site can manage. Shared by the server (checking access) and the /admin screens.
//
// An admin's access is a list of { game, deck } pairs, for example { game: 'couchcast', deck: 'jeffinitely' }:
// they can only see and change content for those games and decks. The owner can do everything.
// `deck` is the deck id stored on each card's `expansion` field ('core', 'halloween', 'jeffinitely'...).

export const ROLES = ['owner', 'admin'];

export const MANAGED_GAMES = [
    { id: 'couchcast', name: 'Couch Cast', content: 'Prompt and response cards' },
    { id: 'triviacast', name: 'Trivia Cast', content: 'Trivia questions' },
    { id: 'listcast', name: 'List Cast', content: 'List topics' },
    { id: 'mixup', name: '3 Ring Circus', content: 'Memes and Pictionary prompts' },
];

export const isManagedGame = (id) => MANAGED_GAMES.some((g) => g.id === id);

// Deck ids: lowercase letters, numbers and dashes, like "jeffinitely" or "halloween"
export const DECK_ID = /^[a-z0-9-]{1,40}$/;
