import express from 'express'
import {} from 'dotenv/config'
import routes from './routes/routes.js'
import path from 'path'
import cors from 'cors'
import { fileURLToPath } from 'url' // 🎣 Required for absolute pathing in ES Modules

const app = express()

// 🛠️ Set up absolute directory pathing
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Global Security Middleware - UPDATED FOR RENDER
// This explicitly allows your iFast domain to safely request data from Render
app.use(cors({
  origin: ['https://game-temple.org', 'https://www.game-temple.org', 'http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}))

// 2. Request Parsers
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// 3. Serve Frontend Static Assets with Cache Revalidation Headers
// (We leave this here so your local machine testing doesn't break!)
app.use(express.static('public', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');
    }
  }
}));

// 4. Backend API Routes
app.use('/api', routes)

// 5. Catch-all route to serve your Webpack frontend safely
app.get('*', (req, res, next) => {
    if (req.path.includes('.')) {
        return next();
    }

    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

export default app