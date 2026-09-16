import { useState } from 'react'
import { Palette, Save, RefreshCw, Check } from 'lucide-react'
import { loadBrandKit, saveBrandKit, resetBrandKit } from '../utils/brand.js'

const FIELDS = [
  ['primary', 'Primary color'],
  ['secondary', 'Secondary color'],
  ['text', 'Text color'],
  ['background', 'Page background']
]

export default function BrandKitPage() {
  const [brand, setBrand] = useState(loadBrandKit)
  const [saved, setSaved] = useState(false)
  const [logoFile, setLogoFile] = useState(null)

  const set = (key, value) => setBrand(b => ({ ...b, [key]: value }))

  const handleLogo = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { alert('Logo must be PNG, JPG or WebP.'); return }
    if (file.size > 1024 * 1024) { alert('Logo must be under 1 MB.'); return }
    setLogoFile(file)
    setBrand(prev => ({ ...prev, businessName: prev.businessName }))
    const reader = new FileReader()
    reader.onload = () => setBrand(b => ({ ...b, logo: reader.result }))
    reader.readAsDataURL(file)
  }

  const save = () => {
    saveBrandKit(brand)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const input = 'input w-full'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Palette className="text-indigo-500" /> Brand Kit
        </h1>
        <p className="text-sm text-slate-500">
          Save your brand once, then apply it automatically to new landing pages. Stored on this device only.
        </p>
      </header>

      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Logo & colors</h2>
        {brand.logo ? (
          <div className="mb-4 flex items-center gap-3">
            <img src={brand.logo} alt="Brand logo" className="h-16 w-16 rounded-xl border border-slate-200 object-contain p-1" />
            <button onClick={() => set('logo', null)} className="text-sm text-red-500 hover:underline">Remove logo</button>
          </div>
        ) : (
          <label className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:border-indigo-400">
            Upload brand logo <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogo} />
          </label>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className="label" htmlFor={`brand-${key}`}>{label}</label>
              <div className="flex items-center gap-2">
                <label className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200" style={{ background: brand[key] }} aria-label={`${label} picker`}>
                  <input type="color" value={brand[key]} onChange={(e) => set(key, e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                </label>
                <input id={`brand-${key}`} className={input} value={brand[key]} onChange={(e) => set(key, e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Business details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['businessName', 'Business name'],
            ['tagline', 'Tagline'],
            ['website', 'Website'],
            ['phone', 'Phone'],
            ['email', 'Email'],
            ['whatsapp', 'WhatsApp number'],
            ['instagram', 'Instagram (URL)'],
            ['facebook', 'Facebook (URL)'],
            ['youtube', 'YouTube (URL)']
          ].map(([key, label]) => (
            <div key={key}>
              <label className="label" htmlFor={`brand-${key}`}>{label}</label>
              <input id={`brand-${key}`} className={input} value={brand[key] || ''} onChange={(e) => set(key, e.target.value)} placeholder={undefined} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={save} className="btn-primary inline-flex items-center gap-2">
          {saved ? <Check size={15} /> : <Save size={15} />} {saved ? 'Saved!' : 'Save Brand Kit'}
        </button>
        <button onClick={() => setBrand(resetBrandKit())} className="btn-secondary inline-flex items-center gap-2">
          <RefreshCw size={15} /> Reset
        </button>
        <p className="text-xs text-slate-400">Applied automatically to new Landing Pages.</p>
      </div>
    </div>
  )
}