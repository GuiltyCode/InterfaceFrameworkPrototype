'use strict';
require('dotenv').config();

const express  = require('express');
const session  = require('express-session');
const cors     = require('cors');
const path     = require('path');

const authRouter      = require('./routes/auth');
const characterRouter = require('./routes/character');
const socialRouter    = require('./routes/social');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());

app.use(cors({
    origin:      true,   // reflect request origin
    credentials: true    // allow cookies cross-origin during dev
}));

app.use(session({
    secret:            process.env.SESSION_SECRET || 'change-this-secret',
    resave:            false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure:   false,        // set true in production with HTTPS
        maxAge:   7 * 24 * 60 * 60 * 1000  // 7 days
    }
}));

// ── API routes ────────────────────────────────────────────────────────────────

app.use('/api/auth',      authRouter);
app.use('/api/character', characterRouter);
app.use('/api/social',    socialRouter);

// ── Serve static files from the www root ─────────────────────────────────────
// This lets the browser hit http://localhost:3000 for all pages.

app.use(express.static(path.join(__dirname, '..')));

// Fallback: serve index.html for any unmatched route
// (must come AFTER all API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`SteelfangsDen server running on http://localhost:${PORT}`);
    console.log(`  Login page : http://localhost:${PORT}/index.html`);
    console.log(`  Desktop    : http://localhost:${PORT}/desktop.html`);
});
