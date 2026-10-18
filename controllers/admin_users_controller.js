import AdminUser from "../models/AdminUser.js";
import { hashPassword, passwordProblem } from "./admin_auth.js";
import { ROLES, isManagedGame, DECK_ID } from "../db/adminCatalog.js";

// 👥 Managing admin accounts (owner only): add, change access, reset passwords, remove.

// Tidy a list of { game, deck } pairs from the screen: known games, valid deck ids, no repeats
const cleanAccess = (access) => {
    if (!Array.isArray(access)) return [];
    const seen = new Set();
    return access
        .map((a) => ({ game: String(a?.game || ''), deck: String(a?.deck || '').trim().toLowerCase() }))
        .filter((a) => isManagedGame(a.game) && DECK_ID.test(a.deck))
        .filter((a) => {
            const key = `${a.game}:${a.deck}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
};

const ownerCount = () => AdminUser.countDocuments({ role: 'owner', active: true });

// GET /api/admin/users
export const listUsers = async (req, res) => {
    const users = await AdminUser.find().sort({ role: -1, username: 1 });
    res.json({ users: users.map((u) => u.toSafe()) });
};

// POST /api/admin/users { username, displayName, password, role, access }
export const createUser = async (req, res) => {
    const { username, displayName, password, role = 'admin', access } = req.body || {};
    const problem = passwordProblem(password);
    if (problem) return res.status(400).json({ message: problem });
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Unknown role.' });
    const name = String(username || '').trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,32}$/.test(name)) return res.status(400).json({ message: 'Usernames are 3 to 32 lowercase letters, numbers, dots, dashes or underscores.' });
    if (await AdminUser.exists({ username: name })) return res.status(409).json({ message: 'That username is taken.' });

    const user = await AdminUser.create({
        username: name,
        displayName: String(displayName || '').trim() || name,
        passwordHash: await hashPassword(password),
        role,
        access: role === 'owner' ? [] : cleanAccess(access),
    });
    res.status(201).json({ user: user.toSafe() });
};

// PATCH /api/admin/users/:id { displayName?, role?, access?, active?, password? }
export const updateUser = async (req, res) => {
    const user = await AdminUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'No such account.' });
    const { displayName, role, access, active, password } = req.body || {};
    const isSelf = String(user._id) === String(req.adminUser._id);

    // Never leave the site without an active owner
    const losingOwner = user.role === 'owner' && user.active && ((role && role !== 'owner') || active === false);
    if (losingOwner && await ownerCount() <= 1) {
        return res.status(400).json({ message: 'There has to be at least one active owner.' });
    }

    if (displayName !== undefined) user.displayName = String(displayName).trim().slice(0, 60) || user.username;
    if (role !== undefined) {
        if (!ROLES.includes(role)) return res.status(400).json({ message: 'Unknown role.' });
        user.role = role;
    }
    if (access !== undefined) user.access = user.role === 'owner' ? [] : cleanAccess(access);
    if (active !== undefined) {
        if (isSelf && active === false) return res.status(400).json({ message: "You can't deactivate your own account." });
        user.active = !!active;
        if (!user.active) user.tokenVersion += 1;   // signs them out everywhere
    }
    if (password !== undefined) {
        const problem = passwordProblem(password);
        if (problem) return res.status(400).json({ message: problem });
        user.passwordHash = await hashPassword(password);
        if (!isSelf) user.tokenVersion += 1;        // a reset signs them out everywhere
    }
    await user.save();
    res.json({ user: user.toSafe() });
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
    const user = await AdminUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'No such account.' });
    if (String(user._id) === String(req.adminUser._id)) return res.status(400).json({ message: "You can't delete your own account." });
    if (user.role === 'owner' && user.active && await ownerCount() <= 1) {
        return res.status(400).json({ message: 'There has to be at least one active owner.' });
    }
    await user.deleteOne();
    res.json({ deleted: true });
};
