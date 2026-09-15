import { Link } from 'react-router-dom'
import { Lock, HardDrive, ImageIcon, UserX, Database } from 'lucide-react'

export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Privacy Policy</h1>
      <p className="mt-3 text-slate-500">Last updated: 2026 — QRForge is designed so your data stays yours.</p>

      <div className="mt-8 space-y-5 text-sm leading-relaxed text-slate-600">
        <Section icon={Lock} title="QR generation happens locally">
          <p>
            When you create a QR code, the content is encoded entirely in your browser using
            a client-side QR library. The text, URL, Wi-Fi credentials or contact details you
            enter are not sent to a QRForge server to generate the code.
          </p>
        </Section>

        <Section icon={UserX} title="No account, no signup">
          <p>
            QRForge has no login, signup or password system. There is nothing to sign up for
            — you can generate and download QR codes immediately.
          </p>
        </Section>

        <Section icon={HardDrive} title="Local history only">
          <p>
            Recently generated QR codes are stored in your browser's localStorage on your
            own device. This history is never transmitted to us, can be deleted item-by-item,
            and can be cleared entirely with the "Clear History" button. Just clearing your
            browser data removes it too.
          </p>
        </Section>

        <Section icon={ImageIcon} title="Uploaded logos stay on your device">
          <p>
            If you upload a logo to embed in your QR code, the image is read and processed
            in your browser as a data URL. The file is not uploaded anywhere.
          </p>
        </Section>

        <Section icon={Database} title="What we learn about you">
          <p>
            We do not require payment, do not track per-QR analytics, and do not build
            profiles from your QR content. The public pages only load static assets served
            by the hosting provider (Vercel), which operates under their own terms.
          </p>
        </Section>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Questions about privacy?{' '}
        <Link to="/about" className="font-medium text-indigo-600 hover:underline">
          Learn more about QRForge
        </Link>{' '}
        or head back to the{' '}
        <Link to="/" className="font-medium text-indigo-600 hover:underline">generator</Link>.
      </p>
    </main>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600">
          <Icon size={18} aria-hidden="true" />
        </span>
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}