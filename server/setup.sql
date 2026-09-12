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
