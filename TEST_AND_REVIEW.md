# SelahKignit — End-to-End Test & Review Checklist

Use this checklist to test and review both the **Next.js Web Controller** (`web/`) and the **Android Mobile App** (`SelahKignit`).

---

## 1. Web Controller (`web/`) Setup & Database
- [ ] **Environment Variables** (`web/.env.local`):
  - [ ] Set `DATABASE_URL` to your Neon / Vercel Postgres connection string
  - [ ] Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`
  - [ ] Set `MOBILE_API_KEY` (must match `EXPO_PUBLIC_MOBILE_API_KEY` in the mobile app)
- [ ] **Push Schema & Generate Client**:
  ```bash
  cd web
  npx prisma db push
  npx prisma generate
  ```
- [ ] **Build & Lint Check**:
  ```bash
  cd web
  npm run lint
  npm run build
  ```

---

## 2. Web Controller — Auth & Dashboard Review
Start locally with `cd web && npm run dev` (or open your Vercel deployment):
- [X] **Protected Routes**:
  - [X] Visiting `/dashboard` while logged out redirects to `/login`
  - [X] Calling `/api/admin/metrics` while logged out returns `401 Unauthorized`
  - [X] Signing in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` redirects to `/dashboard`
  - [X] Clicking **Sign Out** clears the session cookie and returns to `/login`
- [ ] **Users & Metrics Tab**:
  - [ ] Verify Total Installs, DAU, MAU, and Blocked Devices cards render
  - [ ] Verify Platform Breakdown and App Version Distribution bars render
  - [ ] Search by install ID / version and filter by platform (`android`)
  - [ ] Click **Block** / **Unblock** on a device and confirm status updates
- [ ] **Updates & Notices Tab**:
  - [ ] Publish a new `AppUpdate` with a higher version (e.g., `1.0.1`), release notes, and an Android `.apk` download URL in **Store / download URL**
  - [ ] Toggle **Active / Inactive** on the update
  - [ ] Post an `Announcement` (`info`, `warning`, or `release`) and toggle **Active / Hidden**
- [ ] **Song Dictionary Tab**:
  - [ ] Add a new song (title, artist, kignit, lyrics, chords)
  - [ ] Filter songs by Kignit (`Tizita`, `Bati`, `Ambassel`, `Anchihoye`)
  - [ ] Toggle **Published / Draft**
  - [ ] Click **Export JSON** and verify `selahkignit-dictionary.json` downloads

---

## 3. Mobile App (`SelahKignit` — Android) Review
Set `EXPO_PUBLIC_CONTROLLER_URL` (your Vercel URL or local tunnel) and `EXPO_PUBLIC_MOBILE_API_KEY` before running/building:
- [ ] **Heartbeat & User Counting**:
  - [ ] Launch the app on Android
  - [ ] Confirm a new `DeviceUser` appears in the Web Controller's **Users & Metrics** tab with `platform: android` and `appVersion: 1.0.0`
- [ ] **Startup Update Popup & APK Installer**:
  - [ ] With an active update `v1.0.1` (and a valid `.apk` URL) in the Web Controller, launch the app
  - [ ] Confirm the **Update Available (v1.0.1)** popup appears automatically with release notes
  - [ ] Tap **Install Update** and verify the **0%–100% download progress bar** animates
  - [ ] Verify Android's package installer prompt opens once the download completes
  - [ ] Test **Force Update** enabled: confirm the **Later** button is hidden
- [ ] **Profile → Check for Updates**:
  - [ ] Open **Profile** → tap **Check for Updates**
  - [ ] If a newer version exists, confirm `UpdateModal` opens
  - [ ] If on the latest version, confirm the **Up to Date** alert appears
- [ ] **Global Song Dictionary Sync**:
  - [ ] Publish a song in the Web Controller, restart the app, and verify `/api/mobile/dictionary` syncs and caches the songs in `AsyncStorage`

---

## 4. Vercel Deployment Checklist
- [ ] Connect `web/` as the Root Directory in Vercel
- [ ] Add `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, and `MOBILE_API_KEY` in Vercel Project Environment Variables
- [ ] Deploy and run `npx prisma db push` against the production Neon database
- [ ] Build the Android APK with `EXPO_PUBLIC_CONTROLLER_URL` pointing to the live Vercel domain

