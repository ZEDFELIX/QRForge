import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, AlertTriangle, ShieldCheck, QrCode } from 'lucide-react'
import { drawQr, contrastRatio } from '../utils/qrGenerator.js'

export default function QRPreview({
  payload, type, fields, fg, bg, size, margin, errorCorrection,
  rounded, logoDataUrl, logoRatio, hasErrors
}) {
  const canvasRef = useRef(null)
  const [ratio, setRatio] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !payload) return
    try {
      drawQr(canvas, payload, {
        fg, bg, size: 512, margin, errorCorrection, rounded, logoDataUrl, logoRatio
      })
      setRatio(contrastRatio(fg || '#111827', bg || '#ffffff'))
    } catch (e) {
      // oversized content -> leave empty; handled by error state in parent
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [payload, fg, bg, margin, errorCorrection, rounded, logoDataUrl, logoRatio])

  const lowContrast = ratio !== 0 && ratio < 2
  const logoTooBig = Boolean(logoDataUrl) && logoRatio > 0.22

  return (
    <div className="card p-6">
      <h2 className="mb-1 text-base font-semibold text-slate-900">Preview</h2>
      <p className="mb-4 text-sm text-slate-500">Updates live as you type.</p>

      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#ffffff_0%_50%)_50%/16px_16px] p-4">
        <canvas
          ref={canvasRef}
          style={{ width: 'min(100%, 420px)', height: 'auto', aspectRatio: '1 / 1' }}
          className="max-w-full"
          role="img"
          aria-label="Live preview of your QR code"
        />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        {hasErrors || !payload ? (
          <p className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={16} aria-hidden="true" />
            <span>Fix the highlighted fields to generate your QR code.</span>
          </p>
        ) : lowContrast ? (
          <p className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={16} aria-hidden="true" />
            <span>Low contrast — choose a darker foreground color to keep it scannable.</span>
          </p>
        ) : (
          <p className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>QR Code is ready to scan</span>
          </p>
        )}

        {logoTooBig && (
          <p className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={16} aria-hidden="true" />
            <span>Large logo — consider a smaller one for reliable scanning.</span>
          </p>
        )}

        {!hasErrors && payload && (
          <p className="flex items-center gap-2 text-slate-500">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Scannable: {size}px · EC {errorCorrection} · margin {margin}</span>
          </p>
        )}
      </div>

      {!payload && !hasErrors && (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
          <QrCode size={16} aria-hidden="true" /> Enter some content to preview.
        </p>
      )}
    </div>
  )
}