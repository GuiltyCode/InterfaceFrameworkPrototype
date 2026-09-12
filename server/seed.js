'use strict';
// ── SteelfangsDen — Database Seed ────────────────────────────────────────────
// Creates the default Admin account.
// Run ONCE after setup.sql:  node server/seed.js
//
// Default credentials:
//   Email:    admin@steelfangsden.local
//   Password: test123
//   Role:     Admin
//
// IMPORTANT: Change the admin password after first login.
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const bcrypt = require('bcrypt');
const { usersPool } = require('./db');

async function seed() {
    const adminEmail    = 'admin@steelfangsden.local';
    const adminUsername = 'Admin';
    const adminPassword = 'test123';
    const adminRole     = 'Admin';

    try {
        // Check if admin already exists
        const [[existing]] = await usersPool.execute(
            'SELECT id FROM users WHERE email = ?',
            [adminEmail]
        );

        if (existing) {
            console.log('✅ Admin account already exists — skipping.');
            process.exit(0);
        }

        const hash = await bcrypt.hash(adminPassword, 12);

        await usersPool.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [adminUsername, adminEmail, hash, adminRole]
        );

        console.log('✅ Admin account created successfully.');
        console.log('   Email:    ' + adminEmail);
        console.log('   Password: ' + adminPassword);
        console.log('   Role:     ' + adminRole);
        console.log('');
        console.log('⚠️  Change the admin password after first login!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
