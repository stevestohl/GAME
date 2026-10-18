import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";

// 🔐 Signing in to game-temple.org/admin, and the checks every admin request goes through.
//
// Needs ADMIN_JWT_SECRET: a long random string, set in .env.local (local) and in Render's
// Environment settings (live). Never commit it. Without it, admin sign-in is switched off.

const TOKEN_HOURS = 8;
const MAX_FAILS = 5;                    // wrong passwords in a row for one username...
const MAX_FAILS_PER_ADDRESS = 20;       // ...or from one internet address (a whole household shares one)...
const LOCK_MINUTES = 15;                // ...lock it for this long

const secret = () => process.env.ADMIN_JWT_SECRET;

// Failed sign-ins, kept in memory: "username" and "ip:<address>" -> { fails, lockedUntil }
const attempts = new Map();
const isLocked = (key) => (attempts.get(key)?.lockedUntil || 0) > Date.now();
const recordFail = (key, limit = MAX_FAILS) => {
    const entry = attempts.get(key) || { fails: 0, lockedUntil: 0 };
    entry.fails += 1;
    if (entry.fails >= limit) {
        entry.lockedUntil = Date.now() + LOCK_MINUTES * 60 * 1000;
        entry.fails = 0;
    }
    attempts.set(key, entry);
};

// Pasted passwords can carry invisible extras: terminal "bracketed paste" codes, control characters,
// or a stray space at either end. Strip them everywhere a password comes in, so pasting just works.
export const cleanPassword = (password) => String(password ?? '')
    .replace(/\u001b\[20[01]~/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();

export const hashPassword = (password) => bcrypt.hash(cleanPassword(password), 12);

// A password rule both the owner script and the Users page use
export const passwordProblem = (password) => {
    if (typeof password !== 'string' || cleanPassword(password).length < 10) return 'Passwords need at least 10 characters.';
    if (password.length > 200) return 'That password is too long.';
    return null;
};

// ---------- POST /api/admin/login { username, password } ----------
export const login = async (req, res) => {
    if (!secret()) return res.status(503).json({ message: 'Admin sign-in is not set up on this server yet.' });

    const username = String(req.body?.username || '').trim().toLowerCase();
    const password = cleanPassword(req.body?.password);
    const ipKey = `ip:${req.ip}`;

    if (isLocked(username) || isLocked(ipKey)) {
        return res.status(429).json({ message: `Too many wrong passwords. Try again in ${LOCK_MINUTES} minutes.` });
    }

    const user = await AdminUser.findOne({ username });
    const ok = user && user.active && await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        recordFail(username);
        recordFail(ipKey, MAX_FAILS_PER_ADDRESS);
        return res.status(401).json({ message: 'Wrong username or password.' });
    }

    attempts.delete(username);
    attempts.delete(ipKey);
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign({ sub: String(user._id), v: user.tokenVersion }, secret(), { expiresIn: `${TOKEN_HOURS}h` });
    res.json({ token, user: user.toSafe() });
};

// ---------- Middleware: must be signed in ----------
// Loads the account on every request, so a deactivated account or changed access counts immediately.
export const requireAdmin = async (req, res, next) => {
    try {
        if (!secret()) return res.status(503).json({ message: 'Admin sign-in is not set up on this server yet.' });
        const header = req.get('Authorization') || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ message: 'Please sign in.' });

        const payload = jwt.verify(token, secret());
        const user = await AdminUser.findById(payload.sub);
        if (!user || !user.active || user.tokenVersion !== payload.v) {
            return res.status(401).json({ message: 'Please sign in again.' });
        }
        req.adminUser = user;
        next();
    } catch {
        res.status(401).json({ message: 'Please sign in again.' });
    }
};

// ---------- Middleware: owner only ----------
export const requireOwner = (req, res, next) => {
    if (req.adminUser?.role !== 'owner') return res.status(403).json({ message: 'Only the owner can do that.' });
    next();
};

/** Can this account change content for this game and deck? (The owner can change anything.) */
export const canManage = (user, game, deck) =>
    user.role === 'owner' || user.access.some((a) => a.game === game && a.deck === deck);

// ---------- GET /api/admin/me ----------
export const me = (req, res) => res.json({ user: req.adminUser.toSafe() });
