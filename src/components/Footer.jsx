import { Link } from 'react-router-dom'
import { Github, ShieldCheck, QrCode } from 'lucide-react'
import LogoMark from './LogoMark.jsx'

const PRODUCT = [
  { to: '/', label: 'QR Generator' },
  { to: '/app/create', label: 'Create QR' },
  { to: '/app/templates', label: 'Templates' },
  { to: '/app/bulk', label: 'Bulk QR (CSV)' },
  { to: '/app/landing', label: 'Landing Pages' }
]

const PLATFORM = [
  { to: '/app/dynamic', label: 'Dynamic QR' },
  { to: '/app/analytics', label: 'Analytics' },
  { to: '/app/campaigns', label: 'Campaigns' },
  { to: '/app/brand', label: 'Brand Kit' },
  { to: '/app/mycodes', label: 'My QR Codes' }
]

const COMPANY = [
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/?show=faq', label: 'FAQ' },
  { to: '/app/help', label: 'Help & Setup' }
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-950 text-slate-300">
      {/* gradient hairline */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px brand-ring" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-0 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-20 h-80 w-80 rounded-full bg-fuchsia-600/15 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <LogoMark />
              <span className="text-lg font-extrabold tracking-tight text-white">
                QR<span className="text-gradient">Forge</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Forge crisp, on-brand QR codes and landing pages — right in your browser. Free forever, no signup, no watermark.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2"><ShieldCheck size={13} className="text-emerald-400" /> Generation happens on your device — nothing is uploaded</li>
              <li className="flex items-center gap-2"><QrCode size={13} className="text-indigo-300" /> Works offline after first visit (PWA)</li>
            </ul>
          </div>

          <FooterCol title="Product" links={PRODUCT} />
          <FooterCol title="Platform" links={PLATFORM} />
          <FooterCol title="Company" links={COMPANY} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 QRForge. Crafted for creators, businesses and teams.</p>
          <a
            href="https://github.com/ZEDFELIX/QRForge"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-slate-200"
          >
            <Github size={14} /> View on GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-3 text-sm font-semibold text-white">{title}</h2>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-slate-400 transition hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}