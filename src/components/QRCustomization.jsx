import { useRef, useState } from 'react'
import { AlertTriangle, UploadCloud, X, Palette, Info, Lock, LockOpen, Frame } from 'lucide-react'
import { isValidHex } from '../utils/validators.js'

// Design presets — all remain scannable by construction.
const PRESETS = [
  { id: 'classic', name: 'Classic', fg: '#111827', bg: '#ffffff', rounded: false },
  { id: 'modern', name: 'Modern', fg: '#4F46E5', bg: '#ffffff', rounded: true },
  { id: 'soft', name: 'Soft', fg: '#334155', bg: '#F8FAFC', rounded: true },
  { id: 'bold', name: 'Bold', fg: '#0F172A', bg: '#FBBF24', rounded: false },
  { id: 'business', name: 'Business', fg: '#1E3A8A', bg: '#EFF6FF', rounded: false },
  { id: 'minimal', name: 'Minimal', fg: '#000000', bg: '#FFFFFF', rounded: false },
  { id: 'gradient', name: 'Gradient', fg: '#312E81', bg: '#EEF2FF', rounded: true }
]

const FRAME_SUGGESTIONS = ['SCAN ME', 'SCAN TO VISIT', 'SCAN FOR MENU', 'SCAN FOR DISCOUNT', 'SCAN TO CONTACT US', 'SCAN TO PAY']
const CTA_SUGGESTIONS = ['Scan to Order', 'Scan for Menu', 'Scan to WhatsApp', 'Scan to Follow', 'Scan to Register']

