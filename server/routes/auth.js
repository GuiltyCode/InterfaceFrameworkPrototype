'use strict';
const express = require('express');
const bcrypt  = require('bcrypt');
const { usersPool } = require('../db');

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
        return res.status(400).json({ error: 'All fields are required.' });

    if (password.length < 6)
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    try {
        const hash = await bcrypt.hash(password, 12);

        const [result] = await usersPool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username.trim(), email.trim().toLowerCase(), hash]
        );

        const userId = result.insertId;

        req.session.user = {
            id:       userId,
            username: username.trim(),
            email:    email.trim().toLowerCase(),
            role:     'User'
        };

        return res.json({ username: username.trim(), email: email.trim().toLowerCase(), role: 'User' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'An account with that email already exists.' });
        console.error('[register]', err);
        return res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: 'Email and password are required.' });

    try {
        const [[user]] = await usersPool.execute(
            'SELECT id, username, email, password, role FROM users WHERE email = ?',
            [email.trim().toLowerCase()]
        );

        if (!user)
            return res.status(401).json({ error: 'Incorrect email or password.' });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: 'Incorrect email or password.' });

        req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };

        return res.json({ username: user.username, email: user.email, role: user.role });
    } catch (err) {
        console.error('[login]', err);
        return res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ ok: true });
    });
});

// ── GET /api/auth/session ─────────────────────────────────────────────────────
router.get('/session', (req, res) => {
    if (req.session && req.session.user)
        return res.json(req.session.user);
    return res.status(401).json({ error: 'Not authenticated.' });
});

module.exports = router;
