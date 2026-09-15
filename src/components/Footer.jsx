import { Link } from 'react-router-dom'
import { QrCode } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <span className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <QrCode size={20} aria-hidden="true" />
              </span>
              QRForge
            </span>
            <p className="mt-2 text-sm text-slate-500">Create. Scan. Share. Free.</p>
            <p className="mt-1 text-xs text-slate-400">
              QR generation happens in your browser — no uploads, no tracking.
            </p>
          </div>
          <nav aria-label="Footer">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Links</h2>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-slate-500 hover:text-indigo-600">QR Generator</Link></li>
              <li><Link to="/about" className="text-slate-500 hover:text-indigo-600">About</Link></li>
              <li><Link to="/privacy" className="text-slate-500 hover:text-indigo-600">Privacy</Link></li>
              <li><Link to="/?show=faq" className="text-slate-500 hover:text-indigo-600">FAQ</Link></li>
            </ul>
          </nav>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Why QRForge</h2>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>100% free — no paywalls</li>
              <li>No account required</li>
              <li>No watermark on downloads</li>
              <li>Works offline after loading</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-400">
          © 2026 QRForge. Free QR code generation.
        </div>
      </div>
    </footer>
  )
}