// 🎮 Every game a visitor can start, and its decks, for hiding and showing them (the Games tab in /admin).
//
// Deck ids match `src/cardDecks.js` and the `expansion` field on the cards. To add a deck that players
// can pick, add it to both places. A game with no decks here (Tic-Tac-Toe) just has its own switch.
// `defaultHidden` (on a game or a deck): hidden until the owner switches it on, so new ones can be added safely.

const CARD_DECKS = [{ id: 'core', name: 'Core Deck' }, { id: 'halloween', name: 'Halloween' }];
const TRIVIA_DECKS = [{ id: 'core', name: 'Core' }, { id: 'halloween', name: 'Halloween' }, { id: 'animals', name: 'Animals' }];
const LIST_DECKS = [{ id: 'core', name: 'Core Lists' }, { id: 'halloween', name: 'Halloween' }];

export const GAMES = [
    { id: 'couchcast', name: 'Couch Cast', section: 'Game-Cast', decks: [...CARD_DECKS, { id: 'holiday', name: 'Holiday', defaultHidden: true }, { id: 'jeffinitely', name: 'Jeffinitely', defaultHidden: true }] },
    { id: 'triviacast', name: 'Trivia Cast', section: 'Game-Cast', decks: TRIVIA_DECKS },
    { id: 'listcast', name: 'List Cast', section: 'Game-Cast', decks: LIST_DECKS },
    { id: 'mixup', name: '3 Ring Circus', section: 'Game-Cast', decks: [{ id: 'core', name: 'Core Deck' }, { id: 'holiday', name: 'Holiday', defaultHidden: true }] },
    { id: 'reshuffled', name: 'Couch Cast Re-Shuffled', section: 'Game-Cast', decks: CARD_DECKS, defaultHidden: true },
    // 🏙️ New: hidden until the owner switches it on
    { id: 'town', name: 'Temple Town', section: 'Game-Cast', decks: [], defaultHidden: true },
    // ♠️ New: hidden until the owner switches it on
    { id: 'spades', name: 'Spades', section: 'Game-Cast', decks: [], defaultHidden: true },
    // 📱 Just phones: Trivia, Prompt 2 and Listopia start from Trivia Cast's, Couch Cast's and List Cast's setup
    // screens when "Just phones" is picked; Tic-Tac-Toe has its own row on the menu
    { id: 'trivia', name: 'Trivia (Trivia Cast on phones)', section: 'Just phones', decks: TRIVIA_DECKS },
    { id: 'prompt2', name: 'Prompt 2 (Couch Cast on phones)', section: 'Just phones', decks: CARD_DECKS },
    { id: 'listopia', name: 'Listopia (List Cast on phones)', section: 'Just phones', decks: LIST_DECKS },
    { id: 'tictactoe', name: 'Tic-Tac-Toe', section: 'Just phones', decks: [] },
];

// The tabs in the nav bar. Hiding one only takes its button away: its page and games still work from a direct link.
export const SITE_TABS = [
    { id: 'home', name: 'Game-Cast' },
    { id: 'barhome', name: 'Bar Training' },
];

export const findGame = (id) => GAMES.find((g) => g.id === id);
