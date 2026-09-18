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

        // Ensure the player has a player-squad and is its Leader.
        // Every player always has an active squad.
        const [[ownedSquad]] = await usersPool.execute(
            'SELECT id FROM squads WHERE leader_id = ? LIMIT 1',
            [userId]
        );

        if (!ownedSquad) {
            // Only create if this user isn't already in someone else's squad.
            const [[inSquad]] = await usersPool.execute(
                'SELECT id FROM squad_players WHERE user_id = ? LIMIT 1',
                [userId]
            );

            if (!inSquad) {
                const [sq] = await usersPool.execute(
                    'INSERT INTO squads (leader_id, name) VALUES (?, ?)',
                    [userId, name + "'s Squad"]
                );
                await usersPool.execute(
                    "INSERT INTO squad_players (squad_id, user_id, role) VALUES (?, ?, 'Leader')",
                    [sq.insertId, userId]
                );
            }
        }

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

// ── Helper: get the logged-in user's leader character id, or null ─────────────
async function getLeaderCharId(userId) {
    const [[charIndex]] = await usersPool.execute(
        'SELECT id FROM characters WHERE user_id = ? LIMIT 1',
        [userId]
    );
    return charIndex ? charIndex.id : null;
}

// ── GET /api/character/squad ──────────────────────────────────────────────────
// Returns an array of up to 4 squad members (indexed by slot), null in empty slots.
router.get('/squad', requireAuth, async (req, res) => {
    try {
        const leaderId = await getLeaderCharId(req.session.user.id);
        if (!leaderId) return res.json([null, null, null, null]);

        const [rows] = await charsPool.execute(
            'SELECT * FROM squad_members WHERE leader_character_id = ? ORDER BY slot',
            [leaderId]
        );

        const squad = [null, null, null, null];
        rows.forEach(function (m) {
            if (m.slot >= 0 && m.slot < 4) {
                squad[m.slot] = {
                    id:         m.id,
                    slot:       m.slot,
                    name:       m.name,
                    race:       m.race,
                    cls:        m.cls,
                    level:      m.level,
                    hp:         m.hp,
                    ap:         m.ap,
                    abilities:  typeof m.abilities === 'string' ? JSON.parse(m.abilities) : m.abilities,
                    mobileSuit: m.mobile_suit
                };
            }
        });

        return res.json(squad);
    } catch (err) {
        console.error('[squad GET]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/character/squad/recruit ─────────────────────────────────────────
// Recruit an NPC into the FIRST available slot (0..3). Server picks the slot.
router.post('/squad/recruit', requireAuth, async (req, res) => {
    const { name, race, cls, level, hp, ap, abilities, mobileSuit } = req.body;
    if (!name)
        return res.status(400).json({ error: 'name is required.' });

    try {
        const leaderId = await getLeaderCharId(req.session.user.id);
        if (!leaderId)
            return res.status(404).json({ error: 'Create your own character first.' });

        // Find occupied slots
        const [rows] = await charsPool.execute(
            'SELECT slot FROM squad_members WHERE leader_character_id = ?',
            [leaderId]
        );
        const used = rows.map(function (r) { return r.slot; });

        let freeSlot = -1;
        for (let s = 0; s < 4; s++) {
            if (used.indexOf(s) === -1) { freeSlot = s; break; }
        }
        if (freeSlot === -1)
            return res.status(409).json({ error: 'Squad is full (4/4).' });

        await charsPool.execute(
            `INSERT INTO squad_members
                (leader_character_id, slot, name, race, cls, level, hp, ap, abilities, mobile_suit)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                leaderId, freeSlot, name,
                race || 'Spacenoid',
                cls || 'Fighter',
                level || 1,
                hp || 10,
                ap || 10,
                JSON.stringify(abilities || {}),
                mobileSuit || null
            ]
        );

        return res.json({ ok: true, slot: freeSlot });
    } catch (err) {
        console.error('[squad recruit]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/character/squad ─────────────────────────────────────────────────
// Recruit or update a squad member in a given slot (0..3).
router.post('/squad', requireAuth, async (req, res) => {
    const { slot, name, race, cls, level, hp, ap, abilities, mobileSuit } = req.body;

    if (slot === undefined || slot < 0 || slot > 3)
        return res.status(400).json({ error: 'slot must be 0..3.' });
    if (!name)
        return res.status(400).json({ error: 'name is required.' });

    try {
        const leaderId = await getLeaderCharId(req.session.user.id);
        if (!leaderId)
            return res.status(404).json({ error: 'Create your own character first.' });

        await charsPool.execute(
            `INSERT INTO squad_members
                (leader_character_id, slot, name, race, cls, level, hp, ap, abilities, mobile_suit)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                name        = VALUES(name),
                race        = VALUES(race),
                cls         = VALUES(cls),
                level       = VALUES(level),
                hp          = VALUES(hp),
                ap          = VALUES(ap),
                abilities   = VALUES(abilities),
                mobile_suit = VALUES(mobile_suit)`,
            [
                leaderId, slot, name,
                race || 'Spacenoid',
                cls || 'Fighter',
                level || 1,
                hp || 10,
                ap || 10,
                JSON.stringify(abilities || {}),
                mobileSuit || null
            ]
        );

        return res.json({ ok: true, slot: slot });
    } catch (err) {
        console.error('[squad POST]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── DELETE /api/character/squad/:slot ─────────────────────────────────────────
// Dismiss a squad member from a slot.
router.delete('/squad/:slot', requireAuth, async (req, res) => {
    const slot = parseInt(req.params.slot, 10);
    if (isNaN(slot) || slot < 0 || slot > 3)
        return res.status(400).json({ error: 'slot must be 0..3.' });

    try {
        const leaderId = await getLeaderCharId(req.session.user.id);
        if (!leaderId) return res.json({ ok: true });

        await charsPool.execute(
            'DELETE FROM squad_members WHERE leader_character_id = ? AND slot = ?',
            [leaderId, slot]
        );

        return res.json({ ok: true });
    } catch (err) {
        console.error('[squad DELETE]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
