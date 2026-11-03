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
    { id: 'mixup', name: 'Temple Mix Up', section: 'Game-Cast', decks: [{ id: 'core', name: 'Core Deck' }, { id: 'holiday', name: 'Holiday', defaultHidden: true }] },
    { id: 'reshuffled', name: 'Couch Cast Re-Shuffled', section: 'Game-Cast', decks: CARD_DECKS, defaultHidden: true },
    { id: 'trivia', name: 'Trivia', section: 'Game-Temple', decks: TRIVIA_DECKS },
    { id: 'prompt2', name: 'Prompt 2', section: 'Game-Temple', decks: CARD_DECKS },
    { id: 'listopia', name: 'Listopia', section: 'Game-Temple', decks: LIST_DECKS },
    { id: 'tictactoe', name: 'Tic-Tac-Toe', section: 'Game-Temple', decks: [] },
];

export const findGame = (id) => GAMES.find((g) => g.id === id);
