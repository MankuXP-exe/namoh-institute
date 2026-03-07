/**
 * admin.js — NAMOH Owner Dashboard
 * Full admin logic: login, token auth, leads table, KPIs, charts, export
 */

// ── DOM References ────────────────────────────────────────────────────────────
const loginSection  = document.getElementById('loginSection');
const dashboard     = document.getElementById('dashboard');
const loginBtn      = document.getElementById('loginBtn');
const logoutBtn     = document.getElementById('logoutBtn');
const tokenInput    = document.getElementById('token');
const loginStatus   = document.getElementById('loginStatus');
const loadBtn       = document.getElementById('loadBtn');
const statusEl      = document.getElementById('status');
const tbody         = document.getElementById('tbody');
const tbl           = document.getElementById('tbl');
const courseFilter  = document.getElementById('course');
const exportBtn     = document.getElementById('exportBtn');
const exportXlsBtn  = document.getElementById('exportXlsBtn');
const kpiTotal      = document.getElementById('kpiTotal');
const kpiToday      = document.getElementById('kpiToday');
const kpi7d         = document.getElementById('kpi7d');
const kpiCourses    = document.getElementById('kpiCourses');
const mobileLeads   = document.getElementById('mobileLeads');

let leadsData = [];
let trendChart  = null;
let courseChart = null;
let authToken   = '';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return isNaN(d) ? String(date) : d.toLocaleString('en-IN', { hour12: true });
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function saveToken(t) {
  authToken = t;
  localStorage.setItem('namoh_admin_token', t);
}

function getToken() {
  return authToken || localStorage.getItem('namoh_admin_token') || '';
}

function showDashboard() {
  if (loginSection) loginSection.style.display = 'none';
  if (dashboard)    dashboard.style.display    = 'block';
}

function showLogin(msg) {
  if (dashboard)    dashboard.style.display    = 'none';
  if (loginSection) loginSection.style.display = '';
  if (loginStatus && msg) {
    loginStatus.textContent = msg;
    loginStatus.className   = 'error';
  }
}

// ── Login Flow ────────────────────────────────────────────────────────────────
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const t = tokenInput ? tokenInput.value.trim() : '';
    if (!t) {
      if (loginStatus) { loginStatus.textContent = 'Please enter your ADMIN_SECRET.'; loginStatus.className = 'error'; }
      return;
    }

    loginBtn.disabled       = true;
    loginBtn.textContent    = 'Verifying…';
    loginStatus.textContent = '';

    try {
      const res  = await fetch('/api/leads', { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();

      if (res.ok && data.success) {
        saveToken(t);
        showDashboard();
        processLeads(data.data || []);
      } else {
        loginStatus.textContent = data.message || 'Invalid secret. Try again.';
        loginStatus.className   = 'error';
      }
    } catch (err) {
      console.error('[Login]', err);
      loginStatus.textContent = 'Network error. Check connection.';
      loginStatus.className   = 'error';
    } finally {
      loginBtn.disabled    = false;
      loginBtn.textContent = 'Access Dashboard';
    }
  });

  // Allow Enter key in password field
  if (tokenInput) {
    tokenInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') loginBtn.click();
    });
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('namoh_admin_token');
    authToken  = '';
    leadsData  = [];
    destroyCharts();
    if (statusEl) statusEl.textContent = 'No data loaded yet.';
    if (tbody)    tbody.innerHTML = '';
    if (mobileLeads) mobileLeads.innerHTML = '';
    if (tbl)      tbl.style.display = 'none';
    showLogin('Logged out successfully.');
    if (loginStatus) loginStatus.className = 'ok';
  });
}

// ── Load Leads (Refresh Button) ───────────────────────────────────────────────
if (loadBtn) {
  loadBtn.addEventListener('click', loadLeads);
}

