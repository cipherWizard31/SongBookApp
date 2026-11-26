# SelahKignit Web Controller — Implementation Plan & Checklist

A Next.js admin dashboard and backend controller for **SelahKignit** to manage users, track install/usage counts, push universal updates, and maintain the global song dictionary.

---

## 1. Project Setup & Architecture
- [x] Initialize Next.js (App Router, TypeScript) inside `web/`
- [x] Configure styling & design system (8pt grid spacing, semantic color tokens, dark/light mode support)
- [x] Set up environment variables (`.env.local`, `.env.example`) for database, auth, and API keys
- [x] Configure ESLint, Prettier, and TypeScript strict mode
- [x] Set up admin authentication (e.g., NextAuth / Clerk / Supabase Auth) with protected dashboard routes

## 2. Database & Backend API
- [x] Choose and configure database (e.g., Supabase / PostgreSQL / Firebase / Prisma)
- [x] Design schema for:
  - [x] `users` / `devices` (anonymous or authenticated install IDs, platform, app version, last seen, status/banned)
  - [x] `app_updates` (version, release notes, min supported version, force update flag, download/store URL, active status)
  - [x] `announcements` (title, message, type, target version, active window)
  - [x] `songs` (title, artist, kignit/scale, lyrics, chords, tags, version/updated_at, published status)
  - [x] `dictionary_versions` (incremental version number or hash for efficient mobile syncing)
- [x] Create REST / Route Handler API endpoints (`/api/...`) for both the Web Dashboard (admin-protected) and Mobile App (public/API-key-protected)

## 3. User Counting & Control Dashboard
- [x] **Overview Metrics**
  - [x] Total installs / registered users count
  - [x] Daily / Monthly Active Users (DAU / MAU)
  - [x] Platform breakdown (Android) & App Version distribution chart
- [x] **User Management Table**
  - [x] Search & filter users by ID, platform, app version, or status
  - [x] View user details (first seen, last active, device info)
  - [x] User controls: enable/disable access, revoke/ban device, or flag accounts

## 4. Universal Updates & Remote Config
- [x] **Update Manager UI**
  - [x] Create/edit update releases (target version, changelog, force vs. optional update toggle)
  - [x] Set minimum required app version to block outdated clients
- [x] **In-App Announcements / Banners**
  - [x] Publish global notices (maintenance, new song packs, general news)
  - [x] Schedule start/end dates for announcements
- [ ] **Feature Flags**
  - [ ] Toggle app features remotely without needing an app store release

## 5. Global Song Dictionary
- [x] **Song Library CRUD**
  - [x] List all global songs with search, filter by Kignit/scale, and publish status
  - [x] Add/Edit song form (title, artist, kignit, lyrics, chord/notation data, tags)
  - [x] Bulk import/export (JSON / CSV) for migrating existing songs
  - [x] Soft delete / archive songs
- [x] **Dictionary Syncing**
  - [x] Track dictionary version/timestamp so the mobile app only downloads deltas or updates when changed
  - [ ] Preview how songs will render in the mobile app

## 6. Mobile App Integration (`SelahKignit` Expo App)
- [x] Add lightweight telemetry/heartbeat on app launch (registers/updates user count & last seen)
- [x] Add startup check against `/api/config` for universal updates, force-update modal, and announcements
- [x] Add Global Dictionary sync service (fetch initial songs on install, cache locally, and sync updates in background)
- [ ] Handle blocked/disabled user state gracefully

## 7. Security, Testing & Deployment
- [ ] Add rate limiting and API key/signature verification for mobile endpoints
- [ ] Protect all admin mutations with server-side session & role checks
- [ ] Test API endpoints and sync logic
- [ ] Deploy Next.js app (e.g., Vercel) and connect production database