export default function QRCustomization({
  fg, onFg, bg, onBg, size, onSize, margin, onMargin, errorCorrection, onErrorCorrection,
  rounded, onRounded, logoDataUrl, onLogo, logoRatio, onLogoRatio, hasLogo,
  onApplyPreset, frameText, onFrameText, frameColor, onFrameColor,
  ctaText, onCtaText, ctaBg, onCtaBg, ctaColor, onCtaColor,
  designLocked, onToggleDesignLock, onApplyBrand
}) {
  const fileRef = useRef(null)
  const [logoError, setLogoError] = useState('')

  const handleLogo = (e) => {
    const file = e.target.files?.[0]
    setLogoError('')
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setLogoError('Please choose a PNG, JPG, or WebP image.'); return }
    if (file.size > 1024 * 1024) { setLogoError('Logo must be smaller than 1 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => { onLogo(reader.result); e.target.value = '' }
    reader.onerror = () => setLogoError('Could not read that file.')
    reader.readAsDataURL(file)
  }

  const colorInput = (value, onChange, label, id) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={id}>{label}</label>
      <div className="flex items-center gap-2">
        <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-200" style={{ background: isValidHex(value) ? value : '#ffffff' }} aria-label={`${label} color picker`}>
          <input type="color" value={isValidHex(value) ? value.toLowerCase() : '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </label>
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#111827" aria-label={`${label} hex value`} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      {value && !isValidHex(value) && <p className="mt-1 text-xs text-red-500">Invalid hex color. Use #RRGGBB.</p>}
    </div>
  )

  const label = 'mb-1 block text-sm font-medium text-slate-700'
  const disabled = designLocked

  const selectClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100'

  return (
    <section className="card p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900"><Palette size={18} className="text-indigo-500" /> Design</h2>
        {designLocked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700"><Lock size={11} /> Design locked</span>
        )}
      </div>
      <p className="mb-4 text-sm text-slate-500">Style your QR code — every preset stays scannable. You can lock the design when done.</p>

      {/* Design presets */}
      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-slate-700">Design styles</p>
        {onApplyBrand && (
          <button
            type="button"
            onClick={onApplyBrand}
            disabled={disabled}
            title="Apply saved brand colors and logo"
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Palette size={13} /> Apply Brand Kit
          </button>
        )}
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onApplyPreset(p)}
              disabled={disabled}
              title={p.name}
              className="group flex flex-col items-center gap-1 rounded-xl border border-slate-200 p-2 transition hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-md border border-slate-200"
                style={{ background: p.bg }}
                aria-hidden
              >
                <span className="block h-3.5 w-3.5" style={{ background: p.fg, borderRadius: p.rounded ? '2px' : 0 }} />
              </span>
              <span className="text-[10px] font-medium text-slate-500">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {colorInput(fg, onFg, 'Foreground color', 'fg-color')}
        {colorInput(bg, onBg, 'Background color', 'bg-color')}
        <div>
          <label className={label} htmlFor="qr-size">Size: {size}px</label>
          <input id="qr-size" type="range" min="256" max="1024" step="64" value={size} onChange={(e) => onSize(Number(e.target.value))} className="w-full accent-indigo-600" disabled={disabled} />
        </div>
        <div>
          <label className={label} htmlFor="qr-margin">Quiet zone (margin): {margin}</label>
          <input id="qr-margin" type="range" min="2" max="8" step="1" value={margin} onChange={(e) => onMargin(Number(e.target.value))} className="w-full accent-indigo-600" disabled={disabled} />
        </div>
        <div>
          <label className={label} htmlFor="qr-ec">Error correction</label>
          <select id="qr-ec" value={errorCorrection} onChange={(e) => onErrorCorrection(e.target.value)} disabled={disabled || hasLogo} className={selectClass}>
            <option value="L">Low (L) — smallest size</option>
            <option value="M">Medium (M)</option>
            <option value="Q">Quartile (Q)</option>
            <option value="H">High (H) — most reliable</option>
          </select>
          {hasLogo && <p className="mt-1 text-xs text-slate-400">Locked to High (H) while a logo is embedded.</p>}
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={rounded} onChange={(e) => onRounded(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" disabled={disabled} />
            Rounded modules
          </label>
        </div>
      </div>

      {/* Frame */}
      <div className="mt-5 rounded-xl border border-slate-200 p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"><Frame size={14} style={{ color: frameColor === 'auto' ? '#6366f1' : frameColor }} /> QR frame (top label)</p>
        <div className="flex flex-wrap gap-1.5">
          {FRAME_SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => onFrameText(frameText === s ? '' : s)} disabled={disabled} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${frameText === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-300'}`}>{s}</button>
          ))}
        </div>
        <input
          className="input mt-2 w-full"
          value={frameText}
          onChange={(e) => onFrameText(e.target.value)}
          placeholder="Or type custom frame text…"
          disabled={disabled}
        />
        {frameText && (
          <div className="mt-2">{colorInput(frameColor, onFrameColor, 'Frame color (auto = foreground)', 'frame-color')}</div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-4 rounded-xl border border-slate-200 p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Call-to-action below QR</p>
        <div className="flex flex-wrap gap-1.5">
          {CTA_SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => onCtaText(ctaText === s ? '' : s)} disabled={disabled} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${ctaText === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-300'}`}>{s}</button>
          ))}
        </div>
        <input className="input mt-2 w-full" value={ctaText} onChange={(e) => onCtaText(e.target.value)} placeholder="e.g. Scan to Order" disabled={disabled} />
        {ctaText && (
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {colorInput(ctaBg, onCtaBg, 'CTA background', 'cta-bg')}
            {colorInput(ctaColor, onCtaColor, 'CTA text color', 'cta-color')}
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Center logo (optional)</p>
        {!logoDataUrl ? (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={disabled} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50">
            <UploadCloud size={16} /> Upload logo
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <img src={logoDataUrl} alt="Uploaded logo preview" className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-contain p-1" />
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500" htmlFor="logo-size">Logo size: {Math.round(logoRatio * 100)}% of QR width</label>
              <input id="logo-size" type="range" min="10" max="30" value={Math.round(logoRatio * 100)} onChange={(e) => onLogoRatio(Number(e.target.value) / 100)} className="w-full accent-indigo-600" disabled={disabled} />
              {logoRatio > 0.22 && <p className="mt-1 flex items-center gap-1 text-xs text-amber-600"><AlertTriangle size={12} />Large logos can break scanning — keep at or below 22%.</p>}
            </div>
            <button type="button" onClick={() => { onLogo(null); onLogoRatio(0.2) }} disabled={disabled} aria-label="Remove logo" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-red-500"><X size={16} /></button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogo} />
        {logoError && <p className="mt-2 flex items-center gap-1 text-sm text-red-500"><AlertTriangle size={14} />{logoError}</p>}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><Info size={13} />A white backing is added automatically. Error correction is raised to H to keep it scannable.</p>
      </div>

      {/* Design lock */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-sm font-medium text-slate-700">{designLocked ? 'Design locked' : 'Lock design'}</p>
          <p className="text-xs text-slate-400">Prevent accidental changes once finalized.</p>
        </div>
        <button onClick={onToggleDesignLock} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ${designLocked ? 'border border-slate-300 bg-white text-slate-600' : 'bg-slate-900 text-white'}`}>
          {designLocked ? <LockOpen size={15} /> : <Lock size={15} />} {designLocked ? 'Unlock' : 'Lock'}
        </button>
      </div>
    </section>
  )
}