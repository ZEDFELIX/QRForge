import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  QrCode, Radio, FileSpreadsheet, Sparkles, Grid2X2, BarChart3, Layers,
  ArrowRight, Plus, FolderOpen, Clock, Palette, Wand2
} from 'lucide-react'
import { loadAllCodes, loadFolders } from '../utils/folders.js'
import { formatNumber } from '../utils/analytics.js'

export default function Dashboard() {
  const codes = useMemo(() => loadAllCodes(), [])
  const folders = useMemo(() => loadFolders(), [])
  const dynamic = codes.filter(c => c.isDynamic)
  const recent = codes.slice(0, 5)

  const quickActions = [
    { to: '/app/create', label: 'Create QR', desc: 'Static code', icon: QrCode, tint: 'from-indigo-500 to-violet-500' },
    { to: '/app/dynamic', label: 'Dynamic QR', desc: 'Editable destination', icon: Radio, tint: 'from-fuchsia-500 to-pink-500' },
    { to: '/app/bulk', label: 'Bulk QR', desc: 'CSV → many codes', icon: FileSpreadsheet, tint: 'from-emerald-500 to-teal-400' },
    { to: '/app/landing', label: 'Landing Page', desc: 'Menu · card · social', icon: Sparkles, tint: 'from-amber-500 to-orange-400' }
  ]

  const stats = [
    { label: 'Total QR Codes', value: formatNumber(codes.length), icon: QrCode, to: '/app/mycodes' },
    { label: 'Dynamic QR Codes', value: formatNumber(dynamic.length), icon: Radio, to: '/app/dynamic' },
    { label: 'Total Scans', value: '—', icon: BarChart3, to: '/app/analytics', note: dynamic.length ? '' : 'Connect backend' },
    { label: 'Folders', value: formatNumber(folders.length), icon: FolderOpen, to: '/app/mycodes' }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-[26px] bg-ink-950 p-8 shadow-elevated sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-600/40 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-40 h-56 w-56 rounded-full bg-fuchsia-600/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_100%_0%,rgb(168_85_247/0.18),transparent)]" />

        <div className="relative max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">The Studio</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Let's forge something great.
          </h1>
          <p className="mt-2 text-indigo-100/80">
            Unlimited static QR codes, design tools and pro workflows — free forever,
            no signup, no watermark.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app/create" className="btn-primary bg-none px-5 py-2.5 text-sm">
              <Plus size={16} /> Create QR Code
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              <QrCode size={16} /> Free Generator
            </Link>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions">
        <h2 className="mb-3 font-display text-base font-semibold text-slate-900">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="card card-hover group p-4"
            >
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr text-white shadow-soft ${a.tint}`}>
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
        <h2 className="mb-3 font-display text-base font-semibold text-slate-900">Statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} to={s.to} className="card card-hover group p-4">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <s.icon size={17} />
                </span>
                <ArrowRight size={14} className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
              </div>
              <p className="mt-3 flex items-baseline gap-2 font-display text-2xl font-bold text-slate-900">
                {s.value}
                {s.note && <span className="text-[10px] font-medium text-slate-400">{s.note}</span>}
              </p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </Link>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-slate-400">
          Scan statistics go live once Dynamic QR is connected to a backend database.
        </p>
      </section>

      {/* Recent + campaigns */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
              <Clock size={16} className="text-indigo-500" /> Recent QR Codes
            </h2>
            <Link to="/app/mycodes" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View all</Link>
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
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500"><QrCode size={18} /></span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{c.title || c.type}</p>
                    <p className="text-xs text-slate-400">{c.type} · {new Date(c.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  {c.isDynamic && (
                    <span className="chip border border-indigo-200 bg-indigo-50 text-[10px] text-indigo-600">Dynamic</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card relative overflow-hidden p-5">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-100/70 blur-2xl" />
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-slate-900">
            <Layers size={16} className="text-indigo-500" /> Campaigns
          </h2>
          <p className="text-sm leading-relaxed text-slate-500">
            Combine multiple QR codes into one marketing campaign and watch combined scan statistics.
          </p>
          <Link to="/app/campaigns" className="btn-secondary mt-4 text-sm">
            Open Campaigns <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Shortcuts */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { to: '/app/templates', icon: Grid2X2, title: 'Templates', desc: '27 ready-made templates' },
          { to: '/app/landing', icon: Sparkles, title: 'Landing Pages', desc: 'Menus, cards & more' },
          { to: '/app/brand', icon: Palette, title: 'Brand Kit', desc: 'Save your brand look' }
        ].map((c) => (
          <Link key={c.to} to={c.to} className="card card-hover group flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <c.icon size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                {c.title}
                <ArrowRight size={13} className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
              </p>
              <p className="text-xs text-slate-500">{c.desc}</p>
            </div>
          </Link>
        ))}
      </section>

      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-3 text-xs text-slate-500">
        <Wand2 size={14} className="shrink-0 text-indigo-500" />
        Tip: save colors + logo once in <Link to="/app/brand" className="font-semibold text-indigo-600 hover:underline">Brand Kit</Link> and apply them to any QR with one tap.
      </div>
    </div>
  )
}