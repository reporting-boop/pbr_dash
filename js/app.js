
// ═══════════════════════════════════════════════════
// DM CREDENTIALS  (username → password, markets[])
// ═══════════════════════════════════════════════════
const DM_CREDENTIALS = {
  // username (lowercase) : { password, markets:[], name }
  'admin':            { password:'Admin@2026',   markets:[], name:'Admin',               role:'admin' },
  'shoeb':            { password:'Shoeb@2026',   markets:['ARIZONA'], name:'Shoeb',       role:'dm' },
  'hamza':            { password:'Hamza@2026',   markets:['ARIZONA'], name:'Hamza',       role:'dm' },
  'adil':             { password:'Adil@2026',    markets:['ARIZONA'], name:'Adil',        role:'dm' },
  'syedamir':         { password:'Amir@2026',    markets:['ARKANSAS','MEMPHIS'], name:'Syed Amir', role:'dm' },
  'mohammedanas':     { password:'Anas@2026',    markets:['BAY AREA'], name:'Mohammed Anas', role:'dm' },
  'namir':            { password:'Namir@2026',   markets:['CHARLOTTE'], name:'Namir Elmouchantaf', role:'dm' },
  'farhan':           { password:'Farhan@2026',  markets:['COLORADO'], name:'Muhammad Farhan Asghar', role:'dm' },
  'abdullahbutt':     { password:'Abdullah@2026',markets:['COLORADO'], name:'Abdullah Butt', role:'dm' },
  'imranahmed':       { password:'ImranA@2026',  markets:['DALLAS','OKHLAHOMA'], name:'Imran Ahmed Mohammed', role:'dm' },
  'imranshaikh':      { password:'ImranS@2026',  markets:['DALLAS'], name:'Imran Shaikh', role:'dm' },
  'salim':            { password:'Salim@2026',   markets:['DALLAS'], name:'Salim Thanawala', role:'dm' },
  'hassan':           { password:'Hassan@2026',  markets:['Durham'], name:'Hassan Tanveer', role:'dm' },
  'saadali':          { password:'Saad@2026',    markets:['EAST BAY AREA'], name:'Saad Ali', role:'dm' },
  'haroon':           { password:'Haroon@2026',  markets:['EL PASO'], name:'Haroon Iqbal', role:'dm' },
  'eleyan':           { password:'Eleyan@2026',  markets:['FLORIDA'], name:'Mohammed Eleyan', role:'dm' },
  'ayyan':            { password:'Ayyan@2026',   markets:['GEORGIA'], name:'Ayyan Budwani', role:'dm' },
  'wajahat':          { password:'Wajahat@2026', markets:['East'], name:'Wajahat Ali Sattar Rajper', role:'dm' },
  'salmanriaz':       { password:'Salman@2026',  markets:['South'], name:'Salman Riaz',   role:'dm' },
  'zubair':           { password:'Zubair@2026',  markets:['Central'], name:'Zubair Hussain', role:'dm' },
  'mukram':           { password:'Mukram@2026',  markets:['Airline'], name:'Mukram Shareef Mohammed', role:'dm' },
  'sunvee':           { password:'Sunvee@2026',  markets:['North'], name:'MD Sunvee Bin Islam', role:'dm' },
  'khaja':            { password:'Khaja@2026',   markets:['KENTUCKY','NASHVILLE'], name:'Khaja Ameenuddin Ghori', role:'dm' },
  'subhan':           { password:'Subhan@2026',  markets:['LA - Central'], name:'Subhan Ansari', role:'dm' },
  'rafay':            { password:'Rafay@2026',   markets:['LA - East'], name:'Abdul Rafay Ashraf', role:'dm' },
  'sharik':           { password:'Sharik@2026',  markets:['LA North'], name:'Sharik Thobani', role:'dm' },
  'shoaib':           { password:'Shoaib@2026',  markets:['MEMPHIS'], name:'Muhammad Shoaib Sheeraz', role:'dm' },
  'zaidwaseem':       { password:'Zaid@2026',    markets:['MEMPHIS'], name:'Zaid Waseem',  role:'dm' },
  'sumair':           { password:'Sumair@2026',  markets:['NORTH BAY AREA'], name:'Muhammad Sumairuddin', role:'dm' },
  'prabhakar':        { password:'Prabhakar@2026',markets:['OREGON'], name:'Prabhakar Sivan', role:'dm' },
  'aslam':            { password:'Aslam@2026',   markets:['OXNARD','PALMDALE','SANTA BARBARA'], name:'Aslam Khan', role:'dm' },
  'syedali':          { password:'SyedAli@2026', markets:['Raleigh East'], name:'SyedAli AhmedRizvi', role:'dm' },
  'uzair':            { password:'Uzair@2026',   markets:['Raleigh West'], name:'Uzair Uddin', role:'dm' },
  'talha':            { password:'Talha@2026',   markets:['SACRAMENTO'], name:'Talha Qureshi', role:'dm' },
  'hafizasad':        { password:'Asad@2026',    markets:['SACRAMENTO'], name:'Hafiz Asad Burgees', role:'dm' },
  'maazkhan':         { password:'Maaz@2026',    markets:['San Bernardino'], name:'Maaz Khan', role:'dm' },
  'hassansaleem':     { password:'HassanS@2026', markets:['SAN DIEGO'], name:'Hassan Saleem', role:'dm' },
  'kamaran':          { password:'Kamaran@2026', markets:['SAN FRANCISCO'], name:'Kamaran Mohammed', role:'dm' },
};

