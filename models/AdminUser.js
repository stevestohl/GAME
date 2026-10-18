import mongoose from "mongoose";
import { ROLES } from "../db/adminCatalog.js";

// 🔐 Someone who can sign in at game-temple.org/admin (collection `adminusers`).
//   role 'owner' -> full access to everything, including other admin accounts
//   role 'admin' -> only the games and decks listed in `access`
// Passwords are never stored: only a bcrypt hash. Accounts are made by the owner
// (on the Users page, or `npm run admin:owner` for the owner account itself).
const AdminUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9._-]{3,32}$/ },
    displayName: { type: String, trim: true, maxlength: 60 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'admin' },
    access: {
        type: [{
            _id: false,
            game: { type: String, required: true },
            deck: { type: String, required: true },
        }],
        default: [],
    },
    active: { type: Boolean, default: true },

    // Sign-in bookkeeping
    lastLoginAt: { type: Date },
    tokenVersion: { type: Number, default: 0 },   // bump to sign this account out everywhere
}, {
    collection: 'adminusers',
    timestamps: true,
});

// What the admin screens may see about an account (never the password hash)
AdminUserSchema.methods.toSafe = function toSafe() {
    return {
        id: String(this._id),
        username: this.username,
        displayName: this.displayName || this.username,
        role: this.role,
        access: this.access.map(({ game, deck }) => ({ game, deck })),
        active: this.active,
        lastLoginAt: this.lastLoginAt,
        createdAt: this.createdAt,
    };
};

export default mongoose.model('AdminUser', AdminUserSchema);
