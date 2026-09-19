import { CheckCircle2, Download, Sparkles } from 'lucide-react'

// Deterministic decorative QR (not a real code) rendered as inline SVG.
const N = 25

function hash(x, y) {
  let h = x * 374761393 + y * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  return ((h ^ (h >> 16)) >>> 0) / 4294967295
}

function isFinder(r, c) {
  return (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7)
}

function finderCell(v) {
  const patterns = [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1]
  ]
  return v
}

function cellColor(r, c) {
  if (isFinder(r, c)) {
    const lr = r < 7 ? r : r - (N - 7)
    const lc = c < 7 ? c : c - (N - 7)
    return finderCell(patterns[lr][lc]) ? '#07081a' : '#ffffff'
  }
  return hash(r, c) > 0.52 ? '#07081a' : '#ffffff'
}

const patterns = Array.from({ length: 7 }, (_, i) =>
  Array.from({ length: 7 }, (_, j) => (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4) ? 1 : 0))
)

const CHIPS = [
  { text: 'PNG · SVG · JPG', icon: Download, pos: 'left-[-14px] top-6', delay: '0s', cls: 'border-slate-200/80' },
  { text: 'No watermark', icon: CheckCircle2, pos: '-right-4 top-24', delay: '1.4s', cls: 'border-emerald-200/80' },
  { text: 'Free forever', icon: Sparkles, pos: '-left-8 bottom-16', delay: '2.2s', cls: 'border-indigo-200/80' }
]

export default function ScanVisual() {
  const cells = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" rx="0.22" fill={cellColor(r, c)} />)
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* glow */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 scale-90 rounded-full bg-gradient-to-tr from-indigo-500/30 via-fuchsia-400/20 to-cyan-300/30 blur-3xl" />

      {/* floating chips */}
      {CHIPS.map((chip) => {
        const Icon = chip.icon
        return (
          <span
            key={chip.text}
            className={`absolute z-10 inline-flex items-center gap-1.5 rounded-full border bg-white/90 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-elevated backdrop-blur ${chip.pos} ${chip.cls}`}
            style={{ animation: `float 6s ease-in-out infinite`, animationDelay: chip.delay }}
          >
            <Icon size={13} className="text-indigo-500" />
            {chip.text}
          </span>
        )
      })}

      {/* card */}
      <div className="animate-rise rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-elevated sm:p-6">
        <div className="flex items-center justify-between px-1.5">
          <span className="font-display text-[15px] font-bold text-slate-900">qrforge.app</span>
          <span className="chip bg-indigo-50 text-indigo-600">Scan me</span>
        </div>
        <svg
          viewBox={`0 0 ${N} ${N}`}
          role="img"
          aria-label="Decorative QR code"
          className="mt-3 h-auto w-full rounded-2xl p-1"
          style={{ background: '#ffffff' }}
          shapeRendering="crispEdges"
        >
          {cells}
        </svg>
        <div className="mt-3 flex items-center justify-between px-1.5">
          <span className="text-xs font-medium text-slate-400">Impressions: the code</span>
          <span className="chip border border-slate-200 bg-slate-50 text-slate-500">Encodes instantly</span>
        </div>
      </div>
    </div>
  )
}