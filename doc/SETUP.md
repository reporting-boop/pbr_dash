# PBR Dashboard — Setup & Deployment Guide

This splits the original single-file `PBR_Dashboard_Final.html` into a
maintainable project that loads its PBR/ANA data live from a Google
Sheet via Google Apps Script — the same pattern used for the Refund
Dashboard.

## ⚠️ Security note — read this first

This dashboard's login system (`DM_CREDENTIALS` in `js/app.js`) stores
every DM's username and password **in plain text, in the JavaScript
file that gets sent to every visitor's browser.** Once this is
deployed to a public URL (Vercel, GitHub Pages, etc.), anyone can open
their browser's dev tools, view the page source, and read every DM's
real password.

This restructuring preserves that behavior exactly as it was in the
original file — nothing about the login system was changed. But you
should treat this as **not secure for a public deployment**. Options,
roughly in order of effort:
- Restrict who can reach the URL at all (e.g. put it behind your
  company VPN or a Vercel password-protected preview, if available on
  your plan)
- Move credential checking into Apps Script (the frontend sends the
  username/password to the API, which checks it server-side and
  returns a session token — passwords never ship to the browser).
  Ask and I can build this next.
- At minimum, don't reuse these passwords anywhere else, and treat
  this dashboard's data as effectively public once deployed.

---

## How it fits together

```
Google Sheet ("PBR" tab + "ANA" tab)
      │  (same column layout as your existing PBR/ANA Excel export —
      │   column A = district, B = market, C = doorCode, ... see
      │   the COLUMN LAYOUT comment at the top of Code.gs)
      ▼
Google Apps Script (Code.gs)
  - reads both tabs directly by column position (not header name)
  - builds the same flat row array the dashboard's own
    "Import Excel" button already builds
  - caches it in a Drive file so requests are fast
  - rebuilds near-instantly on any edit (via a fast dirty-flag
    trigger) plus a 15-minute safety-net timer
      │  (JSON array over HTTPS)
      ▼
index.html + config.js + js/app.js
  - fetches the array from the Apps Script Web App URL on load
  - login, filtering, sorting, charts, the 80% calculator — all
    100% unchanged from the original file
```

## Step 1 — Set up your Google Sheet

1. Create a new Google Sheet (or use an existing one).
2. Create a tab named exactly **`PBR`** and/or a tab named exactly
   **`ANA`** (you can have either or both — the dashboard already
   supports having just one).
3. Paste your PBR/ANA export into the matching tab — same layout as
   the Excel file you already use with this dashboard's "Import
   Excel" button: row 1 = headers (any text, not read by the script),
   data starts row 2, columns A onward in this fixed order:

   | Col | Field | Col | Field |
   |---|---|---|---|
   | A | district | L | dailyNeeded100 |
   | B | market | M | dailyNeeded110 |
   | C | doorCode | N | dailyNeeded125 |
   | D | store | O | retention |
   | E | actTarget | P | retTarget |
   | F | dcsActs | Q | retainStatus |
   | G | recentActs | R | actsNeeded100 |
   | H | totalActs | S | actsNeeded110 |
   | I | quotaAttain | T | actsNeeded125 |
   | J | trendingAct | U | payout (PBR) |
   | K | trendPct | V | payout (ANA only) |

   `quotaAttain`, `trendPct`, `retention`, and `retTarget` should be
   entered as fractions (e.g. `1.441` for 144.1%), matching your
   existing export — the dashboard converts them to percentages
   automatically, same as it always has.

## Step 2 — Add the Apps Script backend

1. In your Sheet: **Extensions > Apps Script**.
2. Delete the default `Code.gs` contents and paste in the contents of
   `apps-script/Code.gs` from this project.
3. Select **`runInitialSetup`** from the function dropdown and click
   **Run**. Authorize when prompted (this is your own script running
   under your own account).
4. Check **Executions** in the left sidebar to confirm it logged
   something like `Setup complete. Rows: 501`.

## Step 3 — Deploy as a Web App

1. **Deploy > New deployment** → gear icon → **Web app**.
2. **Execute as:** Me | **Who has access:** Anyone.
3. Click **Deploy**, copy the URL ending in `/exec`.

## Step 4 — Point the dashboard at it

Open `config.js` and paste your URL in:
```js
DATA_SOURCE_URL: "https://script.google.com/macros/s/AKfycb.../exec",
```

## Step 5 — Deploy the frontend (Vercel)

1. Push this whole folder to a GitHub repo (`index.html`, `config.js`,
   and the `css`/`js` folders at the repo root — not nested inside
   another folder).
2. In Vercel: **Add New… → Project** → import the repo.
3. Framework Preset: **Other**. Build command: none. Output directory:
   `.` (root).
4. Deploy. You'll get a `https://<project>.vercel.app` URL.

---

## Keeping data current

- **Automatic:** editing either tab fires the change trigger almost
  immediately, so the next dashboard load (or the 15-minute
  background refresh) picks it up right away — no propagation delay.
- **Force an immediate rebuild:** visit
  `<your Apps Script URL>?rebuild=true` once in a browser tab.
- **Manual override:** the "Import Excel" button in the dashboard
  still works exactly as before, for previewing a file before it's in
  the Sheet.
- **Offline fallback:** the dashboard keeps a copy of the last
  successful load in the browser's `localStorage`.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "CONFIG.DATA_SOURCE_URL is not set" banner | You haven't pasted your Web App URL into `config.js` yet |
| "No PBR or ANA tab was found" error in the Logs | Tab names must be exactly `PBR` and/or `ANA` (case-sensitive) |
| Rows look shifted / wrong field has wrong value | A column got inserted or deleted in your sheet — the parser reads by position, so column order must match the table above exactly |
| Data looks stale | Hit `?rebuild=true` once, or wait for the next 15-minute timer tick |
