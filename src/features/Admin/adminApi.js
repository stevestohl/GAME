// 🔐 Talking to the admin API (routes/admin.js). The sign-in token lives in sessionStorage,
// so it's gone when the browser tab closes, and it expires on the server after 8 hours anyway.
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API = `${isLocal ? 'http://localhost:5005' : 'https://game-temple-backend.onrender.com'}/api/admin`;
const TOKEN_KEY = 'gtAdminToken';

export const getToken = () => {
    try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
};
const setToken = (token) => {
    try {
        if (token) sessionStorage.setItem(TOKEN_KEY, token);
        else sessionStorage.removeItem(TOKEN_KEY);
    } catch { /* private mode */ }
};

// Any request; throws an Error with the server's message. A 401 means "sign in again".
export async function adminFetch(path, { method = 'GET', body } = {}) {
    const token = getToken();
    let response;
    try {
        response = await fetch(`${API}${path}`, {
            method,
            headers: {
                ...(body ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new Error("Can't reach the server. It may be waking up, so try again in a moment.");
    }
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 && path !== '/login') {
        setToken(null);
        const err = new Error(data.message || 'Please sign in again.');
        err.signedOut = true;
        throw err;
    }
    if (!response.ok) throw new Error(data.message || `Something went wrong (${response.status}).`);
    return data;
}

export async function signIn(username, password) {
    const data = await adminFetch('/login', { method: 'POST', body: { username, password } });
    setToken(data.token);
    return data.user;
}

export const signOut = () => setToken(null);
