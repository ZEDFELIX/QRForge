import { useState } from 'react'
import { Palette as PaletteIcon, Upload, X, AlertTriangle } from 'lucide-react'

const MAX_LOGO_BYTES = 1024 * 512 // 512KB

export default function QRCustomization({
  fg, bg, onFg, onBg,
  size, onSize,
  margin, onMargin,
  errorCorrection, onErrorCorrection,
  rounded, onRounded,
  logoDataUrl, onLogo, logoRatio, onLogoRatio
}) {
  const [logoError, setLogoError] = useState('')

  const handleLogoFile = async (e) => {
    const file = e.target.files && e.target.files[0]
    setLogoError('')
    if (!file) return
    if (!file.type.match(/^image\/(png|jpe?g|webp)$/)) {
      setLogoError('Please upload a PNG, JPG or WebP image.')
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError('That image is too large (max 512 KB).')
      return
    }
    // validate it actually decodes as an image
    const check = await createImageBitmap(file).catch(() => null)
    if (!check) {
      setLogoError('That file could not be read as an image.')
      return
    }
    check.close?.()
    const reader = new FileReader()
    reader.onload = () => onLogo(reader.result)
    reader.onerror = () => setLogoError('Could not read the file.')
    reader.readAsDataURL(file)
  }

  return (
    <div className="card p-6">
      <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-slate-900">
        <PaletteIcon size={18} className="text-indigo-500" aria-hidden="true" />
        Customization
      </h2>
      <p className="mb-4 text-sm text-slate-500">Colors, size and error correction.</p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ColorControl label="Foreground color" value={fg} onChange={onFg} />
        <ColorControl label="Background color" value={bg} onChange={onBg} />

        <div>
          <label htmlFor="size" className="mb-1.5 block text-sm font-medium text-slate-700">
            Size — {size}px
          </label>
          <input
            id="size"
            type="range"
            min={256}
            max={1024}
            step={32}
            value={size}
            onChange={(e) => onSize(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        <div>
          <label htmlFor="margin" className="mb-1.5 block text-sm font-medium text-slate-700">
            Quiet zone (margin) — {margin} modules
          </label>
          <input
            id="margin"
            type="range"
            min={2}
            max={8}
            step={1}
            value={margin}
            onChange={(e) => onMargin(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        <div>
          <label htmlFor="ec" className="mb-1.5 block text-sm font-medium text-slate-700">
            Error correction
          </label>
          <select
            id="ec"
            value={errorCorrection}
            disabled={Boolean(logoDataUrl)}
            onChange={(e) => onErrorCorrection(e.target.value)}
            className="input disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="L">Low (L) — smallest</option>
            <option value="M">Medium (M)</option>
            <option value="Q">Quartile (Q)</option>
            <option value="H">High (H) — best for logos</option>
          </select>
          {logoDataUrl && (
            <p className="mt-1 text-xs text-indigo-600">
              Auto-set to High for logo reliability.
            </p>
          )}
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={rounded}
              onChange={(e) => onRounded(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Rounded modules
          </label>
        </div>
      </div>

      {/* Logo */}
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <span className="mb-2 block text-sm font-medium text-slate-700">Center logo (optional)</span>
        {!logoDataUrl ? (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600">
            <Upload size={16} aria-hidden="true" />
            Upload logo
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoFile} className="sr-only" />
          </label>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <img src={logoDataUrl} alt="Your uploaded logo" className="h-14 w-14 rounded-lg border border-slate-200 bg-white object-contain p-1" />
            <div className="flex-1">
              <label htmlFor="logoRatio" className="mb-1 block text-sm text-slate-600">
                Logo size — {Math.round(logoRatio * 100)}%
              </label>
              <input
                id="logoRatio"
                type="range"
                min={10}
                max={28}
                step={1}
                value={Math.round(logoRatio * 100)}
                onChange={(e) => onLogoRatio(Number(e.target.value) / 100)}
                className="w-full max-w-[240px] accent-indigo-600"
              />
              {logoRatio > 0.22 && (
                <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle size={12} aria-hidden="true" /> This logo is large — it may make the QR harder to scan.
                </p>
              )}
            </div>
            <button
              onClick={() => onLogo(null)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-600 hover:border-red-300 hover:text-red-600"
            >
              <X size={14} aria-hidden="true" /> Remove
            </button>
          </div>
        )}
        {logoError && <p className="mt-2 text-sm text-red-600">{logoError}</p>}
      </div>
    </div>
  )
}

function ColorControl({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 cursor-pointer rounded-lg border border-slate-300 bg-white p-0.5"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          maxLength={7}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#111827"
          className="input uppercase"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  )
}