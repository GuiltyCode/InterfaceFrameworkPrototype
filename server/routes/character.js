'use strict';
const express    = require('express');
const { usersPool, charsPool } = require('../db');

const router = express.Router();

// ── Auth guard middleware ─────────────────────────────────────────────────────
function requireAuth(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ error: 'Not authenticated.' });
}

// ── GET /api/character ────────────────────────────────────────────────────────
// Returns the user's character index entry + full character data, or null.
router.get('/', requireAuth, async (req, res) => {
    const userId = req.session.user.id;

    try {
        // Get the character index entry for this user
        const [[charIndex]] = await usersPool.execute(
            'SELECT id, character_name FROM characters WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (!charIndex) return res.json(null);

        // Get full character data from the chars database
        const [[charData]] = await charsPool.execute(
            'SELECT * FROM character_data WHERE character_id = ?',
            [charIndex.id]
        );

        if (!charData) return res.json(null);

        // Parse abilities JSON if it came back as a string
        const abilities = typeof charData.abilities === 'string'
            ? JSON.parse(charData.abilities)
            : charData.abilities;

        return res.json({
            id:           charIndex.id,
            name:         charIndex.character_name,
            race:         charData.race,
            cls:          charData.cls,
            level:        charData.level,
            background:   charData.background,
            hp:           charData.hp,
            ap:           charData.ap,
            profBonus:    charData.prof_bonus,
            traits:       charData.traits,
            gilla:        charData.gilla,
            abilities:    abilities,
            mobileSuit:   charData.mobile_suit
        });
    } catch (err) {
        console.error('[character GET]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/character ───────────────────────────────────────────────────────
// Create or update the user's character.
router.post('/', requireAuth, async (req, res) => {
    const userId = req.session.user.id;
    const {
        name, race, cls, level, background,
        hp, ap, profBonus, traits, gilla,
        abilities, mobileSuit
    } = req.body;

    if (!name || !cls || !race)
        return res.status(400).json({ error: 'name, cls and race are required.' });

    try {
        // Check if user already has a character index entry
        const [[existing]] = await usersPool.execute(
            'SELECT id FROM characters WHERE user_id = ? LIMIT 1',
            [userId]
        );

        let charId;

        if (existing) {
            // Update the name in the index
            charId = existing.id;
            await usersPool.execute(
                'UPDATE characters SET character_name = ? WHERE id = ?',
                [name, charId]
            );
        } else {
            // Create new index entry
            const [result] = await usersPool.execute(
                'INSERT INTO characters (user_id, character_name) VALUES (?, ?)',
                [userId, name]
            );
            charId = result.insertId;
        }

        // Upsert character data in the chars database
        await charsPool.execute(
            `INSERT INTO character_data
                (character_id, race, cls, level, background, hp, ap, prof_bonus, traits, gilla, abilities, mobile_suit)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                race         = VALUES(race),
                cls          = VALUES(cls),
                level        = VALUES(level),
                background   = VALUES(background),
                hp           = VALUES(hp),
                ap           = VALUES(ap),
                prof_bonus   = VALUES(prof_bonus),
                traits       = VALUES(traits),
                gilla        = VALUES(gilla),
                abilities    = VALUES(abilities),
                mobile_suit  = VALUES(mobile_suit)`,
            [
                charId,
                race,
                cls,
                level || 1,
                background,
                hp,
                ap,
                profBonus || 2,
                traits || null,
                gilla || 500,
                JSON.stringify(abilities || {}),
                mobileSuit || null
            ]
        );

        return res.json({ id: charId, name });
    } catch (err) {
        console.error('[character POST]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/character/equip ─────────────────────────────────────────────────
// Set or clear the active mobile suit.
router.post('/equip', requireAuth, async (req, res) => {
    const userId = req.session.user.id;
    const { mobileSuit } = req.body; // null to unequip

    try {
        const [[charIndex]] = await usersPool.execute(
            'SELECT id FROM characters WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (!charIndex)
            return res.status(404).json({ error: 'No character found. Create one first.' });

        await charsPool.execute(
            'UPDATE character_data SET mobile_suit = ? WHERE character_id = ?',
            [mobileSuit || null, charIndex.id]
        );

        return res.json({ ok: true, mobileSuit: mobileSuit || null });
    } catch (err) {
        console.error('[equip]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
