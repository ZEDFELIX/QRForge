import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, QrCode, Grid2X2, Radio, BarChart3, Layers, FileSpreadsheet,
  Palette, Settings, HelpCircle, Menu, X, Plus, ChevronRight, QrCode as Qr
} from 'lucide-react'

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/create', label: 'Create QR', icon: QrCode },
  { to: '/app/mycodes', label: 'My QR Codes', icon: Grid2X2 },
  { to: '/app/dynamic', label: 'Dynamic QR', icon: Radio, badge: 'New' },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/campaigns', label: 'Campaigns', icon: Layers },
  { to: '/app/bulk', label: 'Bulk QR', icon: FileSpreadsheet },
  { to: '/app/templates', label: 'Templates', icon: Palette },
  { to: '/app/landing', label: 'Landing Pages', icon: LayoutDashboard },
  { to: '/app/brand', label: 'Brand Kit', icon: Palette }
]

const BOTTOM_NAV = [
  { to: '/app', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/app/create', label: 'Create QR', icon: Plus, primary: true },
  { to: '/app/mycodes', label: 'My Codes', icon: Grid2X2 }
]

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-3 py-6 lg:block">
          <NavList
            items={NAV}
            footerItems={[
              { to: '/app/settings', label: 'Settings', icon: Settings },
              { to: '/app/help', label: 'Help', icon: HelpCircle }
            ]}
            onNavigate={() => {}}
          />
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">Menu</span>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <NavList items={NAV} footerItems={[{ to: '/app/settings', label: 'Settings', icon: Settings }, { to: '/app/help', label: 'Help', icon: HelpCircle }]} onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-10">
          {/* Mobile top bar */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setOpen(true)}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
              aria-label="Open menu"
            >
              <Menu size={18} /> Menu
            </button>
            <Link to="/app/create" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm">
              <Plus size={16} /> Create
            </Link>
          </div>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden" aria-label="Mobile navigation">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {BOTTOM_NAV.map((item) =>
            item.primary ? (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex -mt-5 h-14 w-14 flex-col items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              >
                <Qr size={22} />
                <span className="text-[10px] font-semibold leading-none pt-1">{item.label}</span>
              </NavLink>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-w-14 flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium ${
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

function NavList({ items, footerItems, onNavigate }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
    }`

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Dashboard">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={onNavigate}>
          <item.icon size={18} />
          <span className="flex-1">{item.label}</span>
          {item.badge && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">{item.badge}</span>}
        </NavLink>
      ))}
      <div className="my-3 h-px bg-slate-200" />
      {footerItems.map((item) => (
        <NavLink key={item.to} to={item.to} className={linkClass} onClick={onNavigate}>
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}