/* ===================================================================
   PBR DASHBOARD — APPS SCRIPT BACKEND
   -------------------------------------------------------------------
   What this does:
   1. Reads two tabs from this spreadsheet — "PBR" and "ANA" — using
      the exact same fixed column layout (by position, not header
      name) that the dashboard's in-browser Excel importer already
      expects (see js/app.js -> handleFile()). Column A is index 0,
      B is 1, and so on.
   2. Builds the same flat array of row objects the importer builds,
      tags each with tab:'PBR' or tab:'ANA', and combines them.
   3. Caches the built JSON as a file in Google Drive so repeated
      page loads are fast.
   4. Serves that JSON to the dashboard via doGet().
   5. Rebuilds automatically and near-instantly whenever either tab
      changes (via an onChange trigger + a fast PropertiesService
      flag — no waiting on Drive's metadata timestamp), plus a timed
      safety-net rebuild every AUTO_REBUILD_MINUTES.

   ONE-TIME SETUP — see /docs/SETUP.md for the full walkthrough:
   - Make sure your spreadsheet has tabs named exactly "PBR" and/or
     "ANA", laid out the same way as the Excel file this dashboard's
     "Import Excel" button already accepts (row 1 = headers, data
     from row 2 down, columns A–U in the fixed order documented in
     COLUMN LAYOUT below).
   - Run `runInitialSetup` once from the Apps Script editor
     (Run > runInitialSetup).
   - Deploy > New deployment > Web app > Execute as: Me,
     Who has access: Anyone. Copy the /exec URL into config.js.

   COLUMN LAYOUT (0-indexed, A=0, B=1, ...), same for both tabs
   except payout, which is one column later on ANA:
     0  district        11 dailyNeeded100
     1  market           12 dailyNeeded110
     2  doorCode         13 dailyNeeded125
     3  store            14 retention
     4  actTarget        15 retTarget
     5  dcsActs          16 retainStatus
     6  recentActs       17 actsNeeded100
     7  totalActs        18 actsNeeded110
     8  quotaAttain      19 actsNeeded125
     9  trendingAct      20 payout (PBR)
     10 trendPct         21 payout (ANA only, if 20 is blank)
   =================================================================== */

const CACHE_FILENAME = 'pbr_dashboard_cache.json'; // Drive file used as the fast-read cache
const AUTO_REBUILD_MINUTES = 15;                   // safety-net timer, in case the change trigger ever misses an edit

/* ---------------------------- PARSE HELPERS ---------------------------- */
// Mirrors the n()/s() helpers inside handleFile() in js/app.js exactly.
function n_(v) {
  const f = parseFloat(v);
  return (isNaN(f) || !isFinite(f)) ? 0 : f;
}
function s_(v, colIndex) {
  const str = String(v == null ? '' : v).trim();
  if (str === 'nan' || str === 'undefined') return '';
  if (colIndex === 0 && str === '0') return ''; // same quirky rule as the client importer
  return str;
}
function round1_(v) { return Math.round(v * 10) / 10; }
function pct1_(v) { return Math.round(v * 1000) / 10; } // fraction -> percentage, 1 decimal

/**
 * Parses one tab's raw 2D values into the dashboard's row-object shape.
 * Mirrors js/app.js -> handleFile() row-by-row, exactly.
 */
function parseTab_(values, tabName) {
  const rows = [];
  if (!values || values.length < 2) return rows;
  const isANA = tabName === 'ANA';
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if (!r || r[1] == null || r[1] === '') continue; // same skip condition as handleFile(): !r[1]
    const payout = n_(r[20]) || (isANA ? n_(r[21]) : 0);
    rows.push({
      tab: tabName,
      district: s_(r[0], 0),
      market: s_(r[1], 1),
      doorCode: s_(r[2], 2),
      store: s_(r[3], 3),
      actTarget: n_(r[4]),
      dcsActs: n_(r[5]),
      recentActs: n_(r[6]),
      totalActs: n_(r[7]),
      quotaAttain: pct1_(n_(r[8])),
      trendingAct: round1_(n_(r[9])),
      trendPct: pct1_(n_(r[10])),
      dailyNeeded100: round1_(n_(r[11])),
      dailyNeeded110: round1_(n_(r[12])),
      dailyNeeded125: round1_(n_(r[13])),
      retention: pct1_(n_(r[14])),
      retTarget: pct1_(n_(r[15])),
      retainStatus: s_(r[16], 16),
      actsNeeded100: round1_(n_(r[17])),
      actsNeeded110: round1_(n_(r[18])),
      actsNeeded125: round1_(n_(r[19])),
      payout: Math.round(payout)
    });
  }
  return rows;
}