let currentUser = null;

// ── LOGIN ──────────────────────────────────────────
function doLogin() {
  const raw  = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const key  = raw.toLowerCase().replace(/\s+/g,'');
  const err  = document.getElementById('loginErr');

  const user = DM_CREDENTIALS[key];
  if (!user || user.password !== pass) {
    err.classList.add('show');
    document.getElementById('loginPass').value = '';
    return;
  }
  err.classList.remove('show');
  currentUser = { ...user, key };
  sessionStorage.setItem('pbr_user', JSON.stringify({...user, key}));

  // hide login, show dashboard
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('mainHdr').style.display   = '';

  // set user badge
  document.getElementById('userBadge').style.display = '';
  document.getElementById('userName').textContent    = user.name;
  document.getElementById('userAvatar').textContent  = user.name.charAt(0).toUpperCase();

  // update live label
  document.getElementById('update-lbl').textContent =
    user.role === 'admin' ? 'All markets — Admin' : 'My markets only';

  updateTabCounts();
  populateDropdowns();
  const el = document.getElementById('s-quotaAttain');
  if (el) el.textContent = ' ▼';
  applyFilters();
}

// ── LOGOUT ─────────────────────────────────────────
function doLogout() {
  currentUser = null;
  document.getElementById('loginPage').style.display = '';
  document.getElementById('mainHdr').style.display   = 'none';
  document.getElementById('userBadge').style.display = 'none';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginErr').classList.remove('show');
  document.getElementById('kpiGrid').innerHTML = '';
  document.getElementById('tbody').innerHTML   = '';
  if (mChart) { mChart.destroy(); mChart = null; }
  if (dChart) { dChart.destroy(); dChart = null; }
}


// ── SHOW / HIDE PASSWORD ───────────────────────────
function togglePass() {
  const inp  = document.getElementById('loginPass');
  const icon = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type   = 'text';
    icon.textContent = '🙈';
  } else {
    inp.type   = 'password';
    icon.textContent = '👁';
  }
}

// ── FILTER by DM markets ────────────────────────────
function dmFilter(rows) {
  if (!currentUser || currentUser.role === 'admin') return rows;
  const myMarkets = currentUser.markets.map(m => m.toUpperCase());
  return rows.filter(r => myMarkets.includes((r.market||'').toUpperCase()));
}



// ===== STATE =====
let allData = [];
let filtered = [];
let activeTab = 'PBR';
let sortCol = 'quotaAttain', sortDir = -1;
let page = 1;
let mChart = null, dChart = null;

// ===== INIT =====
function init() {
  updateTabCounts();
  populateDropdowns();
  applyFilters();
}

