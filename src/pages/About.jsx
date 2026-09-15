import { Link } from 'react-router-dom'
import { QrCode, ShieldCheck, Lock, Smartphone, Sparkles, Download, Wand2 } from 'lucide-react'

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        About QRForge
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        QRForge is a free, fast and privacy-friendly QR code generator. Create QR codes
        for URLs, Wi-Fi, text, email, phone numbers and contacts — then download, print
        or share them as sharp PNG, SVG or JPG files.
      </p>

      <div className="mt-10 space-y-4">
        <FeatureRow icon={Sparkles} title="Why we built it">
          QR codes should be free. Too many services lock basic generation behind signups
          or watermarked downloads. QRForge keeps generation free, instant and open to
          everyone.
        </FeatureRow>
        <FeatureRow icon={Smartphone} title="Scannable by design">
          Every code follows the QR standard with a proper quiet zone, correct error
          correction and safe logo sizing — so it scans reliably on real phones.
        </FeatureRow>
        <FeatureRow icon={Wand2} title="Fully customizable">
          Change colors, size, margin, rounded corners and add your own logo. Higher
          error correction is applied automatically when a logo is present.
        </FeatureRow>
        <FeatureRow icon={Download} title="Export your way">
          High-resolution PNG for crisp prints, SVG for scalable vector use, JPG for
          lightweight sharing, plus copy-to-clipboard and print layouts.
        </FeatureRow>
      </div>

      <div className="mt-12 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <div className="flex items-start gap-3">
          <QrCode className="mt-0.5 shrink-0 text-indigo-600" size={22} aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-indigo-900">Privacy first</h2>
            <p className="mt-1 text-sm leading-relaxed text-indigo-800/80">
              QR generation is handled locally in your browser. Content is not uploaded to
              generate a QR code, history stays on your device, and uploaded logos never
              leave your machine. <Link to="/privacy" className="font-medium underline">Read the privacy policy</Link>.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          <QrCode size={18} aria-hidden="true" /> Start generating
        </Link>
      </div>
    </main>
  )
}

function FeatureRow({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{children}</p>
      </div>
    </div>
  )
}