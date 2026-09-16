import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  QrCode, Radio, FileSpreadsheet, Sparkles, Grid2X2, BarChart3, Layers,
  ArrowRight, Plus, FolderOpen, Clock, Palette
} from 'lucide-react'
import { loadAllCodes } from '../utils/folders.js'
import { loadFolders } from '../utils/folders.js'
import { formatNumber } from '../utils/analytics.js'

export default function Dashboard() {
  const codes = useMemo(() => loadAllCodes(), [])
  const folders = useMemo(() => loadFolders(), [])
  const dynamic = codes.filter(c => c.isDynamic)
  const recent = codes.slice(0, 5)

  const quickActions = [
    { to: '/app/create', label: 'Create QR', desc: 'Static QR code', icon: QrCode, color: 'bg-indigo-600' },
    { to: '/app/dynamic', label: 'Dynamic QR', desc: 'Editable destination', icon: Radio, color: 'bg-violet-600' },
    { to: '/app/bulk', label: 'Bulk QR', desc: 'CSV → many codes', icon: FileSpreadsheet, color: 'bg-emerald-600' },
    { to: '/app/landing', label: 'Landing Page', desc: 'Social · menu · card', icon: Sparkles, color: 'bg-amber-500' }
  ]

  const stats = [
    { label: 'Total QR Codes', value: formatNumber(codes.length), icon: QrCode, to: '/app/mycodes' },
    { label: 'Dynamic QR Codes', value: formatNumber(dynamic.length), icon: Radio, to: '/app/dynamic' },
    { label: 'Total Scans', value: '—', icon: BarChart3, to: '/app/analytics', note: dynamic.length ? '' : 'Connect backend' },
    { label: 'Folders', value: formatNumber(folders.length), icon: FolderOpen, to: '/app/mycodes' }
  ]

  return (
    <div className="space-y-8">
      {/* Hero / welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-8 text-white sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl font-bold sm:text-3xl">Welcome to QRForge</h1>
          <p className="mt-2 text-indigo-100">
            Powerful QR tools without the unnecessary paywalls. Generate unlimited static QR codes free forever — no signup, no watermark.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/app/create" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50">
              <Plus size={16} /> Create QR Code
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25">
              <QrCode size={16} /> Free Generator
            </Link>
          </div>
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10 blur-xl" />
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${a.color} text-white shadow-sm`}>
                <a.icon size={20} />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-900">{a.label}</p>
              <p className="text-xs text-slate-500">{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Statistics">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} to={s.to} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300">
              <div className="flex items-center justify-between">
                <s.icon size={18} className="text-indigo-500" />
                <ArrowRight size={14} className="text-slate-300" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </Link>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Scan statistics are available once Dynamic QR is connected to a backend database.
        </p>
      </section>

      {/* Recent + campaigns awareness */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Clock size={16} className="text-indigo-500" /> Recent QR Codes
            </h2>
            <Link to="/app/mycodes" className="text-sm font-medium text-indigo-600 hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No QR codes yet — create your first one.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2.5">
                  {c.preview ? (
                    <img src={c.preview} alt="" className="h-10 w-10 rounded-lg border border-slate-100 object-contain" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><QrCode size={18} /></span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{c.title || c.type}</p>
                    <p className="text-xs text-slate-400">{c.type} · {new Date(c.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Layers size={16} className="text-indigo-500" /> Campaigns
          </h2>
          <p className="text-sm text-slate-500">
            Combine multiple QRs into a marketing campaign and watch combined scan statistics.
          </p>
          <Link to="/app/campaigns" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
            Open Campaigns <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { to: '/app/templates', icon: Grid2X2, title: 'Templates', desc: '27 ready-made templates' },
          { to: '/app/landing', icon: Sparkles, title: 'Landing Pages', desc: 'Menus, cards & more' },
          { to: '/app/brand', icon: Palette, title: 'Brand Kit', desc: 'Save your brand look' }
        ].map((c) => (
          <Link key={c.to} to={c.to} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300">
            <c.icon size={20} className="text-indigo-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{c.title}</p>
              <p className="text-xs text-slate-500">{c.desc}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}