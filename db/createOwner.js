// 🔐 Creates the owner account for game-temple.org/admin (or resets an existing owner's password).
//
//   npm run admin:owner
//
// It asks for a username and password in the terminal (the password isn't shown as you type),
// so the password never ends up in a file. Every other account is made by the owner on the
// admin site's Users page.
import "dotenv/config";
import readline from "readline";
import mongoose from "mongoose";
import AdminUser from "../models/AdminUser.js";
import { hashPassword, passwordProblem, cleanPassword } from "../controllers/admin_auth.js";

const ask = (question, hidden = false) => new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
        // Don't echo the password back to the screen
        rl._writeToOutput = (text) => { if (text.includes(question)) rl.output.write(text); };
    }
    rl.question(question, (answer) => {
        rl.close();
        if (hidden) process.stdout.write('\n');
        resolve(answer);
    });
});

const run = async () => {
    const username = (await ask('Owner username: ')).trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) throw new Error('Usernames are 3 to 32 lowercase letters, numbers, dots, dashes or underscores.');
    const password = cleanPassword(await ask('Password (10+ characters): ', true));
    const problem = passwordProblem(password);
    if (problem) throw new Error(problem);
    if (password !== cleanPassword(await ask('Type it again: ', true))) throw new Error("The passwords didn't match.");

    await mongoose.connect(process.env.DB || process.env.DATABASE_ACCESS);
    const existing = await AdminUser.findOne({ username });
    if (existing) {
        existing.passwordHash = await hashPassword(password);
        existing.role = 'owner';
        existing.active = true;
        existing.tokenVersion += 1;
        await existing.save();
        console.log(`Updated "${username}": owner, new password.`);
    } else {
        await AdminUser.create({ username, displayName: username, passwordHash: await hashPassword(password), role: 'owner' });
        console.log(`Created the owner account "${username}". Sign in at game-temple.org/admin.`);
    }
    await mongoose.disconnect();
};

run().catch(async (err) => {
    console.error('Could not create the owner:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