async function loadLeads() {
  const token = getToken();
  if (!token) { showLogin('Session expired. Please log in again.'); return; }

  if (statusEl) { statusEl.textContent = 'Loading leads…'; statusEl.className = 'muted'; }
  if (loadBtn)  loadBtn.disabled = true;

  try {
    const courseVal = courseFilter ? courseFilter.value.trim() : '';
    let url = '/api/leads';
    if (courseVal) url += `?course=${encodeURIComponent(courseVal)}`;

    const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();

    if (res.status === 401) { showLogin('Session expired. Please log in again.'); return; }

    if (!data.success) throw new Error(data.message || 'API error');

    processLeads(data.data || []);

  } catch (err) {
    console.error('[loadLeads]', err);
    if (statusEl) { statusEl.textContent = 'Failed to load leads: ' + err.message; statusEl.className = 'error'; }
  } finally {
    if (loadBtn) loadBtn.disabled = false;
  }
}

// ── Process & Render ──────────────────────────────────────────────────────────
function processLeads(rows) {
  leadsData = rows;

  const courseVal = courseFilter ? courseFilter.value.trim().toLowerCase() : '';
  const filtered  = courseVal
    ? rows.filter(r => (r.course || '').toLowerCase().includes(courseVal))
    : rows;

  updateKPIs(filtered);
  renderTable(filtered);
  renderMobileCards(filtered);
  drawCharts(rows); // charts use ALL data

  if (statusEl) {
    statusEl.textContent = `Loaded ${filtered.length} record(s)${courseVal ? ' (filtered)' : ''}.`;
    statusEl.className   = 'muted';
  }
}

// ── KPIs ──────────────────────────────────────────────────────────────────────
function updateKPIs(rows) {
  const today   = new Date().toDateString();
  const weekAgo = new Date(Date.now() - 7 * 864e5);
  let todayCount = 0, last7 = 0;
  const courses = new Set();

  rows.forEach(r => {
    if (r.course) courses.add(r.course);
    const d = new Date(r.createdAt);
    if (!isNaN(d)) {
      if (d.toDateString() === today) todayCount++;
      if (d >= weekAgo)               last7++;
    }
  });

  if (kpiTotal)   kpiTotal.textContent   = rows.length;
  if (kpiToday)   kpiToday.textContent   = todayCount;
  if (kpi7d)      kpi7d.textContent      = last7;
  if (kpiCourses) kpiCourses.textContent = courses.size;
}

