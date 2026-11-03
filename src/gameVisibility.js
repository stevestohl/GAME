import { useEffect, useState } from 'react';
import { getToken, onAuthChange } from './auth.js';

// 🙈 Which games and decks this visitor may see, from the server (db/gameVisibility.js).
// The menus show the last answer straight away (the server can take a minute to wake up) and update when
// the new one arrives. Hiding here is for tidiness: the server also refuses to start a hidden game.

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const URL = `${isLocal ? 'http://localhost:5005' : 'https://game-temple-backend.onrender.com'}/api/admin/visible-games`;
const CACHE_KEY = 'gtVisibleGames';
const REFRESH_MS = 30000;

// Before the first answer: everything shows except the games hidden by default
const STARTS_HIDDEN = ['reshuffled'];

const readCache = () => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch { return null; }
};

let state = { games: readCache(), confirmed: false };
let lastFetch = 0;
const listeners = new Set();

const publish = (next) => {
    state = next;
    listeners.forEach((listener) => listener(state));
};

/** Use the server's answer (it's also what the owner's switches get back) */
export const setVisibleGames = (games) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(games)); } catch { /* private mode */ }
    publish({ games, confirmed: true });
};

let requestNumber = 0;
const refresh = async () => {
    lastFetch = Date.now();
    requestNumber += 1;
    const mine = requestNumber;
    try {
        const token = getToken();
        const response = await fetch(URL, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!response.ok) return;
        const { games } = await response.json();
        if (mine === requestNumber) setVisibleGames(games);   // signing in or out mid-request: only the newest counts
    } catch {
        // The server's asleep or unreachable: keep what we have
    }
};

onAuthChange(() => {
    // Signed in or out: what was showing no longer applies
    publish({ games: state.games, confirmed: false });
    refresh();
});

/** `decks` is a list from cardDecks.js. Each deck in the answer knows if it's `hidden` (a badge for the owner and admins). */
const describeDecks = (entry, decks) => {
    if (!entry) return decks;
    return decks.flatMap((deck) => {
        const known = entry.decks.find((d) => d.id === deck.id);
        return known ? [{ ...deck, hidden: known.hidden }] : [];
    });
};

export function useGameVisibility() {
    const [current, setCurrent] = useState(state);

    useEffect(() => {
        listeners.add(setCurrent);
        setCurrent(state);
        if (Date.now() - lastFetch > REFRESH_MS) refresh();
        return () => listeners.delete(setCurrent);
    }, []);

    const entryFor = (id) => current.games?.find((g) => g.id === id);
    return {
        // true once the server has answered for whoever is signed in right now
        confirmed: current.confirmed,
        canSeeGame: (id) => (current.games ? !!entryFor(id) : !STARTS_HIDDEN.includes(id)),
        isGameHidden: (id) => (current.games ? !!entryFor(id)?.hidden : STARTS_HIDDEN.includes(id)),
        visibleDecks: (id, decks) => describeDecks(entryFor(id), decks),
    };
}

/** A deck picker with a preselected deck: if that deck is hidden, move to the first one that isn't */
export function useKeepDeckVisible(decks, selected, select) {
    const firstVisible = decks[0]?.id;
    const isVisible = decks.some((deck) => deck.id === selected);
    useEffect(() => {
        if (!isVisible && firstVisible) select(firstVisible);
    }, [isVisible, firstVisible]);
}
