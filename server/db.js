'use strict';
require('dotenv').config();
const mysql = require('mysql2/promise');

// ── Pool for steelfangsden_users ─────────────────────────────────────────────
const usersPool = mysql.createPool({
    host:             process.env.DB_HOST     || 'localhost',
    port:             process.env.DB_PORT     || 3306,
    user:             process.env.DB_USER     || 'root',
    password:         process.env.DB_PASSWORD || '',
    database:         'steelfangsden_users',
    waitForConnections: true,
    connectionLimit:  10,
    queueLimit:       0
});

// ── Pool for steelfangsden_chars ─────────────────────────────────────────────
const charsPool = mysql.createPool({
    host:             process.env.DB_HOST     || 'localhost',
    port:             process.env.DB_PORT     || 3306,
    user:             process.env.DB_USER     || 'root',
    password:         process.env.DB_PASSWORD || '',
    database:         'steelfangsden_chars',
    waitForConnections: true,
    connectionLimit:  10,
    queueLimit:       0
});

module.exports = { usersPool, charsPool };
