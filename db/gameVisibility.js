import SiteSettings from "../models/SiteSettings.js";
import { GAMES, SITE_TABS, findGame } from "./gameCatalog.js";
import { TOPCAKE_GAMES } from "./topcakeCatalog.js";
import { topcakeDb } from "./topcakeDb.js";
import { userFromToken } from "../controllers/admin_auth.js";

// 🙈 Which games and decks are hidden from the public. The owner and admins can still see and play
// them; everyone else can't see them on the menus or start a room with them (guardCreateRoom below).
// Joining a room is always open, so friends scanning the QR code never need an account.

let settings = null;   // the owner's choices, kept in memory ("couchcast/halloween" -> true)

const load = async () => {
    if (settings) return settings;
    const doc = await SiteSettings.findById('site').lean();
    settings = new Map(Object.entries(doc?.hidden || {}));
    return settings;
};

const keyFor = (game, deck) => (deck ? `${game}/${deck}` : game);
const isHidden = (map, game, deck) => {
    const saved = map.get(keyFor(game.id, deck));
    if (saved !== undefined) return saved;
    return !!(deck ? game.decks.find((d) => d.id === deck)?.defaultHidden : game.defaultHidden);
};
// The owner and admins can see hidden games (later, buyers would be a third kind of account: they can't)
const canSeeHidden = (user) => !!user && (user.role === 'owner' || user.role === 'admin');

const describe = (map, games = GAMES) => games.map((game) => ({
    id: game.id,
    name: game.name,
    section: game.section,
    hidden: isHidden(map, game),
    decks: game.decks.map(({ id, name }) => ({ id, name, hidden: isHidden(map, game, id) })),
}));

/** The games and decks this person may see. Hidden ones aren't even mentioned to the public. */
export const gamesFor = async (user) => {
    const all = describe(await load());
    if (canSeeHidden(user)) return all;
    return all.filter((g) => !g.hidden).map((g) => ({ ...g, decks: g.decks.filter((d) => !d.hidden) }));
};

/** Owner only (checked by the route): hide or show a game, or one of its decks */
export const setHidden = async (gameId, deckId, hidden) => {
    const key = keyFor(gameId, deckId);
    await SiteSettings.updateOne({ _id: 'site' }, { $set: { [`hidden.${key}`]: hidden } }, { upsert: true });
    (await load()).set(key, hidden);
};

// The nav bar's tabs are saved with the same choices, as "tab:home"
const tabKey = (id) => `tab:${id}`;

/** The nav bar's tabs this person may see */
export const tabsFor = async (user) => {
    const map = await load();
    const all = SITE_TABS.map(({ id, name }) => ({ id, name, hidden: !!map.get(tabKey(id)) }));
    return canSeeHidden(user) ? all : all.filter((tab) => !tab.hidden);
};

/** Owner only (checked by the route): hide or show a tab */
export const setTabHidden = async (id, hidden) => {
    const key = tabKey(id);
    await SiteSettings.updateOne({ _id: 'site' }, { $set: { [`hidden.${key}`]: hidden } }, { upsert: true });
    (await load()).set(key, hidden);
};

// 🎂 TopCake's choices live in its own database, where its server reads them
const topcakeSettings = () => topcakeDb().collection('sitesettings');

/** Owner only: TopCake's games and decks, for its switches */
export const topcakeGames = async () => {
    const doc = await topcakeSettings().findOne({ _id: 'site' });
    return describe(new Map(Object.entries(doc?.hidden || {})), TOPCAKE_GAMES);
};

/** Owner only: hide or show one of TopCake's games or decks */
export const setTopcakeHidden = async (gameId, deckId, hidden) => {
    await topcakeSettings().updateOne(
        { _id: 'site' },
        { $set: { [`hidden.${keyFor(gameId, deckId)}`]: hidden, updatedAt: new Date() } },
        { upsert: true },
    );
};

/**
 * Wraps a game's `createRoom` socket handler: a hidden game or deck only starts for the owner and admins.
 * `game`: the game's id, or a function from the request to its id. The sign-in token comes from
 * src/socket.js, which adds it to every createRoom. A refused host gets `gameHidden` back.
 */
export const guardCreateRoom = (game, socket, handler) => async (data = {}) => {
    const gameId = typeof game === 'function' ? game(data) : game;
    const entry = findGame(gameId);
    try {
        const map = await load();
        const deck = typeof data.expansion === 'string' && data.expansion.trim() ? data.expansion.trim().toLowerCase() : 'core';
        const hasDeck = entry.decks.some((d) => d.id === deck);
        const blocked = isHidden(map, entry) || (hasDeck && isHidden(map, entry, deck));
        if (blocked && !canSeeHidden(await userFromToken(data.authToken))) {
            socket.emit('gameHidden');
            return;
        }
    } catch (err) {
        // Can't read the settings: games stay open, except the ones hidden by default
        console.error('[Visibility]', err.message);
        if (entry.defaultHidden && !canSeeHidden(await userFromToken(data.authToken).catch(() => null))) {
            socket.emit('gameHidden');
            return;
        }
    }
    handler(data);
};
