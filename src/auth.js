// 🔑 Who's signed in on this device. The token stays in localStorage, so you stay signed in between visits
// until Sign out (or it expires on the server, after 14 days). Regular players never need one.
const TOKEN_KEY = 'gtAdminToken';

const listeners = new Set();

export const getToken = () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const setToken = (token) => {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch { /* private mode */ }
    listeners.forEach((listener) => listener());
};

/** Calls `listener` whenever someone signs in or out. Returns an unsubscribe. */
export const onAuthChange = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};
