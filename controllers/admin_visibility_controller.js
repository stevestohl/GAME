import { userFromToken } from "./admin_auth.js";
import { findGame } from "../db/gameCatalog.js";
import { gamesFor, setHidden } from "../db/gameVisibility.js";

// ---------- GET /api/admin/visible-games (open to everyone) ----------
// A missing or expired token just means "a regular visitor", never an error.
export const visibleGames = async (req, res) => {
    const header = req.get('Authorization') || '';
    const user = await userFromToken(header.startsWith('Bearer ') ? header.slice(7) : null);
    res.set('Cache-Control', 'no-store');
    res.json({ games: await gamesFor(user), canSeeHidden: !!user });
};

// ---------- PUT /api/admin/visibility { game, deck?, hidden } (owner only) ----------
export const updateVisibility = async (req, res) => {
    const { game: gameId, deck: deckId, hidden } = req.body || {};
    const game = findGame(gameId);
    if (!game || typeof hidden !== 'boolean' || (deckId && !game.decks.some((d) => d.id === deckId))) {
        return res.status(400).json({ message: "That game or deck doesn't exist." });
    }
    await setHidden(gameId, deckId || null, hidden);
    res.json({ games: await gamesFor(req.adminUser), canSeeHidden: true });
};
