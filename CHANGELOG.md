# Changelog

## 2026-09-11

### 🗄️ Backend — Node.js + MySQL Auth & Character System

Added a full server-side backend replacing the previous localStorage-based
auth and character storage.

#### New files
- `server/package.json` — Express, mysql2, bcrypt, express-session, cors, dotenv
- `server/.env.example` — environment variable template
- `server/setup.sql` — creates `steelfangsden_users` and `steelfangsden_chars` databases with all tables
- `server/seed.js` — seeds default Admin account (email: admin@steelfangsden.local, password: test123)
- `server/db.js` — dual MySQL connection pools (one per database)
- `server/server.js` — Express app; serves static files + mounts API routes
- `server/routes/auth.js` — `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`
- `server/routes/character.js` — `/api/character` (GET/POST), `/api/character/equip`

#### Database schema
- `steelfangsden_users.users` — id, username, email, password (bcrypt), role (User/Mod/Admin), discord_id, created_at
- `steelfangsden_users.characters` — character index linking users to characters
- `steelfangsden_chars.character_data` — full character sheet (race, class, abilities JSON, mobile_suit, gilla, etc.)
- `steelfangsden_chars.inventory` — inventory slots (reserved for future use)

#### User roles
- Added `role` ENUM column: `User` | `Mod` | `Admin`
- New accounts default to `User`
- Seed script creates one `Admin` account
- Role included in session and login API responses

---

### 🔐 Auth — Frontend Migration (localStorage → API)

#### `index.html`
- Removed all localStorage auth logic
- Login form now calls `POST /api/auth/login`
- Register form now calls `POST /api/auth/register`
- Session check on load calls `GET /api/auth/session` — redirects to `desktop.html` if already logged in
- Added loading state to submit buttons
- Redirects to `desktop.html` (was `index2.html`) on success

#### `desktop.html`
- Removed localStorage session guard, replaced with `GET /api/auth/session` fetch on load
- Redirects to `index.html` if not authenticated
- `authLogout()` now calls `POST /api/auth/logout` then redirects to `index.html`
- `renderInvMS()` now fetches active suit via `GET /api/character`
- `msUnequip()` now calls `POST /api/character/equip` with `null`
- Account info panel populated from API session data
- Removed all `localStorage` / `sessionStorage` references

#### `character.html`
- Removed localStorage character read/write
- `refreshChar()` now calls `GET /api/character` to fetch data from MySQL
- `charCreate()` now calls `POST /api/character` to save to MySQL
- `charEdit()` pre-fetches current character from API to populate form
- Creation form pre-fills values when editing an existing character
- Added inline error display in the creation form

#### `msstore.html`
- `msEquip()` now calls `POST /api/character/equip` instead of writing to localStorage
- Removed `getSession()`, `getChar()`, `saveChar()` localStorage helpers

---

### 📄 Setup Documentation

#### New files
- `setup/Login.html` — full backend setup guide covering:
  - Prerequisites (Node.js, MySQL)
  - Running `setup.sql`
  - Running `seed.js` for default admin account
  - `.env` configuration
  - `npm install` dependency table
  - Starting the server
  - Testing checklist with common error messages
  - User roles documentation
  - Discord OAuth2 summary
  - File structure reference
- `setup/discordsetup.html` — Discord OAuth2 setup guide (carried over)

---

### 🏗️ Project Structure

- `Index.html` → renamed `index2.html` → login system extracted to `index.html`
- `index2.html` → renamed `desktop.html`
- Auth overlay removed from desktop page; login is now a standalone page
- `desktop.html` always redirects to `index.html` if no valid server session exists
