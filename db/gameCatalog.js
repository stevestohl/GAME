// 🎮 Every game a visitor can start, and its decks, for hiding and showing them (the Games tab in /admin).
//
// Deck ids match `src/cardDecks.js` and the `expansion` field on the cards. To add a deck that players
// can pick, add it to both places. A game with no decks here (Tic-Tac-Toe) just has its own switch.
// `defaultHidden` (on a game or a deck): hidden until the owner switches it on, so new ones can be added safely.

const CARD_DECKS = [{ id: 'core', name: 'Core Deck' }, { id: 'halloween', name: 'Halloween' }];
const TRIVIA_DECKS = [{ id: 'core', name: 'Core' }, { id: 'halloween', name: 'Halloween' }, { id: 'animals', name: 'Animals' }];
const LIST_DECKS = [{ id: 'core', name: 'Core Lists' }, { id: 'halloween', name: 'Halloween' }];

export const GAMES = [
    { id: 'couchcast', name: 'Couch Cast', section: 'On a TV', decks: [...CARD_DECKS, { id: 'holiday', name: 'Holiday', defaultHidden: true }, { id: 'jeffinitely', name: 'Jeffinitely', defaultHidden: true }] },
    { id: 'triviacast', name: 'Trivia Cast', section: 'On a TV', decks: TRIVIA_DECKS },
    { id: 'listcast', name: 'List Cast', section: 'On a TV', decks: LIST_DECKS },
    { id: 'mixup', name: '3 Ring Circus', section: 'On a TV', decks: [{ id: 'core', name: 'Core Deck' }, { id: 'holiday', name: 'Holiday', defaultHidden: true }] },
    // 🏙️ New: hidden until the owner switches it on
    { id: 'town', name: 'Temple Town', section: 'On a TV', decks: [], defaultHidden: true },
    // ♠️ New: hidden until the owner switches it on
    { id: 'spades', name: 'Spades', section: 'On a TV', decks: [], defaultHidden: true },
    // 🧶 New: hidden until the owner switches it on (its Just phones version is below)
    { id: 'wordweave', name: 'Word Weave', section: 'On a TV', decks: [], defaultHidden: true },
    // 📱 Just phones: the phone versions of Couch Cast, Trivia Cast, List Cast and Word Weave (started from their setup screens
    // when "Just phones" is picked; the first three keep their old game names as ids, so saved stats and switches still match).
    // Tic-Tac-Toe has its own row on the menu.
    { id: 'prompt2', name: 'Couch Cast', section: 'Just phones', decks: CARD_DECKS },
    { id: 'trivia', name: 'Trivia Cast', section: 'Just phones', decks: TRIVIA_DECKS },
    { id: 'listopia', name: 'List Cast', section: 'Just phones', decks: LIST_DECKS },
    { id: 'wordweavephones', name: 'Word Weave', section: 'Just phones', decks: [], defaultHidden: true },
    { id: 'tictactoe', name: 'Tic-Tac-Toe', section: 'Just phones', decks: [] },
];

// The tabs in the nav bar. Hiding one only takes its button away: its page and games still work from a direct link.
export const SITE_TABS = [
    { id: 'home', name: 'Game-Cast' },
    { id: 'barhome', name: 'Bar Training' },
];

export const findGame = (id) => GAMES.find((g) => g.id === id);
