import "dotenv/config";
import mongoose from "mongoose";

// 🎂 TopCake keeps its content in its own databases on the same MongoDB cluster. The admin site reaches
// them through the connection it already has. (The names can be changed to test on throwaway copies.)
export const topcakeDb = () => mongoose.connection.useDb(process.env.TOPCAKE_DB_NAME || 'topcake', { useCache: true });
export const reflippedDb = () => mongoose.connection.useDb(process.env.TOPCAKE_REFLIPPED_DB_NAME || 'topcake_reflipped', { useCache: true });

// TopCake's own server owns the real models: here a model is only a way to read a collection
export const topcakeModel = (db, name, collection) => db.models[name]
    || db.model(name, new mongoose.Schema({}, { collection, strict: false }));
