import { useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, MousePointerClick, Wand2, Download, ShieldCheck, Check,
  Share2, Route, GalleryHorizontalEnd, FileStack, Landmark, LineChart,
  BadgePercent, Zap, Infinity as InfinityIcon, Palette, Cloud, GitCommit
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

const TICKER = [
  'URL', 'Text', 'Wi-Fi', 'WhatsApp', 'M-Pesa', 'Email', 'Phone', 'SMS',
  'vCard', 'Geo', 'Image QR', 'Menus', 'Social links'
]

const BENTO = [
  {
    icon: ShieldCheck,
    tint: 'from-emerald-500 to-teal-400',
    title: 'Private by design',
    text: 'Codes are forged entirely in your browser — nothing is uploaded, tracked or sold.',
    bullets: ['Runs 100% client-side', 'No uploads, no tracking', 'Saves locally or to your own Supabase'],
    span: 'lg:col-span-7'
  },
  {
    icon: Palette,
    tint: 'from-indigo-500 to-violet-500',
    title: 'Brand-perfect in seconds',
    text: 'Colors, logos, frames, call-to-action and one-tap presets — tuned until it looks effortless.',
    chips: ['PNG', 'SVG', 'JPG', 'Logo', 'Frame'],
    span: 'lg:col-span-5'
  },
  {
    icon: Landmark,
    tint: 'from-amber-500 to-orange-400',
    title: 'Built for payments',
    text: 'WhatsApp and M-Pesa codes that link straight to chat or a pre-filled payment. Perfect for menus, shops and stalls.',
    chips: ['WhatsApp', 'M-Pesa', 'Menu QR'],
    span: 'lg:col-span-5',
    accent: true
  },
  {
    icon: Route,
    tint: 'from-fuchsia-500 to-pink-500',
    title: 'Dynamic QR that really redirects',
    text: 'Short, editable links that can change destination even after printing — backed by a real serverless redirect engine, not a mock.',
    span: 'lg:col-span-7'
  },
  {
    icon: FileStack,
    tint: 'from-cyan-500 to-sky-400',
    title: 'Bulk QR for any spreadsheet',
    text: 'Paste a CSV and generate hundreds of branded codes as a ready-to-print ZIP — inventory, tickets and menus at scale.',
    span: 'lg:col-span-6'
  },
  {
    icon: Cloud,
    tint: 'from-violet-500 to-indigo-500',
    title: 'Backup & analytics',
    text: 'Saved codes sync to your own storage bucket and survive across devices — with scan insights when you connect a backend.',
    span: 'lg:col-span-6'
  }
]

const TOOLS = [
  { to: '/app/create', icon: Wand2, tint: 'from-indigo-500 to-violet-500', title: 'QR Studio', text: 'Design, frame and brand any code. Colors, logo, styles, live preview.' },
  { to: '/app/dynamic', icon: Route, tint: 'from-fuchsia-500 to-pink-500', title: 'Dynamic QR', text: 'Short redirect links you can edit anytime. Serverless-powered.' },
  { to: '/app/templates', icon: GalleryHorizontalEnd, tint: 'from-cyan-500 to-sky-400', title: 'Template gallery', text: 'Business cards, Wi-Fi, menus, social profiles — start pre-filled.' },
  { to: '/app/bulk', icon: FileStack, tint: 'from-amber-500 to-orange-400', title: 'Bulk generator', text: 'CSV in, branded ZIP out. Hundreds of codes in one click.' },
  { to: '/app/landing', icon: MousePointerClick, tint: 'from-emerald-500 to-teal-400', title: 'Landing pages', text: 'Turn a QR into a mini web page you can customize and host.' },
  { to: '/app/analytics', icon: LineChart, tint: 'from-violet-500 to-indigo-500', title: 'Analytics', text: 'Scan activity, traffic and download insights across your codes.' }
]

const STEPS = [
  { n: '01', icon: GitCommit, title: 'Enter your content', text: 'Pick a type — URL, text, Wi-Fi, email, WhatsApp, M-Pesa and more — then type your info.' },
  { n: '02', icon: Wand2, title: 'Forge the design', text: 'Choose colors, error correction, rounded corners, a logo, frame and a call-to-action.' },
  { n: '03', icon: Share2, title: 'Download and share', text: 'Export crisp PNG, vector SVG or JPG, or copy straight to your clipboard.' }
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
      {/* ==== Midnight hero dome ==== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:pt-10">
          <div className="panel-ink relative overflow-hidden rounded-[36px] px-6 pb-8 pt-12 shadow-elevated sm:px-10 lg:px-14 lg:pb-12 lg:pt-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

            <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="animate-rise text-center lg:text-left">
                <p className="chip-dark mx-auto lg:mx-0">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Free forever · No signup · No watermark
                </p>

                <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl xl:text-6xl">
                  QR codes your customers{' '}
                  <span className="text-gradient">actually scan</span>.
                </h1>

                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0">
                  QRForge turns menus, Wi-Fi, WhatsApp, M-Pesa payments and business
                  cards into crisp, branded, scannable codes — designed in your
                  browser, stored on your terms.
                </p>

                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <button
                    onClick={() => scrollTo('generator')}
                    className="btn-primary w-full px-7 py-3.5 text-base sm:w-auto"
                  >
                    Start crafting — it's free
                    <ArrowRight size={17} />
                  </button>
                  <button
                    onClick={() => scrollTo('how')}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 sm:w-auto"
                  >
                    See how it works
                  </button>
                </div>

                <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-400 lg:justify-start">
                  {['PNG · SVG · JPG', 'Works offline (PWA)', 'Private by design'].map((t) => (
                    <li key={t} className="inline-flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-indigo-400" /> {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="animate-rise" style={{ animationDelay: '0.12s' }}>
                <div className="relative">
                  <div aria-hidden="true" className="absolute -inset-8 rounded-full bg-fuchsia-500/20 blur-3xl" />
                  <div className="glass-dark relative rounded-[28px] p-3 ring-1 ring-white/15 shadow-elevated sm:p-4">
                    <ScanVisual />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
              {STATS.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="flex items-center gap-3 bg-ink-950/70 px-5 py-4 animate-rise" style={{ animationDelay: '0.2s' }}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-300 ring-1 ring-white/10">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-display text-xl font-bold text-white">{s.value}</p>
                      <p className="text-xs font-medium text-slate-400">{s.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==== Type ticker ==== */}
      <section aria-hidden="true" className="border-b border-slate-100 bg-white py-5">
        <div className="mask-fade-x overflow-hidden">
          <div className="flex w-max animate-ticker">
            {[0, 1].map((k) => (
              <ul key={k} className="flex shrink-0 items-center">
                {TICKER.map((t) => (
                  <li key={t} className="inline-flex items-center whitespace-nowrap px-5 text-sm font-semibold text-slate-400">
                    <span className="mr-2.5 inline-block h-2 w-2 rounded-sm bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
                    {t}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>
      {/* ==== Generator ==== */}
      <section id="generator" className="scroll-mt-20 bg-white">
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
          <div className="card relative overflow-hidden ring-1 ring-slate-200/70 shadow-elevated">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <span className="ml-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Wand2 size={13} className="text-indigo-400" /> qrforge.studio — live generator
              </span>
            </div>
            <QRGenerator />
          </div>
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
                {f.bullets && (
                  <ul className="mt-4 space-y-1.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check size={14} className="shrink-0 text-emerald-500" /> {b}
                      </li>
                    ))}
                  </ul>
                )}
                {f.chips && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {f.chips.map((c) => (
                      <span key={c} className="chip bg-slate-100 text-slate-600">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ==== Platform / Studio tools ==== */}
      <section className="bg-[#f3f4fd]">
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
            {TOOLS.map((t, i) => {
              const Icon = t.icon
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className="card card-hover group relative overflow-hidden block p-6"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-3 font-display text-5xl font-extrabold tracking-tight text-slate-100 transition-colors group-hover:text-indigo-100"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr text-white shadow-soft ${t.tint}`}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="mt-4 flex items-center gap-1.5 font-display text-[15px] font-semibold text-slate-900">
                    {t.title}
                    <ArrowRight size={14} className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-500">{t.text}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
      {/* ==== How it works ==== */}
      <section id="how" className="scroll-mt-20 bg-white" aria-labelledby="how-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-12 text-center">
            <p className="eyebrow">Workflow</p>
            <h2 id="how-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From content to code in three steps
            </h2>
          </div>
          <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <li key={s.n} className="card card-hover animate-rise p-6" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-center gap-4">
                    <span className="rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 px-2.5 py-1.5 font-display text-sm font-extrabold text-white shadow-soft">
                      {s.n}
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                      <Icon size={19} aria-hidden="true" />
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
        <div className="ring-gradient relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-white px-6 py-14 text-center shadow-soft sm:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-indigo-200/50 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-fuchsia-200/50 blur-3xl" />
          <p className="eyebrow relative">No account · No credit card · No watermark</p>
          <h2 className="relative mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your QR code should look as good as your work.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-500">
            From product labels to restaurant menus — craft a code that belongs on anything you make.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => scrollTo('generator')} className="btn-primary px-7 py-3.5 text-base">
              Start for free <ArrowRight size={17} />
            </button>
            <Link
              to="/app/templates"
              className="btn-secondary flex items-center justify-center gap-2 px-7 py-3.5 text-base"
            >
              <GalleryHorizontalEnd size={17} /> Browse templates
            </Link>
          </div>
        </div>
      </section>

      {/* ==== FAQ ==== */}
      <section className="scroll-mt-24 bg-slate-50/80" ref={faqRef}>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <FAQ />
        </div>
      </section>
    </>
  )
}