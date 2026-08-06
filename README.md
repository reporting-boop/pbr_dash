# PBR Dashboard — Restructured Project

This is the original single-file `PBR_Dashboard_Final.html` split into
a maintainable multi-file project, wired up to load its data live from
a Google Sheet via Google Apps Script. **See `docs/SETUP.md` for
step-by-step setup — and read the security note in there before
deploying publicly.**

## What changed

| File | What it holds |
|---|---|
| `index.html` | Page shell only — no inline CSS/JS, plus a loading spinner while data fetches |
| `css/style.css` | All styling — unchanged, just extracted |
| `js/app.js` | Login, filtering, sorting, charts, the 80% calculator, the manual "Import Excel" feature — all unchanged, **plus** a new live-data loader |
| `config.js` | The one file you edit after deployment — your Apps Script URL and refresh interval |
| `apps-script/Code.gs` | New — reads your `PBR`/`ANA` sheet tabs and serves them as JSON |

**Removed:** the embedded `SEED` dataset (a ~215 KB block of hardcoded
May-2026 row data baked into the HTML). Nothing else reads a baked-in
dataset anymore — every load fetches current data live.

**Not changed:** the login system, DM credentials, filtering, sorting,
charts, the 80% acts calculator, and the manual Excel-upload feature
— all byte-for-byte the same logic as the original file. The Apps
Script backend parses your Sheet using the *exact* same column
positions and math (percentage conversions, the ANA payout-column
fallback) as the original file's own `handleFile()` Excel importer, so
the numbers will match precisely whichever way the data got there.

## Next steps

Follow `docs/SETUP.md` — and seriously consider the security section
about the plaintext DM passwords before sharing this URL with anyone
outside your team.
