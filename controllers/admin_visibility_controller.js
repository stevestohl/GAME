import { userFromToken } from "./admin_auth.js";
import { findGame, SITE_TABS } from "../db/gameCatalog.js";
import { findTopcakeGame } from "../db/topcakeCatalog.js";
import { gamesFor, setHidden, tabsFor, setTabHidden, topcakeGames, setTopcakeHidden } from "../db/gameVisibility.js";

// ---------- GET /api/admin/visible-games (open to everyone) ----------
// A missing or expired token just means "a regular visitor", never an error.
export const visibleGames = async (req, res) => {
    const header = req.get('Authorization') || '';
    const user = await userFromToken(header.startsWith('Bearer ') ? header.slice(7) : null);
    res.set('Cache-Control', 'no-store');
    res.json({ games: await gamesFor(user), tabs: await tabsFor(user), canSeeHidden: !!user });
};

// ---------- PATCH /api/admin/visibility { game, deck?, hidden } or { tab, hidden } (owner only) ----------
export const updateVisibility = async (req, res) => {
    const { game: gameId, deck: deckId, tab, hidden } = req.body || {};
    if (tab !== undefined) {
        if (!SITE_TABS.some((t) => t.id === tab) || typeof hidden !== 'boolean') return res.status(400).json({ message: "That tab doesn't exist." });
        await setTabHidden(tab, hidden);
    } else {
        const game = findGame(gameId);
        if (!game || typeof hidden !== 'boolean' || (deckId && !game.decks.some((d) => d.id === deckId))) {
            return res.status(400).json({ message: "That game or deck doesn't exist." });
        }
        await setHidden(gameId, deckId || null, hidden);
    }
    res.json({ games: await gamesFor(req.adminUser), tabs: await tabsFor(req.adminUser), canSeeHidden: true });
};

// ---------- GET /api/admin/topcake/games (owner only) ----------
export const listTopcakeGames = async (req, res) => res.json({ games: await topcakeGames() });

// ---------- PATCH /api/admin/topcake/visibility { game, deck?, hidden } (owner only) ----------
export const updateTopcakeVisibility = async (req, res) => {
    const { game: gameId, deck: deckId, hidden } = req.body || {};
    const game = findTopcakeGame(gameId);
    if (!game || typeof hidden !== 'boolean' || (deckId && !game.decks.some((d) => d.id === deckId))) {
        return res.status(400).json({ message: "That game or deck doesn't exist." });
    }
    await setTopcakeHidden(gameId, deckId || null, hidden);
    res.json({ games: await topcakeGames() });
};
