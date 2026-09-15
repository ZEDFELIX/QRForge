import { useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDown, Sparkles, Lock, MousePointerClick, Download, ShieldCheck, Smartphone, Wand2, GitCommit, Share2 } from 'lucide-react'
import QRGenerator from '../components/QRGenerator.jsx'
import FAQ from '../components/FAQ.jsx'

const FEATURES = [
  { icon: Sparkles, title: '100% Free', text: 'Generate QR codes without subscriptions.' },
  { icon: MousePointerClick, title: 'No Signup', text: 'Start generating immediately.' },
  { icon: Wand2, title: 'Customizable', text: 'Change colors, size, logo and more.' },
  { icon: Download, title: 'Download Anywhere', text: 'Export PNG, SVG and JPG.' },
  { icon: Lock, title: 'Privacy Friendly', text: 'Your QR content stays in your browser.' },
  { icon: Smartphone, title: 'Mobile Friendly', text: 'Works on phones, tablets and computers.' }
]

const STEPS = [
  { n: '01', icon: GitCommit, title: 'Enter your content', text: 'Pick a type — URL, text, Wi-Fi, email and more — and type your information.' },
  { n: '02', icon: Wand2, title: 'Customize your QR code', text: 'Choose colors, size, error correction, rounded corners and your logo.' },
  { n: '03', icon: Share2, title: 'Download and share', text: 'Export a crisp PNG, vector SVG or JPG, print it, or copy it to your clipboard.' }
]

export default function Home() {
  const [params] = useSearchParams()
  const faqRef = useRef(null)

  useEffect(() => {
    if (params.get('show') === 'faq' && faqRef.current) {
      faqRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [params])

  const scrollTo = () =>
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-100/70 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-24">
          <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700">
            <ShieldCheck size={15} aria-hidden="true" /> No signup · No watermark · Free forever
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Free QR Code Generator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
            Create beautiful, customizable QR codes instantly. No signup. No watermark.
            Completely free.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={scrollTo}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 sm:w-auto"
            >
              Create QR Code
            </button>
            <button
              onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 sm:w-auto"
            >
              How It Works <ArrowDown size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Generator */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <QRGenerator />
      </div>

      {/* Features */}
      <section className="border-t border-slate-100 bg-white" aria-labelledby="features-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="features-title" className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Built to be the simplest way to create QR codes
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-indigo-200 hover:shadow-sm">
                  <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{f.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50" aria-labelledby="how-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="how-title" className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="text-4xl font-extrabold text-indigo-100">{s.n}</span>
                  <span className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{s.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6" ref={faqRef}>
        <FAQ />
      </section>
    </>
  )
}