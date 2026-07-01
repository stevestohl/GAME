import express from 'express'
import {} from 'dotenv/config'
import routes from './routes/routes.js'
import path from 'path'
import cors from 'cors'

const app = express()

// 1. Global Security Middleware (Placed first)
app.use(cors())

// 2. Request Parsers (Native Express alternatives to body-parser)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// 3. Serve Frontend Static Assets with Cache-Busting Headers
app.use(express.static('dist', {
  setHeaders: (res, path) => {
    // 🚫 NEVER cache HTML files (forces browser to look for updates)
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      // ⏳ Cache compiled JS, CSS, and images for 1 year
      res.setHeader('Cache-Control', 'public, max-age=31536000'); 
    }
  }
}));

// 4. Backend API Routes
app.use('/api', routes)

// 5. CRITICAL FIX: Catch-all routes serve the compiled index.html out of 'dist'
app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist/index.html'))
})

export default app