function updateTabCounts() {
  const dmRows = dmFilter(allData);
  document.getElementById('cnt-PBR').textContent = '(' + dmRows.filter(r=>r.tab==='PBR').length + ')';
  document.getElementById('cnt-ANA').textContent = '(' + dmRows.filter(r=>r.tab==='ANA').length + ')';
}

function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-PBR').className = 'tab' + (tab==='PBR' ? ' active' : '');
  document.getElementById('tab-ANA').className = 'tab' + (tab==='ANA' ? ' active' : '');
  page = 1;
  populateDropdowns();
  applyFilters();
}

function populateDropdowns() {
  const rows = dmFilter(allData).filter(r => r.tab === activeTab);
  function fill(id, key) {
    const sel = document.getElementById(id);
    const cur = sel.value;
    const vals = [...new Set(rows.map(r => r[key]).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">All</option>' + vals.map(v => `<option value="${v}"${v===cur?' selected':''}>${v}</option>`).join('');
  }
  fill('f-market', 'market');
  fill('f-district', 'district');
}

function applyFilters() {
  const market = document.getElementById('f-market').value;
  const district = document.getElementById('f-district').value;
  const attain = document.getElementById('f-attain').value;
  const retain = document.getElementById('f-retain').value;
  const payout = document.getElementById('f-payout').value;
  const q = document.getElementById('f-search').value.toLowerCase();

  const baseData = dmFilter(allData);
  filtered = baseData.filter(r => {
    if (r.tab !== activeTab) return false;
    if (market && r.market !== market) return false;
    if (district && r.district !== district) return false;
    if (retain && r.retainStatus !== retain) return false;
    if (attain === '125+' && r.quotaAttain < 125) return false;
    if (attain === '100-125' && (r.quotaAttain < 100 || r.quotaAttain >= 125)) return false;
    if (attain === '75-100' && (r.quotaAttain < 75 || r.quotaAttain >= 100)) return false;
    if (attain === '<75' && r.quotaAttain >= 75) return false;
    if (payout === '3000' && Math.round(r.payout) !== 3000) return false;
    if (payout === '1200' && Math.round(r.payout) !== 1200) return false;
    if (payout === '0' && r.payout > 0) return false;
    if (payout === 'variable' && (Math.round(r.payout) === 3000 || Math.round(r.payout) === 1200 || r.payout === 0)) return false;
    if (q && ![r.store, r.doorCode, r.market, r.district].some(s => (s||'').toLowerCase().includes(q))) return false;
    return true;
  });

  sortData();
  renderKPIs();
  renderCharts();
  renderTable();
}

function sortBy(col) {
  if (sortCol === col) sortDir *= -1; else { sortCol = col; sortDir = -1; }
  document.querySelectorAll('[id^="s-"]').forEach(e => e.textContent = '');
  const el = document.getElementById('s-' + col);
  if (el) el.textContent = sortDir === 1 ? ' ▲' : ' ▼';
  sortData();
  renderTable();
}

function sortData() {
  filtered.sort((a, b) => {
    const av = a[sortCol], bv = b[sortCol];
    if (typeof av === 'number') return (av - bv) * sortDir;
    return String(av||'').localeCompare(String(bv||'')) * sortDir;
  });
}

function resetFilters() {
  ['f-market','f-district','f-attain','f-retain','f-payout'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-search').value = '';
  page = 1;
  applyFilters();
}

// ===== KPIs =====
function renderKPIs() {
  const d = filtered;
  if (!d.length) { document.getElementById('kpiGrid').innerHTML = ''; return; }
  const totalActs = d.reduce((s,r)=>s+r.totalActs,0);
  const totalTarget = d.reduce((s,r)=>s+r.actTarget,0);
  const avgQ = Math.round(d.reduce((s,r)=>s+r.quotaAttain,0)/d.length);
  const avgRet = Math.round(d.reduce((s,r)=>s+r.retention,0)/d.length);
  const over125 = d.filter(r=>r.quotaAttain>=125).length;
  const over100 = d.filter(r=>r.quotaAttain>=100).length;
  const pay3k = d.filter(r=>Math.round(r.payout)===3000).length;
  const pay1k2 = d.filter(r=>Math.round(r.payout)===1200).length;
  const totalPay = d.reduce((s,r)=>s+r.payout,0);
  const retGrt = d.filter(r=>r.retainStatus==='Greater').length;

  document.getElementById('kpiGrid').innerHTML = `
    <div class="kpi c-blue"><div class="kpi-lbl">Stores</div><div class="kpi-val">${d.length}</div><div class="kpi-sub">${activeTab} tab</div></div>
    <div class="kpi c-green"><div class="kpi-lbl">Total Acts</div><div class="kpi-val">${totalActs.toLocaleString()}</div><div class="kpi-sub">Target: ${totalTarget.toLocaleString()}</div></div>
    <div class="kpi c-purple"><div class="kpi-lbl">≥125% Stores</div><div class="kpi-val">${over125}</div><div class="kpi-sub">${Math.round((over125/d.length)*100)}% of total</div></div>
    <div class="kpi c-teal"><div class="kpi-lbl">Avg Retention</div><div class="kpi-val">${avgRet}%</div><div class="kpi-sub">${retGrt} Greater status</div></div>
    <div class="kpi c-green"><div class="kpi-lbl">$3K Payout</div><div class="kpi-val">${pay3k}</div><div class="kpi-sub">$1.2K: ${pay1k2}</div></div>
    <div class="kpi c-cyan"><div class="kpi-lbl">Total Payout</div><div class="kpi-val">$${Math.round(totalPay/1000)}K</div><div class="kpi-sub">across ${d.length} stores</div></div>
  `;
}

// ===== CHARTS =====
function renderCharts() {
  // Grouped bar chart: Act Target vs DCS Acts vs Recent Acts by Market (top 12)
  const mkts = [...new Set(filtered.map(r=>r.market))];
  const mktData = mkts.map(m => {
    const rows = filtered.filter(r=>r.market===m);
    return {
      m,
      target: rows.reduce((s,r)=>s+r.actTarget,0),
      dcs:    rows.reduce((s,r)=>s+r.dcsActs,0),
      recent: rows.reduce((s,r)=>s+r.recentActs,0)
    };
  }).sort((a,b)=>(b.dcs+b.recent)-(a.dcs+a.recent)).slice(0,12);

  if (mChart) mChart.destroy();
  mChart = new Chart(document.getElementById('chartMarket'), {
    type: 'bar',
    data: {
      labels: mktData.map(d=>d.m),
      datasets: [
        { label: 'Act Target',      data: mktData.map(d=>d.target), backgroundColor: 'rgba(124,92,252,.75)',  borderRadius: 3 },
        { label: 'DCS Acts (27th)', data: mktData.map(d=>d.dcs),    backgroundColor: 'rgba(24,184,154,.8)', borderRadius: 3 },
        { label: 'Acts 28–29th',    data: mktData.map(d=>d.recent), backgroundColor: 'rgba(251,155,61,.85)', borderRadius: 3 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#14142b', font: { size: 10, weight: '600' }, padding: 10, boxWidth: 10 } }
      },
      scales: {
        x: { ticks: { color: '#14142b', font: { size: 9, weight: '600' }, maxRotation: 35 }, grid: { color: 'rgba(20,20,43,.06)' } },
        y: { ticks: { color: '#14142b', font: { weight: '600' }, callback: v => v }, grid: { color: 'rgba(20,20,43,.06)' }, min: 0 }
      }
    }
  });

  // Donut
  const b125 = filtered.filter(r=>r.quotaAttain>=125).length;
  const b100 = filtered.filter(r=>r.quotaAttain>=100&&r.quotaAttain<125).length;
  const b75  = filtered.filter(r=>r.quotaAttain>=75&&r.quotaAttain<100).length;
  const bLow = filtered.filter(r=>r.quotaAttain<75).length;
  if (dChart) dChart.destroy();
  dChart = new Chart(document.getElementById('chartDist'), {
    type: 'doughnut',
    data: {
      labels: ['≥125%','100–124%','75–99%','<75%'],
      datasets: [{ data: [b125,b100,b75,bLow], backgroundColor: ['#18b89a','#7c5cfc','#fb9b3d','#ef4b69'], borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'right', labels: { color: '#14142b', font: { size: 10, weight: '600' }, padding: 10 } } },
      cutout: '62%'
    }
  });
}

// ===== TABLE =====
function renderTable() {
  const ps = parseInt(document.getElementById('perPage').value)||25;
  const total = filtered.length;
  const start = (page-1)*ps;
  const end = Math.min(start+ps, total);
  const rows = ps >= 9999 ? filtered : filtered.slice(start, end);

  document.getElementById('tblTitle').textContent = activeTab + ' Store Performance';
  document.getElementById('tblCnt').textContent = total + ' stores';
  document.getElementById('pagInfo').textContent = ps>=9999 ? `Showing all ${total}` : `${start+1}–${end} of ${total}`;
  document.getElementById('prevBtn').disabled = page===1;
  document.getElementById('nextBtn').disabled = end>=total || ps>=9999;

  function qBadge(q) {
    if (q>=125) return 'b-green';
    if (q>=100) return 'b-blue';
    if (q>=75)  return 'b-amber';
    return 'b-red';
  }
  function dnColor(v) { return v<=0?'b-green':v<=10?'b-amber':'b-red'; }
  function payColor(p) {
    const rp = Math.round(p);
    if (rp===3000) return 'b-green';
    if (rp>=2500)  return 'b-blue';
    if (rp>=1200)  return 'b-amber';
    if (rp===0)    return 'b-red';
    return 'b-gray';
  }
  function retainBadge(s) { return s==='Greater'?'b-green':s==='Less'?'b-red':'b-gray'; }
  function pct(v) { return Math.round(v)+'%'; }
  function num(v) { return Math.round(v); }
  function sign(v) { return (v>0?'+':'')+Math.round(v); }

  const barW = v => Math.min(100, v/1.5);
  const barColor = v => v>=125?'#18b89a':v>=100?'#7c5cfc':v>=75?'#fb9b3d':'#ef4b69';

  document.getElementById('tbody').innerHTML = rows.map(r => `
    <tr>
      <td style="font-weight:600">${r.market}</td>
      <td>${r.district||'—'}</td>
      <td style="font-family:monospace">${r.doorCode}</td>
      <td style="min-width:200px;white-space:normal;word-break:break-word">${r.store}</td>
      <td style="text-align:right">${r.actTarget.toLocaleString()}</td>
      <td style="text-align:right">${r.dcsActs.toLocaleString()}</td>
      <td style="text-align:right">${r.recentActs}</td>
      <td style="text-align:right;font-weight:600">${r.totalActs.toLocaleString()}</td>
      <td>
        <span class="badge ${qBadge(r.quotaAttain)}">${pct(r.quotaAttain)}</span>
        <span class="pbar"><span class="pbar-f" style="width:${barW(r.quotaAttain)}%;background:${barColor(r.quotaAttain)}"></span></span>
      </td>
      <td style="text-align:right">${Math.round(r.trendingAct)}</td>
      <td><span class="badge ${qBadge(r.trendPct)}">${pct(r.trendPct)}</span></td>
      <td style="text-align:right">${sign(r.dailyNeeded100)}</td>
      <td style="text-align:right">${sign(r.dailyNeeded110)}</td>
      <td style="text-align:right">${sign(r.dailyNeeded125)}</td>
      <td><span class="badge ${r.retention>=57.95?'b-green':'b-red'}">${pct(r.retention)}</span></td>
      <td style="text-align:right">${pct(r.retTarget)}</td>
      <td>${r.retainStatus||'—'}</td>
      <td style="text-align:right">${sign(r.actsNeeded100)}</td>
      <td style="text-align:right">${sign(r.actsNeeded110)}</td>
      <td style="text-align:right">${sign(r.actsNeeded125)}</td>
      <td><span class="badge ${payColor(r.payout)}">$${Math.round(r.payout).toLocaleString()}</span></td>
    </tr>`).join('');
}

function changePage(d) {
  const ps = parseInt(document.getElementById('perPage').value)||25;
  const maxP = Math.ceil(filtered.length/ps);
  page = Math.max(1, Math.min(page+d, maxP));
  renderTable();
}

// ===== FILE IMPORT =====
function handleFile(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});
      const imported = [];

      ['PBR','ANA'].forEach(tabName => {
        if (!wb.SheetNames.includes(tabName)) return;
        const raw = XLSX.utils.sheet_to_json(wb.Sheets[tabName], {header:1});
        if (raw.length < 2) return;
        const isANA = tabName === 'ANA';

        for (let i = 1; i < raw.length; i++) {
          const r = raw[i];
          if (!r || !r[1]) continue;
          const n = k => { const v=parseFloat(r[k]); return (isNaN(v)||!isFinite(v)) ? 0 : v; };
          const s = k => { const v=r[k]; const str=String(v||'').trim(); return str==='nan'||str==='undefined'||str==='0'&&k===0?'':str; };
          const p = n(20) || (isANA ? n(21) : 0);
          imported.push({
            tab: tabName,
            district: s(0),
            market: s(1),
            doorCode: s(2),
            store: s(3),
            actTarget: n(4),
            dcsActs: n(5),
            recentActs: n(6),
            totalActs: n(7),
            quotaAttain: Math.round(n(8)*1000)/10,
            trendingAct: Math.round(n(9)*10)/10,
            trendPct: Math.round(n(10)*1000)/10,
            dailyNeeded100: Math.round(n(11)*10)/10,
            dailyNeeded110: Math.round(n(12)*10)/10,
            dailyNeeded125: Math.round(n(13)*10)/10,
            retention: Math.round(n(14)*1000)/10,
            retTarget: Math.round(n(15)*1000)/10,
            retainStatus: s(16),
            actsNeeded100: Math.round(n(17)*10)/10,
            actsNeeded110: Math.round(n(18)*10)/10,
            actsNeeded125: Math.round(n(19)*10)/10,
            payout: Math.round(p)
          });
        }
      });

      if (imported.length) {
        allData = imported;
        document.getElementById('update-lbl').textContent = 'Updated: ' + new Date().toLocaleTimeString();
        updateTabCounts();
        populateDropdowns();
        page = 1;
        applyFilters();
        alert('✅ Imported ' + imported.length + ' stores from ' + file.name);
      } else {
        alert('⚠️ Could not find PBR or ANA sheets. Please check your file.');
      }
    } catch(err) {
      alert('❌ Error reading file: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
  evt.target.value = '';
}


// ── SESSION PERSISTENCE (refresh keeps user logged in) ──────────────────
function restoreSession() {
  const saved = sessionStorage.getItem('pbr_user');
  if (!saved) return;
  try {
    const user = JSON.parse(saved);
    const cred = DM_CREDENTIALS[user.key];
    if (!cred) { sessionStorage.removeItem('pbr_user'); return; }
    currentUser = user;
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainHdr').style.display   = '';
    document.getElementById('userBadge').style.display = '';
    document.getElementById('userName').textContent    = user.name;
    document.getElementById('userAvatar').textContent  = user.name.charAt(0).toUpperCase();
    document.getElementById('update-lbl').textContent  =
      user.role === 'admin' ? 'All markets — Admin' : 'My markets only';
    updateTabCounts();
    populateDropdowns();
    const el = document.getElementById('s-quotaAttain');
    if (el) el.textContent = ' ▼';
    applyFilters();
  } catch(e) { sessionStorage.removeItem('pbr_user'); }
}

// ── 80% CALCULATOR ───────────────────────────────────────────────────────
function populateCalcMarkets() {
  const sel = document.getElementById('calcMarketSel');
  if (!sel) return;
  const cur = sel.value;
  const markets = [...new Set(dmFilter(allData).filter(r=>r.tab===activeTab).map(r=>r.market))].sort();
  sel.innerHTML = '<option value="">Current filter (all)</option>' +
    markets.map(m=>`<option value="${m}"${m===cur?' selected':''}>${m}</option>`).join('');
}

function runCalc() {
  const pct     = parseFloat(document.getElementById('calcPct').value) || 80;
  const mktSel  = document.getElementById('calcMarketSel').value;
  const lbl     = document.getElementById('calcPctLabel');
  if (lbl) lbl.textContent = '(Target × ' + pct + '%)';

  let rows = mktSel
    ? dmFilter(allData).filter(r => r.tab === activeTab && r.market === mktSel)
    : [...filtered];

  if (!rows.length) {
    document.getElementById('calcBody').innerHTML =
      '<tr><td colspan="8" style="text-align:center;color:#6b6b85;padding:20px">No stores match.</td></tr>';
    document.getElementById('calcSummary').style.display = 'none';
    return;
  }

  // ── Dynamic remaining days ──
  // Column headers like "Acts 28-29th" tell us the last update date.
  // We infer remaining days from today's date to month end.
  const now         = new Date();
  const monthEnd    = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of current month
  const msPerDay    = 1000 * 60 * 60 * 24;
  const DAYS        = Math.max(1, Math.ceil((monthEnd - now) / msPerDay));
  // Update column header to show actual remaining days
  const daysLbl = document.getElementById('calcDaysLabel');
  if (daysLbl) daysLbl.textContent = '÷ ' + DAYS + ' day' + (DAYS === 1 ? '' : 's') + ' remaining';
  let totalGap=0, needCount=0, metCount=0;

  document.getElementById('calcBody').innerHTML = rows.map(r => {
    const threshold  = Math.ceil(r.actTarget * (pct / 100));
    const gap        = threshold - r.totalActs;
    const daily      = gap > 0 ? Math.ceil(gap / DAYS) : 0;
    const met        = gap <= 0;
    if (!met) { totalGap += gap; needCount++; } else metCount++;
    return `<tr>
      <td style="font-weight:600">${r.market}</td>
      <td style="max-width:200px;white-space:normal;word-break:break-word;font-size:12px">${r.store}</td>
      <td style="text-align:right">${r.actTarget.toLocaleString()}</td>
      <td style="text-align:right;font-weight:700">${r.totalActs.toLocaleString()}</td>
      <td style="text-align:right;color:#6942e8;font-weight:700">${threshold.toLocaleString()}</td>
      <td style="text-align:right;font-weight:700;color:${met?'#0f8a72':'#d02d4f'}">${met?'—':'+'+gap}</td>
      <td style="text-align:right;font-weight:700">${daily||'—'}</td>
      <td><span class="badge ${met?'b-green':'b-red'}">${met?'✓ Met':'Needs Acts'}</span></td>
    </tr>`;
  }).join('');

  const s = document.getElementById('calcSummary');
  s.style.display = 'flex';
  s.innerHTML = `
    <div class="calc-sum-item"><div class="calc-sum-lbl">Total Stores</div><div class="calc-sum-val">${rows.length}</div></div>
    <div class="calc-sum-item"><div class="calc-sum-lbl" style="color:#0f8a72">✓ Already Met</div><div class="calc-sum-val" style="color:#0f8a72">${metCount}</div></div>
    <div class="calc-sum-item"><div class="calc-sum-lbl" style="color:#d02d4f">Need Acts</div><div class="calc-sum-val" style="color:#d02d4f">${needCount}</div></div>
    <div class="calc-sum-item"><div class="calc-sum-lbl">Total Acts Gap</div><div class="calc-sum-val">${totalGap.toLocaleString()}</div></div>`;
}


// Sort indicator init
// init is triggered by login


// ═══════════════════════════════════════════════════
// LIVE DATA LOADING
// This dashboard no longer ships with an embedded SEED dataset. On
// boot it fetches the current PBR/ANA rows from the Google Apps
// Script API configured in config.js. The API returns a flat JSON
// array of row objects in the exact same shape the in-browser Excel
// importer already produces (see handleFile() above), so every
// existing render / filter / sort function keeps working unchanged.
//
// A copy of the last successful payload is cached in localStorage so
// the dashboard still opens with the most recent data if the network
// or the API is briefly unavailable.
// ═══════════════════════════════════════════════════
const LIVE_CACHE_KEY = 'pbrDashboard.cachedData.v1';

function cacheDataLocally(rows){
  try{
    localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(rows));
    localStorage.setItem(LIVE_CACHE_KEY+'.savedAt', new Date().toISOString());
  }catch(err){
    console.warn('Could not cache data locally (localStorage full or unavailable):', err);
  }
}
function loadCachedData(){
  try{
    const raw = localStorage.getItem(LIVE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(err){
    console.warn('Could not read cached data:', err);
    return null;
  }
}

/**
 * Fetches the current PBR/ANA rows from the Apps Script Web App
 * configured in config.js. Falls back to the last locally-cached
 * copy if the request fails. Throws only if neither a live fetch nor
 * a cached copy is available.
 */
async function loadLiveData(){
  const url = (typeof CONFIG !== 'undefined' && CONFIG.DATA_SOURCE_URL) ? CONFIG.DATA_SOURCE_URL : '';
  if(!url || url.includes('YOUR_DEPLOYMENT_ID')){
    const cached = loadCachedData();
    if(cached){ console.warn('CONFIG.DATA_SOURCE_URL is not set — showing last cached data.'); return cached; }
    throw new Error('CONFIG.DATA_SOURCE_URL is not set. Open config.js and paste in your Apps Script Web App URL.');
  }
  try{
    const res = await fetch(url, { cache:'no-store' });
    if(!res.ok) throw new Error('API responded with status '+res.status);
    const payload = await res.json();
    if(payload && payload.error) throw new Error(payload.message || 'API returned an error.');
    if(!Array.isArray(payload)) throw new Error('API response was not a row array.');
    cacheDataLocally(payload);
    return payload;
  }catch(err){
    console.error('Live data fetch failed, falling back to cached copy:', err);
    const cached = loadCachedData();
    if(cached) return cached;
    throw err;
  }
}

function showBootError(err){
  const overlay = document.getElementById('loading-overlay');
  const msg = (err && err.message) ? err.message : String(err);
  const html = '<div style="max-width:520px;margin:14vh auto;padding:24px 28px;'
    + 'background:#fff;border:1px solid var(--border,#e4e2f5);border-radius:14px;'
    + 'font-family:\'Segoe UI\',system-ui,sans-serif;color:#14142b;text-align:left;box-shadow:0 14px 38px rgba(20,20,43,.12)">'
    + '<div style="font-weight:700;font-size:17px;margin-bottom:8px;">Couldn\'t load dashboard data</div>'
    + '<div style="font-size:14px;color:#6b6b85;line-height:1.5;">'+ msg
    + '<br><br>Check that <code>config.js</code> has the correct Apps Script Web App URL, '
    + 'that the deployment is set to "Anyone can access", and that you have an internet connection.'
    + '</div></div>';
  if(overlay){ overlay.innerHTML = html; } else { document.body.insertAdjacentHTML('afterbegin', html); }
}

let _refreshTimer = null;
function startAutoRefresh(){
  const minutes = (typeof CONFIG !== 'undefined' && Number(CONFIG.REFRESH_INTERVAL_MINUTES)) || 0;
  if(_refreshTimer) clearInterval(_refreshTimer);
  if(!minutes || minutes <= 0) return;
  _refreshTimer = setInterval(async ()=>{
    try{
      allData = await loadLiveData();
      updateTabCounts();
      populateDropdowns();
      applyFilters();
      console.info('Dashboard data refreshed automatically at', new Date().toLocaleTimeString());
    }catch(err){
      console.warn('Auto-refresh failed, keeping current data on screen:', err);
    }
  }, minutes * 60 * 1000);
}

async function boot(){
  try{
    allData = await loadLiveData();
    restoreSession();
    startAutoRefresh();
  }catch(err){
    console.error('Failed to load PBR/ANA data', err);
    showBootError(err);
    return;
  }
  const overlay = document.getElementById('loading-overlay');
  if(overlay) overlay.remove();
}
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
