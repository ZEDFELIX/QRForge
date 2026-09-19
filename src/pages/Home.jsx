import { useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, MousePointerClick, Wand2, Download, ShieldCheck,
  GitCommit, Share2, Route, GalleryHorizontalEnd, FileStack, MousePointerClick as Cursor,
  Landmark, LineChart, BadgePercent, Zap, Database, Infinity as InfinityIcon
} from 'lucide-react'
import QRGenerator from '../components/QRGenerator.jsx'
import FAQ from '../components/FAQ.jsx'
import ScanVisual from '../components/ScanVisual.jsx'

const STATS = [
  { value: '10+', label: 'QR types', icon: Zap },
  { value: '4', label: 'Formats', icon: Download },
  { value: '∞', label: 'Scans', icon: InfinityIcon },
  { value: '0', label: 'Paywalls', icon: BadgePercent }
]

const BENTO = [
  {
    icon: ShieldCheck,
    tint: 'from-emerald-500 to-teal-400',
    title: 'Private by design',
    text: 'QR codes are generated entirely in your browser. Nothing is uploaded, tracked or sold — your data never leaves your device.',
    span: 'lg:col-span-4'
  },
  {
    icon: Wand2,
    tint: 'from-indigo-500 to-violet-500',
    title: 'Brand-perfect in seconds',
    text: 'Match your identity with colors, logos, frames, calls-to-action and one-tap design presets. Export crisp PNG, vector SVG or JPG.',
    span: 'lg:col-span-4'
  },
  {
    icon: Landmark,
    tint: 'from-fuchsia-500 to-pink-500',
    title: 'Built for payments',
    text: 'Dedicated WhatsApp and M-Pesa QR types that link straight to chat or a pre-filled payment — perfect for menus, shops and stalls.',
    span: 'lg:col-span-4',
    accent: true
  },
  {
    icon: Database,
    tint: 'from-cyan-500 to-sky-400',
    title: 'Dynamic QR that really redirects',
    text: 'Short, editable links that can change destination after printing — backed by a real serverless redirect engine, not a mock.',
    span: 'lg:col-span-6'
  },
  {
    icon: FileStack,
    tint: 'from-amber-500 to-orange-400',
    title: 'Bulk QR for any spreadsheet',
    text: 'Paste a CSV and generate hundreds of branded codes at once, exported as a ready-to-print ZIP. Ideal for inventory, tickets and menus.',
    span: 'lg:col-span-6'
  }
]

const TOOLS = [
  { to: '/app/create', icon: Wand2, tint: 'from-indigo-500 to-violet-500', title: 'QR Studio', text: 'Design, frame and brand any code. Colors, logo, styles, live preview.' },
  { to: '/app/dynamic', icon: Route, tint: 'from-fuchsia-500 to-pink-500', title: 'Dynamic QR', text: 'Short redirect links you can edit anytime. Serverless-powered.' },
  { to: '/app/templates', icon: GalleryHorizontalEnd, tint: 'from-cyan-500 to-sky-400', title: 'Template gallery', text: 'Business cards, Wi-Fi, menus, social profiles — start pre-filled.' },
  { to: '/app/bulk', icon: FileStack, tint: 'from-amber-500 to-orange-400', title: 'Bulk generator', text: 'CSV in, branded ZIP out. Hundreds of codes in one click.' },
  { to: '/app/landing', icon: Cursor, tint: 'from-emerald-500 to-teal-400', title: 'Landing pages', text: 'Turn a QR into a mini web page you can customize and host.' },
  { to: '/app/analytics', icon: LineChart, tint: 'from-violet-500 to-indigo-500', title: 'Analytics', text: 'Scan activity, traffic and download insights across your codes.' }
]

const STEPS = [
  { n: '01', icon: GitCommit, title: 'Enter your content', text: 'Pick a type — URL, text, Wi-Fi, email, WhatsApp, M-Pesa and more — then type your info.' },
  { n: '02', icon: Wand2, title: 'Forge the design', text: 'Choose colors, error correction, rounded corners, a logo, frame and a call-to-action.' },
  { n: '03', icon: Share2, title: 'Download and share', text: 'Export crisp PNG, vector SVG or JPG, or copy straight to your clipboard.'
  }
]

