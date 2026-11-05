// 🎂 TopCake's games and decks, for its switches in /admin. They match db/gameCatalog.js in the TopCake
// project, which decides what visitors see there. To add a game or deck, add it to both.

const CARD_DECKS = [{ id: 'core', name: 'Core Deck' }, { id: 'halloween', name: 'Halloween' }];
const CAB_DECKS = [{ id: 'core', name: 'Basic Bitch' }, { id: 'halloween', name: 'Spooky Bottoms' }];
const TRIVIA_DECKS = [{ id: 'core', name: 'Core' }, { id: 'halloween', name: 'Halloween' }, { id: 'animals', name: 'Animals' }];
const LIST_DECKS = [{ id: 'core', name: 'The Agenda' }];

export const TOPCAKE_GAMES = [
    { id: 'couchcast', name: 'Cast Around Bottom', section: 'Top Cast', decks: CAB_DECKS },
    { id: 'triviacast', name: 'Questioning Cast', section: 'Top Cast', decks: TRIVIA_DECKS },
    { id: 'listcast', name: 'The Gay Agenda Cast', section: 'Top Cast', decks: LIST_DECKS },
    { id: 'reflipped', name: 'Cast Around Bottom Re-Flipped', section: 'Top Cast', decks: CAB_DECKS },
    { id: 'throuple', name: 'Throuple Trouble', section: 'Top Cast', decks: [] },
    { id: 'trivia', name: 'Trivia', section: 'Games', decks: TRIVIA_DECKS },
    { id: 'prompt2', name: 'Prompt 2', section: 'Games', decks: CARD_DECKS },
    { id: 'listopia', name: 'The Gay Agenda', section: 'Games', decks: LIST_DECKS },
    { id: 'tictactoe', name: 'Tic-Tac-Toe', section: 'Games', decks: [] },
];

export const findTopcakeGame = (id) => TOPCAKE_GAMES.find((g) => g.id === id);
