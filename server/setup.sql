-- ============================================================
-- SteelfangsDen — Database Setup
-- Run once: mysql -u root -p < setup.sql
-- ============================================================


-- ── DATABASE 1: User accounts + character index ──────────────
CREATE DATABASE IF NOT EXISTS steelfangsden_users
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE steelfangsden_users;

-- Core user accounts
-- role: 'User' | 'Mod' | 'Admin'
CREATE TABLE IF NOT EXISTS users (
    id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    username     VARCHAR(64)     NOT NULL,
    email        VARCHAR(255)    NOT NULL,
    password     VARCHAR(255)    NOT NULL,   -- bcrypt hash
    role         ENUM('User','Mod','Admin') NOT NULL DEFAULT 'User',
    discord_id   VARCHAR(64)     NULL,       -- future Discord OAuth
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_email (email),
    UNIQUE KEY uq_discord (discord_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Character index: links users to their characters (name + ID only)
CREATE TABLE IF NOT EXISTS characters (
    id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    user_id        INT UNSIGNED  NOT NULL,
    character_name VARCHAR(128)  NOT NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTE: The default Admin account is created by running:
--   node server/seed.js
-- after this SQL file. See setup/Login.html for full instructions.


-- ── Friends / social graph ───────────────────────────────────
-- One row per relationship. Directional request, mutual once accepted.
-- requester_id sends the request to addressee_id.
-- status: 'pending'  = request sent, awaiting response
--         'accepted' = mutual friends
CREATE TABLE IF NOT EXISTS friends (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    requester_id  INT UNSIGNED    NOT NULL,
    addressee_id  INT UNSIGNED    NOT NULL,
    status        ENUM('pending','accepted') NOT NULL DEFAULT 'pending',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pair (requester_id, addressee_id),
    KEY idx_requester (requester_id),
    KEY idx_addressee (addressee_id),
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Player squads (multiplayer) ──────────────────────────────
-- A squad owned by one player (the leader) that other PLAYERS can join.
-- This is separate from the NPC squad_members table in the chars DB.
-- The Guild / Company system will extend this same relationship model.
CREATE TABLE IF NOT EXISTS squads (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    leader_id     INT UNSIGNED    NOT NULL,   -- users.id of the squad leader
    name          VARCHAR(128)    NOT NULL DEFAULT 'New Squad',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_leader (leader_id),
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Player membership in a squad (real accounts, not NPCs).
CREATE TABLE IF NOT EXISTS squad_players (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    squad_id      INT UNSIGNED    NOT NULL,
    user_id       INT UNSIGNED    NOT NULL,
    role          ENUM('Leader','Member') NOT NULL DEFAULT 'Member',
    joined_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_squad_user (squad_id, user_id),
    KEY idx_user (user_id),
    FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pending squad invitations sent to players.
CREATE TABLE IF NOT EXISTS squad_invites (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    squad_id      INT UNSIGNED    NOT NULL,
    inviter_id    INT UNSIGNED    NOT NULL,   -- users.id who sent the invite
    invitee_id    INT UNSIGNED    NOT NULL,   -- users.id being invited
    status        ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_squad_invitee (squad_id, invitee_id),
    KEY idx_invitee (invitee_id),
    FOREIGN KEY (squad_id)   REFERENCES squads(id) ON DELETE CASCADE,
    FOREIGN KEY (inviter_id) REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (invitee_id) REFERENCES users(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ── DATABASE 2: Character data + inventory ────────────────────
CREATE DATABASE IF NOT EXISTS steelfangsden_chars
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE steelfangsden_chars;

-- Full character sheet data
CREATE TABLE IF NOT EXISTS character_data (
    character_id  INT UNSIGNED     NOT NULL,  -- FK to steelfangsden_users.characters.id
    race          VARCHAR(64)      NOT NULL DEFAULT 'Spacenoid',
    cls           VARCHAR(64)      NOT NULL DEFAULT 'Fighter',
    level         TINYINT UNSIGNED NOT NULL DEFAULT 1,
    background    VARCHAR(64)      NOT NULL DEFAULT 'Military',
    hp            SMALLINT UNSIGNED NOT NULL DEFAULT 10,
    ap            SMALLINT UNSIGNED NOT NULL DEFAULT 10,
    prof_bonus    TINYINT UNSIGNED NOT NULL DEFAULT 2,
    traits        TEXT             NULL,
    gilla         INT UNSIGNED     NOT NULL DEFAULT 500,
    abilities     JSON             NOT NULL,  -- {"STR":10,"DEX":10,"CON":10,"INT":10,"WIS":10,"CHA":10}
    mobile_suit   VARCHAR(128)     NULL,
    updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (character_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory slots (future use — weapons, armour, items)
CREATE TABLE IF NOT EXISTS inventory (
    id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    character_id INT UNSIGNED    NOT NULL,
    slot         VARCHAR(64)     NOT NULL,
    item_name    VARCHAR(128)    NOT NULL,
    item_data    JSON            NULL,
    equipped     TINYINT(1)      NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_character (character_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Squad members recruited by a leader character.
-- leader_character_id references steelfangsden_users.characters.id (the player's own character).
-- slot 0-3 for the four squad slots.
CREATE TABLE IF NOT EXISTS squad_members (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    leader_character_id INT UNSIGNED    NOT NULL,
    slot                TINYINT UNSIGNED NOT NULL,   -- 0..3
    name                VARCHAR(128)    NOT NULL,
    race                VARCHAR(64)     NOT NULL DEFAULT 'Spacenoid',
    cls                 VARCHAR(64)     NOT NULL DEFAULT 'Fighter',
    level               TINYINT UNSIGNED NOT NULL DEFAULT 1,
    hp                  SMALLINT UNSIGNED NOT NULL DEFAULT 10,
    ap                  SMALLINT UNSIGNED NOT NULL DEFAULT 10,
    abilities           JSON            NULL,
    mobile_suit         VARCHAR(128)    NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_leader_slot (leader_character_id, slot),
    KEY idx_leader (leader_character_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
