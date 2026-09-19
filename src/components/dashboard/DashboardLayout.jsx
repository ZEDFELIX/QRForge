import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, QrCode, Grid2X2, Radio, BarChart3, Layers, FileSpreadsheet,
  Palette, Settings, HelpCircle, Menu, X, Plus, Sparkles, ArrowUpRight
} from 'lucide-react'
import LogoMark from '../LogoMark.jsx'
import { syncFromCloud } from '../../utils/cloudStore.js'

const NAV = [
  {
    section: 'Overview',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/app/mycodes', label: 'My QR Codes', icon: Grid2X2 }
    ]
  },
  {
    section: 'Create',
    items: [
      { to: '/app/create', label: 'Create QR', icon: QrCode },
      { to: '/app/dynamic', label: 'Dynamic QR', icon: Radio, badge: 'New' },
      { to: '/app/bulk', label: 'Bulk QR (CSV)', icon: FileSpreadsheet },
      { to: '/app/templates', label: 'Templates', icon: Palette }
    ]
  },
  {
    section: 'Grow',
    items: [
      { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/app/campaigns', label: 'Campaigns', icon: Layers },
      { to: '/app/landing', label: 'Landing Pages', icon: LayoutDashboard },
      { to: '/app/brand', label: 'Brand Kit', icon: Palette }
    ]
  }
]

const ALL_ITEMS = NAV.flatMap((g) => g.items)

const BOTTOM_NAV = [
  { to: '/app', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/app/create', label: 'Create', icon: Plus, primary: true },
  { to: '/app/mycodes', label: 'Codes', icon: Grid2X2 }
]

function titleFor(pathname) {
  const item = ALL_ITEMS.find((n) => n.to === pathname)
  return item ? item.label : 'Studio'
}

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Merge QR codes saved in Supabase Storage into the local cache on load.
  useEffect(() => {
    let alive = true
    syncFromCloud().then((list) => {
      if (alive && list) window.dispatchEvent(new Event('qrforge:codes:changed'))
    })
    return () => { alive = false }
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* faint top aurora for the main column */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(99_91_255/0.08),transparent)]"
      />

      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 flex-col overflow-hidden bg-ink-950 lg:flex">
          <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
            <LogoMark />
            <div className="leading-tight">
              <span className="block font-display text-[15px] font-extrabold tracking-tight text-white">
                QR<span className="text-gradient">Forge</span>
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">Studio</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <NavList onNavigate={() => {}} />
          </div>
          <div className="p-3">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
              <div aria-hidden="true" className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-indigo-500/30 blur-2xl" />
              <Sparkles size={15} className="text-indigo-300" />
              <p className="mt-2 text-xs font-semibold text-white">Forge unlimited</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                Everything is free forever — no paywall, ever.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col overflow-hidden bg-ink-950 shadow-2xl">
              <div className="flex items-center justify-between px-5 pb-2 pt-5">
                <div className="flex items-center gap-2.5">
                  <LogoMark />
                  <span className="font-display text-[15px] font-extrabold tracking-tight text-white">
                    QR<span className="text-gradient">Forge</span>
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
                <NavList onNavigate={() => setOpen(false)} />
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:pb-12">
          {/* Top bar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                onClick={() => setOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-soft lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg font-bold tracking-tight text-slate-900">
                  {titleFor(pathname)}
                </h1>
                <p className="hidden text-xs text-slate-400 sm:block">Free forever · No signup · No watermark</p>
              </div>
            </div>
            <Link
              to="/app/create"
              className="btn-primary hidden shrink-0 px-4 py-2 text-xs sm:inline-flex"
            >
              <Plus size={14} /> New QR Code
            </Link>
          </div>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 px-2 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1.5 lg:hidden"
        style={{ background: 'rgb(255 255 255 / 0.85)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          {BOTTOM_NAV.map((item) =>
            item.primary ? (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                aria-label={item.label}
                className="flex -mt-7 h-15 w-16 flex-col items-center justify-center rounded-2xl text-white shadow-glow"
                style={{ background: 'linear-gradient(135deg,#635bff,#a855f7)' }}
              >
                <QrCode size={21} />
                <span className="text-[10px] font-semibold leading-none pt-0.5">{item.label}</span>
              </NavLink>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-w-14 flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition ${
                    isActive ? 'text-indigo-600' : 'text-slate-500'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            )
          )}
        </div>
      </nav>
    </div>
  )
}

function NavList({ onNavigate }) {
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-5">
      {NAV.map((group) => (
        <div key={group.section}>
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {group.section}
          </p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-4">
        <NavItem item={{ to: '/app/settings', label: 'Settings', icon: Settings }} onNavigate={onNavigate} />
        <NavItem item={{ to: '/app/help', label: 'Help & Setup', icon: HelpCircle }} onNavigate={onNavigate} />
        <Link
          to="/"
          onClick={onNavigate}
          className="mt-1 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowUpRight size={16} /> Back to home
        </Link>
      </div>
    </nav>
  )
}

function NavItem({ item, onNavigate }) {
  const base = 'group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition'

  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          isActive
            ? `${base} text-white ring-1 ring-indigo-400/30 [background:linear-gradient(90deg,rgb(99_91_255/0.28),rgb(168_85_247/0.08))]`
            : `${base} text-slate-400 hover:bg-white/5 hover:text-white`
        }
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition group-hover:bg-white/10 group-hover:text-white"
        >
          <item.icon size={16} aria-hidden="true" />
        </span>
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="rounded-full bg-indigo-500/25 px-2 py-0.5 text-[10px] font-bold text-indigo-200 ring-1 ring-indigo-400/40">
            {item.badge}
          </span>
        )}
      </NavLink>
    </li>
  )
}