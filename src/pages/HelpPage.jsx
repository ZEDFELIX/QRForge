import { Link } from 'react-router-dom'
import { HelpCircle, QrCode, Radio, Share2, FileSpreadsheet, ShieldCheck } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <HelpCircle className="text-indigo-500" /> Help & FAQ
        </h1>
      </header>

      <section className="card p-6">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900"><QrCode size={17} className="text-indigo-500" /> Static vs Dynamic QR</h2>
        <p className="text-sm text-slate-600">
          <strong>Static QR</strong> — the information is permanently encoded inside the QR image. Free, unlimited, works forever, needs no account.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          <strong>Dynamic QR</strong> — the QR points to a QRForge-managed link that redirects to your destination. Change the destination later
          <em> without reprinting</em>. Requires the optional backend connection.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900"><Radio size={17} className="text-violet-500" /> Dynamic QR setup</h2>
        <ol className="ml-5 list-decimal space-y-1.5 text-sm text-slate-600">
          <li>Go to <Link to="/app/settings" className="text-indigo-600 hover:underline">Settings → Dynamic QR backend</Link>.</li>
          <li>Create a free Supabase project and run <code>supabase/schema.sql</code>.</li>
          <li>Add <code>VITE_SUPABASE_URL</code> + <code>VITE_SUPABASE_ANON_KEY</code> to Vercel env vars.</li>
          <li>Deploy. Those <code>/api/r/…</code> links now redirect and record scans.</li>
        </ol>
      </section>

      <section className="card p-6">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900"><Share2 size={17} className="text-amber-500" /> Landing pages</h2>
        <p className="text-sm text-slate-600">
          Build a page (menu, business card, social links…), preview it, download the self-contained HTML and host it on any static host.
          Then point a static or dynamic QR at its URL. Until the backend is connected we intentionally do <strong>not</strong> pretend QRForge hosts these automatically.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900"><FileSpreadsheet size={17} className="text-emerald-500" /> Bulk QR</h2>
        <p className="text-sm text-slate-600">
          Upload a CSV (first row = headers), pick the QR type, generate one QR per row, then download everything as a ZIP, plus a mapping CSV.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900"><ShieldCheck size={17} className="text-emerald-600" /> Privacy & security</h2>
        <ul className="ml-5 list-disc space-y-1.5 text-sm text-slate-600">
          <li>Static QR generation happens in your browser. Nothing is uploaded.</li>
          <li>History, folders, brand kit, campaigns: all in localStorage on your device.</li>
          <li>Dynamic scan analytics store coarse device/browser/country data only — never precise location, never content.</li>
          <li>Passwords for protected QR codes are stored as SHA-256 hashes, never plaintext.</li>
        </ul>
      </section>

      <p className="text-sm text-slate-400">
        Still stuck? <Link to="/" className="text-indigo-600 hover:underline">Try the free generator</Link> or see the <Link to="/app/dynamic" className="text-indigo-600 hover:underline">Dynamic QR dashboard</Link>.
      </p>
    </div>
  )
}