// ── Table ─────────────────────────────────────────────────────────────────────
function renderTable(rows) {
  if (!tbody) return;

  if (!rows.length) {
    if (tbl) tbl.style.display = 'none';
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#64748b;">No records found.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((r, i) => `
    <tr style="${i % 2 === 0 ? '' : 'background:#f8fafc;'}">
      <td>${escHtml(formatDate(r.createdAt))}</td>
      <td>${escHtml(r.name)}</td>
      <td>${escHtml(r.phone)}</td>
      <td><span class="pill">${escHtml(r.course)}</span></td>
      <td>${escHtml(r.message)}</td>
      <td>${escHtml(r.source || 'website')}</td>
    </tr>
  `).join('');

  if (tbl) tbl.style.display = 'table';
}

// ── Mobile Cards ──────────────────────────────────────────────────────────────
function renderMobileCards(rows) {
  if (!mobileLeads) return;

  if (!rows.length) { mobileLeads.innerHTML = '<p style="color:#64748b;">No records found.</p>'; return; }

  mobileLeads.innerHTML = rows.map(r => `
    <div class="lead-card">
      <div class="lead-row"><span class="lead-key">Time</span><span>${escHtml(formatDate(r.createdAt))}</span></div>
      <div class="lead-row"><span class="lead-key">Name</span><span>${escHtml(r.name)}</span></div>
      <div class="lead-row"><span class="lead-key">Phone</span><span>${escHtml(r.phone)}</span></div>
      <div class="lead-row"><span class="lead-key">Course</span><span>${escHtml(r.course)}</span></div>
      <div class="lead-row"><span class="lead-key">Message</span><span>${escHtml(r.message)}</span></div>
      <div class="lead-row"><span class="lead-key">Source</span><span>${escHtml(r.source || 'website')}</span></div>
    </div>
  `).join('');
}

// ── Charts ────────────────────────────────────────────────────────────────────
function destroyCharts() {
  if (trendChart)  { trendChart.destroy();  trendChart  = null; }
  if (courseChart) { courseChart.destroy(); courseChart = null; }
}

function drawCharts(rows) {
  if (typeof Chart === 'undefined') return;
  destroyCharts();

  // ── Trend: last 14 days ───────────────────────────────────────────────────
  const labels14 = [];
  const counts14 = [];
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const count = rows.filter(r => {
      const rd = new Date(r.createdAt);
      return !isNaN(rd) && rd.toDateString() === d.toDateString();
    }).length;
    labels14.push(label);
    counts14.push(count);
  }

  const trendCtx = document.getElementById('trendChart');
  if (trendCtx) {
    trendChart = new Chart(trendCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels14,
        datasets: [{
          label: 'Leads',
          data:  counts14,
          borderColor:     '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
          x: { ticks: { font: { size: 10 } } },
        },
      },
    });
  }

  // ── Doughnut: top courses ────────────────────────────────────────────────
  const courseMap = {};
  rows.forEach(r => {
    if (r.course) courseMap[r.course] = (courseMap[r.course] || 0) + 1;
  });

  const sortedCourses = Object.entries(courseMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const COLORS = ['#2563eb','#06b6d4','#16a34a','#d97706','#7c3aed','#db2777','#ea580c','#0891b2'];

  const courseCtx = document.getElementById('courseChart');
  if (courseCtx && sortedCourses.length) {
    courseChart = new Chart(courseCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: sortedCourses.map(([name]) => name),
        datasets: [{
          data: sortedCourses.map(([, count]) => count),
          backgroundColor: COLORS.slice(0, sortedCourses.length),
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10, boxWidth: 14 } },
        },
      },
    });
  }
}

// ── Export CSV ────────────────────────────────────────────────────────────────
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    if (!leadsData.length) { alert('No data to export. Load leads first.'); return; }

    const headers = ['Time', 'Name', 'Phone', 'Course', 'Message', 'Source'];
    const rows = leadsData.map(r => [
      formatDate(r.createdAt),
      r.name, r.phone, r.course,
      r.message || '',
      r.source  || 'website',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    downloadBlob(csv, 'namoh-leads.csv', 'text/csv;charset=utf-8;');
  });
}

// ── Export XLS ────────────────────────────────────────────────────────────────
if (exportXlsBtn) {
  exportXlsBtn.addEventListener('click', () => {
    if (!leadsData.length) { alert('No data to export. Load leads first.'); return; }

    const headers  = ['<th>Time</th>', '<th>Name</th>', '<th>Phone</th>', '<th>Course</th>', '<th>Message</th>', '<th>Source</th>'];
    const dataRows = leadsData.map(r => `<tr>
      <td>${escHtml(formatDate(r.createdAt))}</td>
      <td>${escHtml(r.name)}</td>
      <td>${escHtml(r.phone)}</td>
      <td>${escHtml(r.course)}</td>
      <td>${escHtml(r.message || '')}</td>
      <td>${escHtml(r.source || 'website')}</td>
    </tr>`).join('');

    const xlsContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
        <x:ExcelWorksheet><x:Name>Leads</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head>
      <body><table><thead><tr>${headers.join('')}</tr></thead><tbody>${dataRows}</tbody></table></body>
      </html>`;

    downloadBlob(xlsContent, 'namoh-leads.xls', 'application/vnd.ms-excel;charset=utf-8;');
  });
}

// ── Utility: trigger file download ────────────────────────────────────────────
function downloadBlob(content, fileName, mimeType) {
  const BOM  = mimeType.includes('csv') ? '\uFEFF' : '';
  const blob = new Blob([BOM + content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Auto-restore session on page load ─────────────────────────────────────────
(async function init() {
  const storedToken = getToken();
  if (!storedToken) return; // stay on login page

  authToken = storedToken;
  if (loginStatus) { loginStatus.textContent = 'Restoring session…'; loginStatus.className = 'muted'; }

  try {
    const res  = await fetch('/api/leads', { headers: { Authorization: `Bearer ${storedToken}` } });
    const data = await res.json();

    if (res.ok && data.success) {
      showDashboard();
      processLeads(data.data || []);
    } else {
      localStorage.removeItem('namoh_admin_token');
      if (loginStatus) { loginStatus.textContent = 'Session expired. Please log in.'; loginStatus.className = 'muted'; }
    }
  } catch {
    if (loginStatus) { loginStatus.textContent = 'Could not restore session.'; loginStatus.className = 'muted'; }
  }
})();