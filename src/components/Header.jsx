import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { QrCode, Menu, X } from 'lucide-react'

const NAV = [
  { to: '/', label: 'QR Generator' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/?show=faq', label: 'FAQ' }
]

export default function Header() {
  const [open, setOpen] = useState(false)

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="QRForge home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <QrCode size={20} aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            QR<span className="text-indigo-600">Forge</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={navLinkClass} end={n.to === '/'}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-slate-200 bg-white px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}