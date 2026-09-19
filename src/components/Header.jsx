import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react'
import LogoMark from './LogoMark.jsx'

const NAV = [
  { to: '/', label: 'Generator' },
  { to: '/?show=faq', label: 'FAQ' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' }
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
    }`

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass border-b border-slate-200/80 shadow-soft' : 'border-b border-transparent bg-white/60 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="QRForge home">
          <LogoMark className="transition-transform duration-300 group-hover:scale-105" />
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            QR<span className="text-gradient">Forge</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={navLinkClass} end={n.to === '/'}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 lg:inline-flex">
            <ShieldCheck size={13} className="text-emerald-500" /> Free forever · No signup
          </span>
          <Link
            to="/app"
            className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#635bff,#a855f7)' }}
          >
            Open Studio
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 md:hidden"
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
          className="glass border-t border-slate-200/70 px-4 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-1.5">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                to="/app"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#635bff,#a855f7)' }}
              >
                Open Studio <ArrowRight size={15} />
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}