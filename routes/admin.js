import express from 'express'
import { login, me, requireAdmin, requireOwner } from '../controllers/admin_auth.js'
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/admin_users_controller.js'
import { MANAGED_GAMES } from '../db/adminCatalog.js'
import { listSources, listContent, createContent, updateContent, deleteContent } from '../controllers/admin_content_controller.js'

// 🔐 The admin API behind game-temple.org/admin. Everything except signing in needs a valid token.
const router = express.Router()

// Small helper so a failed database call returns a clean error instead of hanging the request
const safe = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch((err) => {
    console.error('[Admin]', err.message);
    res.status(500).json({ message: 'Something went wrong on the server.' });
});

router.post('/login', safe(login))

router.use(safe(requireAdmin))
router.get('/me', me)
router.get('/catalog', (req, res) => res.json({ games: MANAGED_GAMES }))

// Content: everyone signed in, limited to the decks they manage (checked inside each handler)
router.get('/content', listSources)
router.get('/content/:source', safe(listContent))
router.post('/content/:source', safe(createContent))
router.patch('/content/:source/:id', safe(updateContent))
router.delete('/content/:source/:id', safe(deleteContent))

// Accounts: owner only
router.get('/users', requireOwner, safe(listUsers))
router.post('/users', requireOwner, safe(createUser))
router.patch('/users/:id', requireOwner, safe(updateUser))
router.delete('/users/:id', requireOwner, safe(deleteUser))

export default router