function buildRowsFromSheet_() {
  const ss = SpreadsheetApp.getActive();
  const pbrSheet = ss.getSheetByName('PBR');
  const anaSheet = ss.getSheetByName('ANA');
  if (!pbrSheet && !anaSheet) {
    throw new Error('No "PBR" or "ANA" tab was found in this spreadsheet.');
  }
  const pbrRows = pbrSheet ? parseTab_(pbrSheet.getDataRange().getValues(), 'PBR') : [];
  const anaRows = anaSheet ? parseTab_(anaSheet.getDataRange().getValues(), 'ANA') : [];
  const rows = pbrRows.concat(anaRows);
  if (!rows.length) {
    throw new Error('Found "PBR"/"ANA" tab(s) but no usable data rows (check that column B / market is filled in).');
  }
  return rows;
}

/* ---------------------------- CACHE (Drive) ---------------------------- */
function getOrCreateCacheFile_() {
  const files = DriveApp.getFilesByName(CACHE_FILENAME);
  if (files.hasNext()) return files.next();
  return DriveApp.createFile(CACHE_FILENAME, '[]', MimeType.PLAIN_TEXT);
}

function rebuildCache() {
  const rows = buildRowsFromSheet_();
  const json = JSON.stringify(rows);
  const file = getOrCreateCacheFile_();
  file.setContent(json);
  PropertiesService.getScriptProperties().deleteProperty('dirty');
  Logger.log('Cache rebuilt: %s rows, %s bytes', rows.length, json.length);
  return rows.length;
}

/**
 * Called by the onChange trigger the instant either tab is edited —
 * including bulk pastes and File > Import. Just flips a flag (a
 * single fast property write), so it doesn't slow down editing. The
 * next doGet() request sees the flag and rebuilds before responding.
 */
function markDirty_() {
  PropertiesService.getScriptProperties().setProperty('dirty', 'true');
}
function isCacheStale_() {
  return PropertiesService.getScriptProperties().getProperty('dirty') === 'true';
}

/* ---------------------------- WEB APP ---------------------------- */
function doGet(e) {
  const params = (e && e.parameter) || {};
  try {
    if (params.rebuild === 'true') rebuildCache();
    let file = getOrCreateCacheFile_();
    let content = file.getBlob().getDataAsString();
    if (!content || content === '[]' || isCacheStale_()) {
      rebuildCache();
      content = getOrCreateCacheFile_().getBlob().getDataAsString();
    }
    return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const errBody = JSON.stringify({ error: true, message: String(err && err.message ? err.message : err) });
    return ContentService.createTextOutput(errBody).setMimeType(ContentService.MimeType.JSON);
  }
}

/* ---------------------------- TRIGGERS / SETUP ---------------------------- */
function installTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'rebuildCache' || t.getHandlerFunction() === 'markDirty_') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('rebuildCache')
    .timeBased()
    .everyMinutes(AUTO_REBUILD_MINUTES)
    .create();
  ScriptApp.newTrigger('markDirty_')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onChange()
    .create();
}

/**
 * Run this once from the Apps Script editor after your "PBR"/"ANA"
 * tabs have data in them: Run > runInitialSetup.
 * It builds the first cache and installs the auto-refresh triggers.
 */
function runInitialSetup() {
  const count = rebuildCache();
  installTriggers_();
  Logger.log('Setup complete. Rows: %s', count);
  Logger.log('Now: Deploy > New deployment > Web app > Execute as Me, Who has access: Anyone.');
}
