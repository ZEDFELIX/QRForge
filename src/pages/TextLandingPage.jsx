import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { decodeTextPageParam } from '../utils/textPage.js'
import TextPageView from '../components/TextPageView.jsx'

// Public, full-screen page shown when someone scans a "landing page" text QR.
// Rendered client-side from the data embedded in the URL (/p/:data).

export default function TextLandingPage() {
  const { data } = useParams()
  const page = decodeTextPageParam(data)

  useEffect(() => {
    document.title = `${page ? page.title || 'QRForge text page' : 'QRForge'}`
  }, [page])

  if (!page) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-lg font-semibold text-slate-900">That QR didn’t resolve</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          The code isn’t a QRForge text page, or the link was altered. If you expected a page here,
          ask whoever made the code to generate it again.
        </p>
        <Link to="/" className="btn-primary mt-6 px-6 py-2.5 text-sm">Go to QRForge</Link>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-100/60">
      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:py-12">
        <TextPageView
          title={page.title}
          text={page.text}
          accent={page.accent}
          theme={page.theme}
          big={page.big}
        />
      </div>

      <footer className="pb-8 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-indigo-500"
        >
          <ShieldCheck size={13} /> Made with QRForge — free forever, no watermark
        </Link>
      </footer>
    </main>
  )
}