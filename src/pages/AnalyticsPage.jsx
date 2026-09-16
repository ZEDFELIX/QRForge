import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3, Download, Info, AlertTriangle, Users, Calendar, Monitor,
  Globe, Loader2, FileText, FileJson, Printer
} from 'lucide-react'
import {
  aggregateScans, buildDateSeries, formatNumber, percent, demoScans,
  scansToCSV, downloadTextFile, renderAnalyticsReport, labelRange
} from '../utils/analytics.js'
import { isBackendConfigured } from '../utils/dynamic.js'
import { loadAllCodes } from '../utils/folders.js'

function BarChart({ series, height = 180 }) {
  const max = Math.max(1, ...series.map(s => s.count))
  const w = Math.max(320, series.length * (series.length > 60 ? 14 : 32))
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${height + 36}`} className="min-w-full" role="img" aria-label="Scan trend chart">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1="0" y1={height * (1 - f) + 24} x2={w} y2={height * (1 - f) + 24} stroke="#eef2f7" strokeWidth="1" />
        ))}
        {series.map((s, i) => {
          const h = Math.max(2, (s.count / max) * height)
          const x = (i * w) / series.length + 2
          const bw = Math.max(3, w / series.length - 4)
          return (
            <rect
              key={s.date}
              x={x}
              y={height - h + 24}
              width={bw}
              height={h}
              rx="2"
              fill={s.date === new Date().toISOString().slice(0, 10) ? '#6366f1' : '#a5b4fc'}
            >
              <title>{s.date}: {s.count} scan{s.count === 1 ? '' : 's'}</title>
            </rect>
          )
        })}
      </svg>
    </div>
  )
}

function DonutChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const colors = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9']
  let offset = 0
  const R = 42, C = 2 * Math.PI * R
  const segments = entries.map(([k, v], i) => {
    const frac = v / total
    const seg = { key: k, value: v, frac, color: colors[i % colors.length] }
    return seg
  })
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Share breakdown">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#eef2f7" strokeWidth="18" />
        {segments.map((s, i) => {
          const dash = s.frac * C
          const prev = offset
          offset += dash
          return (
            <circle
              key={s.key}
              cx="60" cy="60" r={R} fill="none"
              stroke={s.color} strokeWidth="18"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-prev}
              transform="rotate(-90 60 60)"
            >
              <title>{s.key}: {formatNumber(s.value)} ({percent(s.value, total)}%)</title>
            </circle>
          )
        })}
      </svg>
      <ul className="space-y-1 text-sm">
        {segments.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="capitalize text-slate-600">{s.key}</span>
            <span className="ml-auto font-medium text-slate-800">{percent(s.value, total)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, note }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Icon size={15} className="text-indigo-500" /> {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {note && <p className="text-[11px] text-slate-400">{note}</p>}
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d')
  const [demo, setDemo] = useState(false)
  const configured = isBackendConfigured()
  const [loading, setLoading] = useState(false)

  const metrics = useMemo(() => {
    // When backend not configured, use a clearly-labeled sample dataset so tooling
    // (charts/export) works and is testable. Never reported as real data.
    if (!configured) {
      setDemo(true)
      return aggregateScans(demoScans(240))
    }
    setDemo(false)
    return aggregateScans([])
  }, [configured, loading])

  const series = useMemo(() => buildDateSeries(metrics, range), [metrics, range])

  useEffect(() => {
    if (configured) setLoading(true)
    setTimeout(() => setLoading(false), 200)
  }, [configured])

  const downloadJSON = () => {
    const payload = { generated: new Date().toISOString(), range: labelRange(range), demo, metrics, series }
    downloadTextFile(JSON.stringify(payload, null, 2), 'analytics.json', 'application/json')
  }

  const downloadCSV = () => {
    const rows = series.map(s => ({ date: s.date, scans: s.count }))
    downloadTextFile(scansToCSV(rows), 'analytics.csv', 'text/csv')
  }

  const downloadPDF = () => {
    const win = window.open('', '_blank', 'width=900,height=800')
    if (!win) { alert('Please allow pop-ups to export the report.'); return }
    const html = renderAnalyticsReport(metrics, range, 'QR Analytics')
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 300)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500">Scan statistics for your dynamic QR codes.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadJSON} className="btn-secondary inline-flex items-center gap-1.5 text-sm"><FileJson size={14} /> JSON</button>
          <button onClick={downloadCSV} className="btn-secondary inline-flex items-center gap-1.5 text-sm"><FileText size={14} /> CSV</button>
          <button onClick={downloadPDF} className="btn-primary inline-flex items-center gap-1.5 text-sm"><Printer size={14} /> Report (PDF)</button>
        </div>
      </header>

      {demo && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Showing sample data</p>
            <p className="mt-1 text-xs">
              Dynamic QR is not connected to a database yet, so this dashboard displays a clearly-marked demo dataset so you can see how analytics will look.
              Connect Supabase in Settings → Dynamic QR to see real scan statistics.
            </p>
          </div>
        </div>
      )}

      {/* Range picker */}
      <div className="flex flex-wrap items-center gap-2">
        {[['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days'], ['365d', '1 year'], ['all', 'All time']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setRange(val)}
            className={`rounded-xl px-3.5 py-1.5 text-sm font-medium transition ${range === val ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}
          >
            {label}
          </button>
        ))}
        {loading && <Loader2 size={16} className="ml-auto animate-spin text-indigo-500" />}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard icon={BarChart3} label="Total Scans" value={formatNumber(metrics.totalScans)} />
        <KpiCard icon={Users} label="Unique Scans" value={formatNumber(metrics.uniqueScans)} />
        <KpiCard icon={Calendar} label="Today" value={formatNumber(metrics.today)} />
        <KpiCard icon={Calendar} label="This Week" value={formatNumber(metrics.week)} />
        <KpiCard icon={Calendar} label="This Month" value={formatNumber(metrics.month)} />
      </div>

      {/* Trend */}
      <div className="card p-5">
        <h2 className="mb-1 text-base font-semibold text-slate-900">Scan trend</h2>
        <p className="mb-3 text-sm text-slate-500">{labelRange(range)}</p>
        <BarChart series={series} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Devices */}
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Monitor size={16} className="text-indigo-500" /> Devices
          </h2>
          <DonutChart data={metrics.byDevice} />
        </div>
        {/* Browsers */}
        <div className="card p-5">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Browsers</h2>
          <DonutChart data={metrics.byBrowser} />
        </div>
        {/* Countries */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Globe size={16} className="text-indigo-500" /> Where scans come from
          </h2>
          {Object.keys(metrics.byCountry).length === 0 ? (
            <p className="text-sm text-slate-400">No location data yet.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(metrics.byCountry).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([country, count]) => (
                <div key={country} className="flex items-center gap-3">
                  <span className="w-32 truncate text-sm text-slate-600">{country}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent(count, metrics.totalScans)}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-slate-800">{formatNumber(count)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
            <Info size={13} className="mt-0.5 shrink-0" /> Coarse country/region only — no precise personal location collected.
          </p>
        </div>
      </div>

      {/* Per-country table for export */}
      <div className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
          <Download size={16} className="text-indigo-500" /> Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Devices</p>
            {Object.entries(metrics.byDevice).length ? Object.entries(metrics.byDevice).map(([k, v]) => (
              <p key={k} className="text-sm text-slate-600"><span className="capitalize">{k}</span> — {formatNumber(v)}</p>
            )) : <p className="text-sm text-slate-400">—</p>}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Operating systems</p>
            {Object.entries(metrics.byOS).length ? Object.entries(metrics.byOS).map(([k, v]) => (
              <p key={k} className="text-sm text-slate-600"><span className="capitalize">{k}</span> — {formatNumber(v)}</p>
            )) : <p className="text-sm text-slate-400">—</p>}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Referrers</p>
            {Object.entries(metrics.byReferer).length ? Object.entries(metrics.byReferer).slice(0, 6).map(([k, v]) => (
              <p key={k} className="truncate text-sm text-slate-600" title={k}>{k === 'Direct' ? k : new URL(k.startsWith('http') ? k : `https://${k}`).hostname} — {formatNumber(v)}</p>
            )) : <p className="text-sm text-slate-400">—</p>}
          </div>
        </div>
      </div>
    </div>
  )
}