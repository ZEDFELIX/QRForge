import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, ShieldAlert, Globe, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { qrHealth, checkDestination, destinationBrief, overallLabel } from '../utils/health.js'

export default function QRHealthCard({ fg, bg, margin, rounded, logoDataUrl, logoRatio, errorCorrection, previewUrl, canCheckUrl }) {
  const local = qrHealth({ fg, bg, margin, rounded, logoDataUrl, logoRatio, errorCorrection })
  const [urlState, setUrlState] = useState({ checking: false, result: null })
  const ranFor = useRef('')
  const canCheck = canCheckUrl && Boolean(previewUrl)

  useEffect(() => {
    if (!canCheck || !previewUrl) {
      setUrlState({ checking: false, result: null })
      ranFor.current = ''
      return
    }
    if (ranFor.current === previewUrl) return
    let cancelled = false
    ranFor.current = previewUrl
    setUrlState({ checking: true, result: null })
    checkDestination(previewUrl).then((result) => {
      if (!cancelled) setUrlState({ checking: false, result })
    })
    return () => { cancelled = true }
  }, [canCheck, previewUrl])

  const showBad = local.checks.some((c) => c.status === 'bad')

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {showBad ? <ShieldAlert size={16} className="text-amber-500" /> : <ShieldCheck size={16} className="text-emerald-500" />}
          QR health
        </p>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${local.overall === 'excellent' ? 'bg-emerald-100 text-emerald-700' : local.overall === 'attention' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
          {overallLabel(local.overall)}
        </span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {local.checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-xs text-slate-600">
            <span className="mt-0.5 shrink-0">
              {c.status === 'ok' ? <CheckCircle2 size={13} className="text-emerald-500" /> : c.status === 'warn' ? <AlertTriangle size={13} className="text-amber-500" /> : <AlertTriangle size={13} className="text-red-500" />}
            </span>
            <span><span className="font-medium">{c.label}:</span> {c.message}</span>
          </li>
        ))}
      </ul>

      {canCheck && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Globe size={13} /> Link preview
          </p>
          {urlState.checking ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><Loader2 size={12} className="animate-spin" /> Checking destination…</p>
          ) : urlState.result ? (
            <>
              <p className="mt-1 text-xs text-slate-600">{destinationBrief(urlState.result)}</p>
              {urlState.result.title && <p className="text-xs text-slate-400">"{urlState.result.title}"</p>}
              {!urlState.result.okay && (
                <p className="mt-1 text-xs text-amber-600">{urlState.result.note} The QR itself still encodes your URL correctly.</p>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}