import mongoose from "mongoose";

// ⚙️ Site-wide settings the owner changes in /admin: one document (collection `sitesettings`).
// `hidden`: "couchcast", "couchcast/halloween" or a nav bar tab like "tab:home" -> true (hidden) or false (showing).
// Anything not listed uses its default from db/gameCatalog.js.
const SiteSettingsSchema = new mongoose.Schema({
    _id: { type: String, default: 'site' },
    hidden: { type: Map, of: Boolean, default: {} },
}, {
    collection: 'sitesettings',
    timestamps: true,
});

export default mongoose.model('SiteSettings', SiteSettingsSchema);
