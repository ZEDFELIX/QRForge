// Analytics aggregations + chart data builders. These work on any scan list
// (from Supabase when configured, or a live "demo" dataset clearly labeled).

export function aggregateScans(rows) {
  const m = {
    totalScans: rows.length,
    uniqueScans: new Set(rows.map(r => [r.device, r.os, r.browser].join(':')).size ? rows.map(r => r.device + r.os + r.browser) : []).size,
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    byDate: {},
    byDevice: {},
    byOS: {},
    byBrowser: {},
    byCountry: {},
    byReferer: {}
  }
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfWeek = startOfDay - ((now.getDay() + 6) % 7) * 86400000
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime()

  for (const r of rows) {
    const t = new Date(r.scanned_at || r.date || Date.now()).getTime()
    if (t >= startOfDay) m.today++
    if (t >= startOfWeek) m.week++
    if (t >= startOfMonth) m.month++
    if (t >= startOfYear) m.year++
    const day = new Date(t).toISOString().slice(0, 10)
    m.byDate[day] = (m.byDate[day] || 0) + 1
    const device = r.device || 'desktop'
    m.byDevice[device] = (m.byDevice[device] || 0) + 1
    const os = r.os || 'other'
    m.byOS[os] = (m.byOS[os] || 0) + 1
    const browser = r.browser || 'other'
    m.byBrowser[browser] = (m.byBrowser[browser] || 0) + 1
    const country = r.country || 'Unknown'
    m.byCountry[country] = (m.byCountry[country] || 0) + 1
    const ref = r.referer || 'Direct'
    m.byReferer[ref] = (m.byReferer[ref] || 0) + 1
  }
  return m
}

export function dateRangeDays(range) {
  switch (range) {
    case '7d': return 7
    case '30d': return 30
    case '90d': return 90
    case '365d': return 365
    default: return null
  }
}

// Build a dense daily series (fills missing days with 0) for charting.
export function buildDateSeries(metrics, range) {
  const days = dateRangeDays(range)
  const out = []
  const today = new Date()
  const start = days ? new Date(today) : null
  if (start) start.setDate(start.getDate() - (days - 1))
  if (!start) {
    // all-time: sort existing keys
    const keys = Object.keys(metrics.byDate).sort()
    return keys.map(k => ({ date: k, count: metrics.byDate[k] }))
  }
  const cursor = new Date(start)
  while (cursor <= today && out.length < (days || 0)) {
    const k = cursor.toISOString().slice(0, 10)
    out.push({ date: k, count: metrics.byDate[k] || 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

export function formatNumber(n) {
  return Number(n || 0).toLocaleString('en-US')
}

export function percent(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

// A small labeled demo dataset for the analytics page when no backend is
// configured. ALWAYS disclosed as "sample data — no real scans".
export function demoScans(count = 200) {
  const now = Date.now()
  const countries = ['Kenya', 'Kenya', 'Kenya', 'Kenya', 'Kenya', 'Uganda', 'Uganda', 'Tanzania', 'UK', 'USA', 'Germany']
  const browsers = ['chrome', 'chrome', 'chrome', 'safari', 'safari', 'firefox', 'edge', 'opera']
  const os = ['android', 'android', 'android', 'ios', 'ios', 'ios', 'windows', 'macos', 'linux']
  const devices = ['mobile', 'mobile', 'mobile', 'desktop', 'tablet']
  const out = []
  for (let i = 0; i < count; i++) {
    const t = now - Math.floor(Math.random() * 100 * 86400000)
    const day = new Date(t).toISOString().slice(0, 10)
    out.push({
      scanned_at: new Date(t).toISOString(),
      date: day,
      device: devices[Math.floor(Math.random() * devices.length)],
      os: os[Math.floor(Math.random() * os.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      region: '—',
      referer: Math.random() > 0.6 ? 'example.com/referrer' : 'Direct'
    })
  }
  return out
}

// Export helpers (CSV / JSON / printable PDF)
export function scansToCSV(rows) {
  if (!rows.length) return 'scanned_at,device,os,browser,country,region,referer\n'
  const headers = Object.keys(rows[0]).filter(k => k !== 'date').join(',')
  const lines = rows.map(r => Object.keys(rows[0]).filter(k => k !== 'date').map(k => csvCell(r[k])).join(','))
  return `${headers}\n${lines.join('\n')}`
}

function csvCell(v) {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function downloadTextFile(text, filename, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function renderAnalyticsReport(metrics, range, safeTitle) {
  // Returns an HTML string suitable for printing / PDF export
  const series = buildDateSeries(metrics, range)
  const deviceBars = Object.entries(metrics.byDevice).map(([k, v]) => ({ key: k, count: v }))
    .sort((a, b) => b.count - a.count)
  const countryBars = Object.entries(metrics.byCountry).map(([k, v]) => ({ key: k, count: v }))
    .sort((a, b) => b.count - a.count).slice(0, 10)
  return `<!doctype html><html><head><meta charset="utf-8"/>
<title>${safeTitle} — Analytics Report</title>
<style>body{font-family:system-ui,sans-serif;padding:32px;color:#111827;max-width:800px;margin:auto}
h1{font-size:22px}h2{font-size:16px;margin-top:28px;border-bottom:1px solid #e5e7eb;padding-bottom:6px}
.kpis{display:flex;gap:12px;flex-wrap:wrap}.kpi{background:#f5f7fb;border-radius:12px;padding:14px 18px;font-size:13px;color:#4b5563}.kpi b{display:block;font-size:22px;color:#111827}
table{width:100%;border-collapse:collapse;margin-top:8px}td,th{padding:6px 10px;border-bottom:1px solid #eef2f7;text-align:left;font-size:13px}.bar{height:8px;border-radius:4px;background:#6366f1}
.note{color:#6b7280;font-size:12px;font-style:italic}</style></head>
<body>
<h1>QR Analytics Report</h1>
<p class="note">Generated ${new Date().toLocaleString()} · Range ${labelRange(range)}</p>
<div class="kpis">
  <div class="kpi">Total scans <b>${formatNumber(metrics.totalScans)}</b></div>
  <div class="kpi">Today <b>${formatNumber(metrics.today)}</b></div>
  <div class="kpi">This week <b>${formatNumber(metrics.week)}</b></div>
  <div class="kpi">This month <b>${formatNumber(metrics.month)}</b></div>
  <div class="kpi">This year <b>${formatNumber(metrics.year)}</b></div>
</div>
<h2>Scan trend (${series.length} days)</h2>
<table><tr><th>Date</th><th>Scans</th></tr>
${series.map(s => `<tr><td>${s.date}</td><td>${s.count}</td></tr>`).join('')}</table>
<h2>Devices</h2>
<table>${deviceBars.map(d => `<tr><td>${d.key}</td><td>${d.count}</td><td style="width:40%"><div class="bar" style="width:${Math.max(2, percent(d.count, metrics.totalScans))}%"></div></td></tr>`).join('')}</table>
<h2>Top countries</h2>
<table>${countryBars.map(c => `<tr><td>${c.key}</td><td>${c.count}</td></tr>`).join('')}</table>
</body></html>`
}

export function labelRange(range) {
  const map = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', '365d': 'Last year', all: 'All time' }
  return map[range] || range
}