import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Is the QR generator really free?',
    a: 'Yes. Basic QR generation and downloads (PNG, SVG and JPG) are completely free — no subscriptions, paywalls or hidden limits.'
  },
  {
    q: 'Do I need an account?',
    a: 'No. Open the page, type your content, and generate. There is no login, signup or password anywhere.'
  },
  {
    q: 'Does QRForge store my data?',
    a: 'The generator processes everything locally in your browser. Your content is never uploaded just to generate a QR code. Your recent-QR history is stored on your own device via localStorage and can be cleared at any time.'
  },
  {
    q: 'Can I create a QR code for Wi-Fi?',
    a: 'Yes. Choose the Wi-Fi type, enter the network name, password and security type, and generate a code that connects phones instantly.'
  },
  {
    q: 'Can I add my logo?',
    a: 'Yes. Upload a PNG, JPG or WebP logo and it appears in the center of the QR. QRForge automatically raises error correction for reliable scanning.'
  },
  {
    q: 'Can I print my QR code?',
    a: 'Yes. Use the Print button to open a clean, print-ready layout with your QR scaled to full scannable sharpness.'
  },
  {
    q: 'Do QR codes expire?',
    a: 'No. Static QR codes encode their information directly in the pattern — they do not expire by themselves and keep working as long as the printed surface stays intact.'
  }
]

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24">
      <h2 id="faq-title" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Frequently asked questions
      </h2>
      <p className="mt-2 text-slate-500">Everything you might want to know about QRForge.</p>
      <div className="mt-8 space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
              >
                <span className="font-medium text-slate-900">{f.q}</span>
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div id={`faq-${i}`} className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
                  {f.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}