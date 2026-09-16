import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { CheckCircle2, Pin, ScanLine, XCircle, Camera, Loader2 } from 'lucide-react'

export default function QRScanner({ expectedPayload, expectedType }) {
  const [active, setActive] = useState(false)
  const [state, setState] = useState('idle') // idle | requesting | scanning | blocked
  const [decoded, setDecoded] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(0)
  const expectedRef = useRef(expectedPayload)
  expectedRef.current = expectedPayload

  const stop = () => {
    cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setState('idle')
  }

  const toggle = async () => {
    if (active) {
      stop()
      setActive(false)
      setDecoded('')
      return
    }
    setActive(true)
    setState('requesting')
    setDecoded('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      setState('scanning')
      loop()
    } catch {
      setState('blocked')
    }
  }

  const loop = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop)
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    let imageData
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    } catch {
      rafRef.current = requestAnimationFrame(loop)
      return
    }
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
    if (code && code.data) {
      setDecoded(code.data)
      // keep scanning briefly so the preview shows a match
      setTimeout(() => { if (streamRef.current) stop() }, 1500)
      setActive(false)
      return
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  useEffect(() => stop, [])

  const match = decoded && expectedPayload ? decoded === expectedPayload : null
  const before = expectedPayload ? expectedPayload.slice(0, 48) : ''

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ScanLine size={16} className="text-indigo-500" />
          <div>
            <p className="text-sm font-semibold text-slate-800">Test scan</p>
            <p className="text-xs text-slate-400">Scan the generated QR with your phone camera to verify.</p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={state === 'requesting'}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
            active
              ? 'border border-slate-300 bg-white text-slate-600 hover:border-red-300'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } disabled:opacity-60`}
        >
          {state === 'requesting' ? <Loader2 size={15} className="animate-spin" /> : active ? <Camera size={15} /> : <Camera size={15} />}
          {active ? 'Stop' : state === 'blocked' ? 'Retry' : 'Test with camera'}
        </button>
      </div>

      {active && state !== 'blocked' && (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-black">
          <video ref={videoRef} playsInline muted className="h-auto max-h-72 w-full object-contain" />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {state === 'blocked' && (
        <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
          Camera access was denied or isn‘t available here. Allow camera permission, or use your phone camera on the printed QR. The QR is still valid.
        </p>
      )}

      {!active && decoded && (
        <div className={`mt-3 flex items-start gap-2 rounded-lg p-2.5 text-sm ${match ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {match ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
          <div className="min-w-0">
            {match ? (
              <p className="font-semibold">Match — the QR decodes to exactly what you entered.</p>
            ) : (
              <p className="font-semibold">Decoded content differs from what you entered.</p>
            )}
            <p className="mt-1 break-all font-mono text-xs opacity-80">{decoded.slice(0, 300)}</p>
          </div>
        </div>
      )}

      {!active && !decoded && expectedPayload && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <Pin size={13} /> Expected to decode approximately: {expectedType === 'text' ? String(before) : before}{decodeSuffix(expectedType)}
        </p>
      )}
    </div>
  )
}

function decodeSuffix(type) {
  switch (type) {
    case 'url': return ' — a URL, so your camera may offer an "Open" action.'
    case 'wifi': return ' — a Wi-Fi network config; scanning joins the network directly in most phone cameras.'
    case 'contact': return ' — a vCard; scanning may add a contact.'
    default: return ''
  }
}