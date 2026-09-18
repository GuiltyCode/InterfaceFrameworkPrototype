'use strict';
const express = require('express');
const { usersPool } = require('../db');

const router = express.Router();

// ── Auth guard ────────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ error: 'Not authenticated.' });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FRIENDS
// ═══════════════════════════════════════════════════════════════════════════════

// ── GET /api/social/friends ───────────────────────────────────────────────────
// Returns { friends: [...], incoming: [...], outgoing: [...] }
//   friends  = accepted relationships (either direction)
//   incoming = pending requests sent TO me (I can accept/decline)
//   outgoing = pending requests I sent (awaiting their response)
router.get('/friends', requireAuth, async (req, res) => {
    const me = req.session.user.id;
    try {
        // Accepted — join to get the other user's name, whichever side they're on
        const [accepted] = await usersPool.execute(
            `SELECT f.id AS rel_id,
                    CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END AS friend_id,
                    u.username
               FROM friends f
               JOIN users u
                 ON u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
              WHERE f.status = 'accepted'
                AND (f.requester_id = ? OR f.addressee_id = ?)
              ORDER BY u.username`,
            [me, me, me, me]
        );

        // Incoming pending — someone requested me
        const [incoming] = await usersPool.execute(
            `SELECT f.id AS rel_id, u.id AS friend_id, u.username
               FROM friends f
               JOIN users u ON u.id = f.requester_id
              WHERE f.status = 'pending' AND f.addressee_id = ?
              ORDER BY u.username`,
            [me]
        );

        // Outgoing pending — I requested someone
        const [outgoing] = await usersPool.execute(
            `SELECT f.id AS rel_id, u.id AS friend_id, u.username
               FROM friends f
               JOIN users u ON u.id = f.addressee_id
              WHERE f.status = 'pending' AND f.requester_id = ?
              ORDER BY u.username`,
            [me]
        );

        return res.json({ friends: accepted, incoming: incoming, outgoing: outgoing });
    } catch (err) {
        console.error('[friends GET]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/social/friends/request ──────────────────────────────────────────
// Body: { username }  — send a friend request to a user by username.
router.post('/friends/request', requireAuth, async (req, res) => {
    const me = req.session.user.id;
    const { username } = req.body;

    if (!username || !username.trim())
        return res.status(400).json({ error: 'Username is required.' });

    try {
        // Find target user
        const [[target]] = await usersPool.execute(
            'SELECT id, username FROM users WHERE username = ? LIMIT 1',
            [username.trim()]
        );

        if (!target)
            return res.status(404).json({ error: 'No player found with that username.' });

        if (target.id === me)
            return res.status(400).json({ error: "You can't add yourself." });

        // Already related in either direction?
        const [[existing]] = await usersPool.execute(
            `SELECT id, status, requester_id, addressee_id FROM friends
              WHERE (requester_id = ? AND addressee_id = ?)
                 OR (requester_id = ? AND addressee_id = ?)
              LIMIT 1`,
            [me, target.id, target.id, me]
        );

        if (existing) {
            if (existing.status === 'accepted')
                return res.status(409).json({ error: 'You are already friends.' });

            // If THEY already requested ME, accept it instead of duplicating
            if (existing.addressee_id === me) {
                await usersPool.execute(
                    "UPDATE friends SET status = 'accepted' WHERE id = ?",
                    [existing.id]
                );
                return res.json({ ok: true, status: 'accepted' });
            }
            return res.status(409).json({ error: 'Friend request already sent.' });
        }

        await usersPool.execute(
            "INSERT INTO friends (requester_id, addressee_id, status) VALUES (?, ?, 'pending')",
            [me, target.id]
        );

        return res.json({ ok: true, status: 'pending' });
    } catch (err) {
        console.error('[friends request]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/social/friends/accept ───────────────────────────────────────────
// Body: { relId }  — accept an incoming pending request.
router.post('/friends/accept', requireAuth, async (req, res) => {
    const me = req.session.user.id;
    const { relId } = req.body;

    try {
        const [result] = await usersPool.execute(
            "UPDATE friends SET status = 'accepted' WHERE id = ? AND addressee_id = ? AND status = 'pending'",
            [relId, me]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'No matching request.' });
        return res.json({ ok: true });
    } catch (err) {
        console.error('[friends accept]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/social/friends/remove ───────────────────────────────────────────
// Body: { relId }  — remove a friend, decline an incoming, or cancel an outgoing.
// Works as long as the logged-in user is on either side of the relationship.
router.post('/friends/remove', requireAuth, async (req, res) => {
    const me = req.session.user.id;
    const { relId } = req.body;

    try {
        const [result] = await usersPool.execute(
            'DELETE FROM friends WHERE id = ? AND (requester_id = ? OR addressee_id = ?)',
            [relId, me, me]
        );
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'No matching relationship.' });
        return res.json({ ok: true });
    } catch (err) {
        console.error('[friends remove]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});


// ═══════════════════════════════════════════════════════════════════════════════
//  PLAYER SQUADS (multiplayer)
// ═══════════════════════════════════════════════════════════════════════════════

// Helper: the squad this user OWNS (leads). Every player always has one.
async function getOwnSquad(userId) {
    const [[row]] = await usersPool.execute(
        `SELECT s.id, s.name, s.leader_id, 'Leader' AS role
           FROM squads s
          WHERE s.leader_id = ?
          LIMIT 1`,
        [userId]
    );
    return row || null;
}

// Helper: the squad this user is CURRENTLY OPERATING IN.
// If they've joined someone else's squad as a Member, that takes priority and
// their own squad is hidden. Otherwise it's their own squad.
async function getActiveSquad(userId) {
    // A Member row in a squad NOT led by this user = a joined (guest) squad.
    const [[joined]] = await usersPool.execute(
        `SELECT s.id, s.name, s.leader_id, sp.role
           FROM squad_players sp
           JOIN squads s ON s.id = sp.squad_id
          WHERE sp.user_id = ? AND s.leader_id <> ?
          LIMIT 1`,
        [userId, userId]
    );
    if (joined) return joined;

    return await getOwnSquad(userId);
}

// Helper: make sure the user OWNS a squad. Every player always has one.
// This does NOT touch any squad they may have joined as a guest.
async function ensureSquad(userId, username) {
    let own = await getOwnSquad(userId);
    if (own) return own;

    const label = (username || 'New') + "'s Squad";
    const [sq] = await usersPool.execute(
        'INSERT INTO squads (leader_id, name) VALUES (?, ?)',
        [userId, label]
    );
    // Add the leader as a player row in their own squad.
    await usersPool.execute(
        "INSERT INTO squad_players (squad_id, user_id, role) VALUES (?, ?, 'Leader')",
        [sq.insertId, userId]
    );
    return await getOwnSquad(userId);
}

// ── GET /api/social/squad ─────────────────────────────────────────────────────
// Returns the player squad the user is in, its members, and pending invites to them.
router.get('/squad', requireAuth, async (req, res) => {
    const me = req.session.user.id;
    try {
        // Guarantee the player owns a squad, then figure out which one is active.
        await ensureSquad(me, req.session.user.username);
        const squad = await getActiveSquad(me);

        // isGuest = the player is in someone else's squad (their own is hidden).
        const isGuest = squad && squad.leader_id !== me;

        // Invites sent to me (regardless of whether I'm in a squad)
        const [invites] = await usersPool.execute(
            `SELECT si.id AS invite_id, si.squad_id, s.name AS squad_name, u.username AS inviter
               FROM squad_invites si
               JOIN squads s ON s.id = si.squad_id
               JOIN users u  ON u.id = si.inviter_id
              WHERE si.invitee_id = ? AND si.status = 'pending'`,
            [me]
        );

        if (!squad) return res.json({ squad: null, members: [], invites: invites, isGuest: false });

        const [members] = await usersPool.execute(
            `SELECT sp.user_id, sp.role, u.username
               FROM squad_players sp
               JOIN users u ON u.id = sp.user_id
              WHERE sp.squad_id = ?
              ORDER BY sp.role DESC, u.username`,
            [squad.id]
        );

        return res.json({ squad: squad, members: members, invites: invites, isGuest: isGuest });
    } catch (err) {
        console.error('[squad GET]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/social/squad/rename ─────────────────────────────────────────────
// Body: { name }  — rename your OWN squad. Only the leader can rename.
router.post('/squad/rename', requireAuth, async (req, res) => {
    const me = req.session.user.id;
    const name = (req.body.name || '').trim();

    if (!name)
        return res.status(400).json({ error: 'Squad name is required.' });
    if (name.length > 128)
        return res.status(400).json({ error: 'Squad name is too long (max 128).' });

    try {
        // Guarantee the player owns a squad, then rename it.
        const squad = await ensureSquad(me, req.session.user.username);

        await usersPool.execute(
            'UPDATE squads SET name = ? WHERE id = ? AND leader_id = ?',
            [name, squad.id, me]
        );

        return res.json({ ok: true, name: name });
    } catch (err) {
        console.error('[squad rename]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/social/squad/invite ─────────────────────────────────────────────
// Body: { username }  — leader invites a friend (by username) to their squad.
router.post('/squad/invite', requireAuth, async (req, res) => {
    const me = req.session.user.id;
    const { username } = req.body;

    if (!username || !username.trim())
        return res.status(400).json({ error: 'Username is required.' });

    try {
        // Invites always go to the inviter's OWN squad, guaranteed to exist.
        const squad = await ensureSquad(me, req.session.user.username);

        // If the inviter is currently a guest in someone else's squad, they
        // can't invite into their own hidden squad.
        const active = await getActiveSquad(me);
        if (active && active.leader_id !== me)
            return res.status(403).json({ error: 'Leave your current squad before inviting to your own.' });

        const [[target]] = await usersPool.execute(
            'SELECT id FROM users WHERE username = ? LIMIT 1',
            [username.trim()]
        );
        if (!target)             return res.status(404).json({ error: 'No player found with that username.' });
        if (target.id === me)    return res.status(400).json({ error: "You can't invite yourself." });

        // Already a member?
        const [[member]] = await usersPool.execute(
            'SELECT id FROM squad_players WHERE squad_id = ? AND user_id = ? LIMIT 1',
            [squad.id, target.id]
        );
        if (member)              return res.status(409).json({ error: 'They are already in the squad.' });

        await usersPool.execute(
            `INSERT INTO squad_invites (squad_id, inviter_id, invitee_id, status)
             VALUES (?, ?, ?, 'pending')
             ON DUPLICATE KEY UPDATE status = 'pending', inviter_id = VALUES(inviter_id)`,
            [squad.id, me, target.id]
        );

        return res.json({ ok: true });
    } catch (err) {
        console.error('[squad invite]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/social/squad/respond ────────────────────────────────────────────
// Body: { inviteId, accept: true|false }
router.post('/squad/respond', requireAuth, async (req, res) => {
    const me = req.session.user.id;
    const { inviteId, accept } = req.body;

    try {
        const [[invite]] = await usersPool.execute(
            "SELECT id, squad_id FROM squad_invites WHERE id = ? AND invitee_id = ? AND status = 'pending' LIMIT 1",
            [inviteId, me]
        );
        if (!invite) return res.status(404).json({ error: 'No matching invite.' });

        if (!accept) {
            await usersPool.execute(
                "UPDATE squad_invites SET status = 'declined' WHERE id = ?",
                [invite.id]
            );
            return res.json({ ok: true, joined: false });
        }

        // Accept — the player keeps their own squad but joins the other one as
        // a guest Member. Block if they're already a guest in some squad.
        const active = await getActiveSquad(me);
        if (active && active.leader_id !== me)
            return res.status(409).json({ error: 'Leave your current squad first.' });

        // Don't allow joining your own squad as a member.
        const [[targetSquad]] = await usersPool.execute(
            'SELECT leader_id FROM squads WHERE id = ? LIMIT 1',
            [invite.squad_id]
        );
        if (targetSquad && targetSquad.leader_id === me)
            return res.status(400).json({ error: "That's your own squad." });

        await usersPool.execute(
            "INSERT INTO squad_players (squad_id, user_id, role) VALUES (?, ?, 'Member')",
            [invite.squad_id, me]
        );
        await usersPool.execute(
            "UPDATE squad_invites SET status = 'accepted' WHERE id = ?",
            [invite.id]
        );

        return res.json({ ok: true, joined: true });
    } catch (err) {
        console.error('[squad respond]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/social/squad/leave ──────────────────────────────────────────────
// Leave a squad you JOINED as a guest, returning to your own squad.
// You cannot "leave" your own squad (every player always has one).
router.post('/squad/leave', requireAuth, async (req, res) => {
    const me = req.session.user.id;
    try {
        const active = await getActiveSquad(me);

        // Not in anyone else's squad — nothing to leave.
        if (!active || active.leader_id === me)
            return res.status(400).json({ error: 'You are in your own squad.' });

        // Remove the guest Member row for the joined squad.
        await usersPool.execute(
            'DELETE FROM squad_players WHERE squad_id = ? AND user_id = ?',
            [active.id, me]
        );

        return res.json({ ok: true, left: true });
    } catch (err) {
        console.error('[squad leave]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
