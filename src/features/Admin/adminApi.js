// 🔐 Talking to the admin API (routes/admin.js). The sign-in token is kept in src/auth.js.
import { getToken, setToken } from '../../auth.js';

export { getToken };

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API = `${isLocal ? 'http://localhost:5005' : 'https://game-temple-backend.onrender.com'}/api/admin`;
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

// Sends a picture straight to our Cloudinary account, with the server's permission. Returns its link.
export async function uploadPicture(sourceId, file) {
    const { cloudName, apiKey, fields } = await adminFetch(`/content/${sourceId}/upload`, { method: 'POST' });
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', apiKey);
    Object.entries(fields).forEach(([key, value]) => form.append(key, value));
    let response;
    try {
        response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form });
    } catch {
        throw new Error("Couldn't reach the picture storage. Check your connection and try again.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || `The upload didn't work (${response.status}).`);
    return data.secure_url;
}

export async function signIn(username, password) {
    const data = await adminFetch('/login', { method: 'POST', body: { username, password } });
    setToken(data.token);
    return data.user;
}

export const signOut = () => setToken(null);
