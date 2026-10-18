// 🗂️ What the admin site can manage. Shared by the server (checking access) and the /admin screens.
//
// An admin's access is a list of { game, deck } pairs, for example { game: 'couchcast', deck: 'jeffinitely' }:
// they can only see and change content for those games and decks. The owner can do everything.
// `deck` is the deck id stored on each card's `expansion` field ('core', 'halloween', 'jeffinitely'...).

export const ROLES = ['owner', 'admin'];

export const MANAGED_GAMES = [
    { id: 'couchcast', name: 'Couch Cast & Prompt 2', content: 'Prompt and response cards' },
    { id: 'reshuffled', name: 'Couch Cast Re-Shuffled', content: 'Tagged cards, alternates and prompt stars' },
    { id: 'triviacast', name: 'Trivia Cast & Trivia', content: 'Trivia questions' },
    { id: 'listcast', name: 'List Cast & Listopia', content: 'List topics' },
    { id: 'mixup', name: 'Temple Mix Up', content: 'Memes and Pictionary prompts' },
];

export const isManagedGame = (id) => MANAGED_GAMES.some((g) => g.id === id);

// Deck ids: lowercase letters, numbers and dashes, like "jeffinitely" or "halloween"
export const DECK_ID = /^[a-z0-9-]{1,40}$/;