export default function Home() {
  const [params] = useSearchParams()
  const faqRef = useRef(null)

  useEffect(() => {
    if (params.get('show') === 'faq' && faqRef.current) {
      faqRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [params])

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      {/* ==== Hero ==== */}
      <section className="relative overflow-hidden">
        {/* aurora background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute right-[-120px] top-40 h-[360px] w-[360px] rounded-full bg-fuchsia-100/50 blur-3xl" />
          <div className="absolute left-[-140px] top-64 h-[340px] w-[340px] rounded-full bg-cyan-100/50 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-10%,rgb(99_91_255/0.10),transparent)]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          {/* Copy */}
          <div className="animate-rise text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/70 px-4 py-1.5 text-xs font-semibold text-indigo-600 shadow-soft backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Free forever · No signup · No watermark
            </p>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl xl:text-7xl">
              Forge QR codes as{' '}
              <span className="text-gradient">polished</span> as your brand.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-500 lg:mx-0">
              QRForge creates crisp, customizable, scannable codes right in your browser —
              for menus, Wi-Fi, WhatsApp, M-Pesa payments, business cards and more.
              No uploads. No limits. Ever.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button
                onClick={() => scrollTo('generator')}
                className="btn-primary w-full px-7 py-3.5 text-base sm:w-auto"
              >
                Start crafting — it's free
                <ArrowRight size={17} />
              </button>
              <Link
                to="/app"
                className="btn-secondary w-full px-7 py-3.5 text-base sm:w-auto"
              >
                Explore the Studio
              </Link>
            </div>

            {/* mini proof strip */}
            <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-400 lg:justify-start">
              {['PNG · SVG · JPG', 'Works offline (PWA)', 'No account needed'].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-indigo-400" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="animate-rise" style={{ animationDelay: '0.12s' }}>
            <ScanVisual />
          </div>
        </div>

        {/* stats strip */}
        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <div className="card card-hover grid grid-cols-2 divide-slate-100 rounded-2xl sm:grid-cols-4 sm:divide-x">
            {STATS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-3 px-6 py-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-xl font-bold text-slate-900">{s.value}</p>
                    <p className="text-xs font-medium text-slate-400">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ==== Generator ==== */}
      <section id="generator" className="scroll-mt-20 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <p className="eyebrow">The Forge</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Craft it. Customize it. Ship it.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Everything updates live as you design — no preview refresh, no waiting.
            </p>
          </div>
          <QRGenerator />
        </div>
      </section>

      {/* ==== Bento features ==== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="eyebrow">Why QRForge</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Serious tools, zero strings attached
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {BENTO.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`card card-hover p-7 ${f.span} ${f.accent ? 'relative overflow-hidden' : ''}`}
              >
                {f.accent && (
                  <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-tr from-fuchsia-200/60 to-indigo-200/60 blur-2xl" />
                )}
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr text-white shadow-soft ${f.tint}`}
                >
                  <Icon size={21} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ==== Platform / Studio tools ==== */}
      <section className="bg-[#edf0fb]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Platform</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything a QR business needs
              </h2>
            </div>
            <Link to="/app" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
              Open the Studio
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => {
              const Icon = t.icon
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className="card card-hover group flex items-start gap-4 p-6"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr text-white shadow-soft ${t.tint}`}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 font-display text-[15px] font-semibold text-slate-900">
                      {t.title}
                      <ArrowRight size={14} className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-500">{t.text}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ==== How it works ==== */}
      <section id="how" className="scroll-mt-20 border-t border-slate-100 bg-white" aria-labelledby="how-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-12 text-center">
            <p className="eyebrow">Workflow</p>
            <h2 id="how-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From content to code in three steps
            </h2>
          </div>
          <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <li key={s.n} className="relative animate-rise" style={{ animationDelay: `${i * 0.1}s` }}>
                  {i < STEPS.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute left-full top-10 hidden h-px w-8 -translate-x-1/2 bg-gradient-to-r from-slate-200 to-transparent md:block lg:w-16"
                    />
                  )}
                  <div className="flex items-center gap-4">
                    <span className="font-display text-5xl font-extrabold tracking-tight text-indigo-100">
                      {s.n}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.text}</p>
                </li>
              )
            })}
          </ol>
          <div className="mt-12 text-center">
            <button onClick={() => scrollTo('generator')} className="btn-primary px-7 py-3">
              <MousePointerClick size={16} /> Make your first QR code
            </button>
          </div>
        </div>
      </section>

      {/* ==== CTA band ==== */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-ink-950 px-6 py-16 text-center shadow-elevated sm:px-12">
          <div aria-hidden="true" className="pointer-events-none relative mx-auto mb-6 h-40 w-40 rounded-full bg-indigo-500/40 blur-3xl" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
            No account · No credit card · No watermark
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your QR code should look as good as your work.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Join thousands forging codes with QRForge — free forever, with zero catches.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => scrollTo('generator')} className="btn-primary px-7 py-3.5 text-base">
              Start for free <ArrowRight size={17} />
            </button>
            <Link
              to="/app/templates"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              Browse templates
            </Link>
          </div>
        </div>
      </section>

      {/* ==== FAQ ==== */}
      <section className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6" ref={faqRef}>
        <FAQ />
      </section>
    </>
  )
}