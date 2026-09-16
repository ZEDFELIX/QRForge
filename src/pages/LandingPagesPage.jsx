import { useEffect, useMemo, useState } from 'react'
import {
  Sparkles, Download, Eye, Share2, Instagram, Facebook, Music2, Linkedin, Youtube,
  MessageCircle, Globe, User, Utensils, Package, CalendarClock, Star, CreditCard,
  ExternalLink, Loader2
} from 'lucide-react'
import { buildLandingPage, downloadLandingPage } from '../utils/landingPages.js'
import { loadBrandKit } from '../utils/brand.js'

const TYPES = [
  { id: 'social', label: 'Social Media QR', icon: Share2, desc: 'Instagram, TikTok, YouTube + more' },
  { id: 'card', label: 'Business Card', icon: User, desc: 'Digital profile + Save Contact' },
  { id: 'menu', label: 'Menu QR', icon: Utensils, desc: 'Restaurant menu page' },
  { id: 'product', label: 'Product QR', icon: Package, desc: 'Showcase a product' },
  { id: 'event', label: 'Event QR', icon: CalendarClock, desc: 'Details + Add to Calendar' },
  { id: 'review', label: 'Review QR', icon: Star, desc: 'Rating + Leave a Review' },
  { id: 'whatsapp', label: 'WhatsApp QR', icon: MessageCircle, desc: 'Chat directly on WhatsApp' },
  { id: 'payment', label: 'Payment QR', icon: CreditCard, desc: 'M-Pesa / payment instructions' }
]

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', gradient: 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600', icon: Instagram, default: 'https://instagram.com/' },
  { id: 'facebook', label: 'Facebook', gradient: 'bg-[#1877F2]', icon: Facebook, default: 'https://facebook.com/' },
  { id: 'tiktok', label: 'TikTok', gradient: 'bg-[#010101]', icon: Music2, default: 'https://tiktok.com/@' },
  { id: 'x', label: 'X (Twitter)', gradient: 'bg-[#111827]', icon: Share2, default: 'https://x.com/' },
  { id: 'linkedin', label: 'LinkedIn', gradient: 'bg-[#0A66C2]', icon: Linkedin, default: 'https://linkedin.com/in/' },
  { id: 'youtube', label: 'YouTube', gradient: 'bg-[#FF0000]', icon: Youtube, default: 'https://youtube.com/@' },
  { id: 'whatsapp', label: 'WhatsApp', gradient: 'bg-[#25D366]', icon: MessageCircle, default: 'https://wa.me/254700000000' },
  { id: 'website', label: 'Website', gradient: 'bg-[#6366F1]', icon: Globe, default: 'https://' }
]

const DEFAULT_STATE = {
  title: 'My Landing Page',
  description: '',
  logo: null,
  // social
  social: [],
  // card
  card: { name: '', title: '', company: '', phone: '', email: '', website: '', address: '', photo: null },
  // menu
  menu: { restaurantName: '', categories: [] },
  // product
  product: { name: '', id: '', description: '', price: '', website: '', image: null },
  // event
  event: { name: '', date: '', time: '', location: '', description: '', website: '', contact: '' },
  // review
  review: { businessName: '', reviewUrl: '' },
  // whatsapp
  whatsapp: { phone: '', message: '' },
  // payment
  payment: { tillNumber: '', paybill: '', businessName: '', accountNo: '', instructions: '' }
}

export default function LandingPagesPage() {
  const [type, setType] = useState('social')
  const [state, setState] = useState(DEFAULT_STATE)
  const [brand, setBrand] = useState(() => loadBrandKit())
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (patch) => setState(s => ({ ...s, ...patch }))
  const setNested = (key, patch) => setState(s => ({ ...s, [key]: { ...s[key], ...patch } }))

  const config = useMemo(() => ({
    type,
    title: state.title,
    description: state.description,
    logo: state.logo,
    brand: {
      primary: brand.primary,
      secondary: brand.secondary,
      text: brand.text,
      background: brand.background
    },
    social: state.social,
    card: state.card,
    menu: state.menu,
    product: state.product,
    event: state.event,
    review: state.review,
    whatsapp: state.whatsapp,
    payment: state.payment,
    businessName: brand.businessName || state.title
  }), [type, state, brand])

  useEffect(() => {
    setPreviewUrl(null)
    setError('')
    setSaving(true)
    const html = buildLandingPage(config)
    const blob = new Blob([html], { type: 'text/html' })
    setPreviewUrl(URL.createObjectURL(blob))
    setSaving(false)
    return () => { /* cleanup handled on next render */ }
  }, [config]) // eslint-disable-line react-hooks/exhaustive-deps

  const download = () => {
    const slug = (state.title || type).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
    downloadLandingPage(buildLandingPage(config), `${slug || 'landing-page'}.html`)
  }

  const handleLogoFile = (e, key = 'logo') => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setError('Logo must be PNG, JPG or WebP.'); return }
    if (file.size > 1024 * 1024) { setError('Logo must be under 1 MB.'); return }
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      if (key === 'logo') set({ logo: reader.result })
      else if (key === 'photo') setNested('card', { photo: reader.result })
      else if (key === 'image') setNested('product', { image: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const label = 'label'
  const input = 'input w-full'

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Sparkles className="text-amber-500" /> Landing Pages
        </h1>
        <p className="text-sm text-slate-500">
          Build a beautiful single-page site, preview it, then download the self-contained HTML file and host it anywhere. QRForge never fakes a hosted page — the QR points to wherever you publish it.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => { setType(t.id) }}
            className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${type === t.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}
          >
            <span className="mr-1.5 inline-flex items-center">{<t.icon size={14} className="inline" />}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Page basics</h2>
            <div className="space-y-3">
              <div>
                <label className={label} htmlFor="lp-title">Title</label>
                <input id="lp-title" className={input} value={state.title} onChange={(e) => set({ title: e.target.value })} placeholder="Business name / page title" />
              </div>
              <div>
                <label className={label} htmlFor="lp-desc">Description</label>
                <textarea id="lp-desc" rows={2} className={`${input} resize-y`} value={state.description} onChange={(e) => set({ description: e.target.value })} placeholder="What visitors should know" />
              </div>
              <div>
                <label className={label}>Logo (PNG/JPG/WebP)</label>
                {state.logo ? (
                  <div className="flex items-center gap-3">
                    <img src={state.logo} alt="Logo preview" className="h-12 w-12 rounded-xl border border-slate-200 bg-white object-contain p-1" />
                    <button onClick={() => set({ logo: null })} className="text-sm text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:border-indigo-400">
                    Upload logo <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleLogoFile(e, 'logo')} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {type === 'social' && <SocialEditor state={state} set={set} />}
          {type === 'card' && <CardEditor state={state} setNested={setNested} handleFile={handleLogoFile} />}
          {type === 'menu' && <MenuEditor state={state} setNested={setNested} />}
          {type === 'product' && <ProductEditor state={state} setNested={setNested} handleFile={handleLogoFile} />}
          {type === 'event' && <EventEditor state={state} setNested={setNested} />}
          {type === 'review' && <ReviewEditor state={state} setNested={setNested} />}
          {type === 'whatsapp' && <WhatsAppEditor state={state} setNested={setNested} />}
          {type === 'payment' && <PaymentEditor state={state} setNested={setNested} />}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Preview + download */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
              <Eye size={16} className="text-indigo-500" /> Live preview
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50" style={{ height: '70vh' }}>
              {saving ? (
                <div className="flex h-full items-center justify-center"><Loader2 size={24} className="animate-spin text-slate-300" /></div>
              ) : previewUrl ? (
                <iframe src={previewUrl} title="Landing page preview" className="h-full w-full border-0" sandbox="allow-scripts allow-same-origin allow-popups" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">Preview loading…</div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={download} className="btn-primary inline-flex flex-1 items-center justify-center gap-2">
                <Download size={15} /> Download HTML
              </button>
              <button onClick={() => openHostHowto(alert)} className="btn-secondary flex-1 text-sm">How to host</button>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
              <ExternalLink size={13} className="mt-0.5 shrink-0" />
              The download is a single self-contained HTML file — host it on Vercel, Netlify, GitHub Pages, Cloudflare Pages, or any static host, then link it in a static or dynamic QR.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function openHostHowto(alert) {
  alert('For now, host your HTML file on any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages) or your own server, then use that URL in a QR code.\n\nWhen QRForge\'s backend is connected, landing pages can be hosted automatically under your QRForge link.')
}

function Card({ title, children }) {
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function SocialEditor({ state, set }) {
  const togglePlatform = (platform) => {
    const exists = state.social.find(s => s.platform === platform.id)
    if (exists) set({ social: state.social.filter(s => s.platform !== platform.id) })
    else set({ social: [...state.social, { platform: platform.id, url: platform.default, label: platform.label }] })
  }
  const updateUrl = (platform, url) => set({ social: state.social.map(s => s.platform === platform ? { ...s, url } : s) })
  return (
    <Card title="Social links">
      <div className="flex flex-wrap gap-2">
        {SOCIAL_PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => togglePlatform(p)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium ${state.social.some(s => s.platform === p.id) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}
          >
            <p.icon size={14} /> {p.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {state.social.map((s) => (
          <div key={s.platform} className="flex items-center gap-2">
            <span className="w-28 shrink-0 text-sm text-slate-500">{s.label}</span>
            <input value={s.url} onChange={(e) => updateUrl(s.platform, e.target.value)} placeholder="https://…" className="input" />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">Drag to reorder is available in the full editor — for now you can click toggles to include profiles.</p>
    </Card>
  )
}

function CardEditor({ state, setNested, handleFile }) {
  const f = ['name', 'title', 'company', 'phone', 'email', 'website', 'address']
  return (
    <Card title="Business card details">
      {state.card.photo ? (
        <div className="flex items-center gap-3">
          <img src={state.card.photo} alt="" className="h-14 w-14 rounded-full border border-slate-200 object-cover" />
          <button onClick={() => setNested('card', { photo: null })} className="text-sm text-red-500 hover:underline">Remove photo</button>
        </div>
      ) : (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:border-indigo-400">
          Upload profile photo <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleFile(e, 'photo')} />
        </label>
      )}
      {f.map((field) => (
        <div key={field}>
          <label className="label" htmlFor={`card-${field}`} style={{ textTransform: 'capitalize' }}>{field}</label>
          <input id={`card-${field}`} className="input w-full" value={state.card[field] || ''} onChange={(e) => setNested('card', { [field]: e.target.value })} placeholder={field === 'phone' ? '+254712345678' : undefined} />
        </div>
      ))}
    </Card>
  )
}

function MenuEditor({ state, setNested }) {
  const cats = state.menu.categories
  const addCat = () => setNested('menu', { categories: [...cats, { name: '', items: [{ name: '', price: '', description: '' }] }] })
  const updateCat = (ci, patch) => setNested('menu', { categories: cats.map((c, i) => i === ci ? { ...c, ...patch } : c) })
  const addItem = (ci) => setNested('menu', { categories: cats.map((c, i) => i === ci ? { ...c, items: [...c.items, { name: '', price: '', description: '' }] } : c) })
  return (
    <Card title="Menu">
      <div>
        <label className="label" htmlFor="menu-name">Restaurant / venue name</label>
        <input id="menu-name" className="input w-full" value={state.menu.restaurantName} onChange={(e) => setNested('menu', { restaurantName: e.target.value })} placeholder="Aroma Coffeehouse" />
      </div>
      {cats.map((cat, ci) => (
        <div key={ci} className="rounded-xl border border-slate-200 p-4">
          <div className="flex gap-2">
            <input className="input flex-1" value={cat.name} onChange={(e) => updateCat(ci, { name: e.target.value })} placeholder="Category name (e.g. Coffees)" />
            <button onClick={() => setNested('menu', { categories: cats.filter((_, i) => i !== ci) })} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
          <div className="mt-3 space-y-2">
            {cat.items.map((item, ii) => (
              <div key={ii} className="grid grid-cols-[1fr_70px] gap-2">
                <input className="input" value={item.name} onChange={(e) => updateCat(ci, { items: cat.items.map((it, i) => i === ii ? { ...it, name: e.target.value } : it) })} placeholder="Item name" />
                <input className="input" value={item.price} onChange={(e) => updateCat(ci, { items: cat.items.map((it, i) => i === ii ? { ...it, price: e.target.value } : it) })} placeholder="Price" />
              </div>
            ))}
          </div>
          <button onClick={() => addItem(ci)} className="mt-2 text-sm text-indigo-600 hover:underline">+ Add item</button>
        </div>
      ))}
      <button onClick={addCat} className="btn-secondary w-full text-sm">+ Add category</button>
    </Card>
  )
}

function ProductEditor({ state, setNested, handleFile }) {
  const f = ['name', 'id', 'description', 'price', 'website']
  return (
    <Card title="Product">
      {state.product.image ? (
        <div className="flex items-center gap-3">
          <img src={state.product.image} alt="" className="h-14 w-14 rounded-xl border border-slate-200 object-cover" />
          <button onClick={() => setNested('product', { image: null })} className="text-sm text-red-500 hover:underline">Remove image</button>
        </div>
      ) : (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:border-indigo-400">
          Upload product image <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleFile(e, 'image')} />
        </label>
      )}
      {f.map((field) => (
        <div key={field}>
          <label className="label" htmlFor={`prod-${field}`} style={{ textTransform: 'capitalize' }}>{field}</label>
          <textarea rows={field === 'description' ? 3 : 1} id={`prod-${field}`} className="input w-full resize-y" value={state.product[field] || ''} onChange={(e) => setNested('product', { [field]: e.target.value })} placeholder={field === 'website' ? 'https://product-url.com' : undefined} />
        </div>
      ))}
    </Card>
  )
}

function EventEditor({ state, setNested }) {
  const f = ['name', 'date', 'time', 'location', 'description', 'website', 'contact']
  return (
    <Card title="Event details">
      {f.map((field) => (
        <div key={field}>
          <label className="label" htmlFor={`evt-${field}`} style={{ textTransform: 'capitalize' }}>{field}</label>
          <input id={`evt-${field}`} className="input w-full" value={state.event[field] || ''} onChange={(e) => setNested('event', { [field]: e.target.value })} placeholder={field === 'date' ? '2026-12-25' : field === 'time' ? '18:00' : undefined} />
        </div>
      ))}
    </Card>
  )
}

function ReviewEditor({ state, setNested }) {
  return (
    <Card title="Review page">
      <div>
        <label className="label" htmlFor="rev-name">Business name</label>
        <input id="rev-name" className="input w-full" value={state.review.businessName} onChange={(e) => setNested('review', { businessName: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="rev-url">Review page URL (Google / Facebook, etc.)</label>
        <input id="rev-url" className="input w-full" value={state.review.reviewUrl} onChange={(e) => setNested('review', { reviewUrl: e.target.value })} placeholder="https://g.page/r/xxxxx/review" />
      </div>
      <p className="text-xs text-slate-400">Customers see "How was your experience?" with a star rating, then a Leave a Review button. We never fake or manipulate reviews.</p>
    </Card>
  )
}

function WhatsAppEditor({ state, setNested }) {
  return (
    <Card title="WhatsApp">
      <div>
        <label className="label" htmlFor="wa-phone">Phone number (international format)</label>
        <input id="wa-phone" className="input w-full" value={state.whatsapp.phone} onChange={(e) => setNested('whatsapp', { phone: e.target.value })} placeholder="254711436169" />
      </div>
      <div>
        <label className="label" htmlFor="wa-msg">Pre-filled message</label>
        <textarea id="wa-msg" rows={2} className="input w-full resize-y" value={state.whatsapp.message} onChange={(e) => setNested('whatsapp', { message: e.target.value })} placeholder="Hello, I would like to place an order." />
      </div>
    </Card>
  )
}

function PaymentEditor({ state, setNested }) {
  return (
    <Card title="Payment instructions">
      <p className="text-xs text-slate-400">This QR encodes payment instructions (M-Pesa Till/Paybill) — QRForge never processes payments itself.</p>
      <div>
        <label className="label" htmlFor="pay-name">Business name</label>
        <input id="pay-name" className="input w-full" value={state.payment.businessName} onChange={(e) => setNested('payment', { businessName: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="pay-till">Till number</label>
          <input id="pay-till" className="input w-full" value={state.payment.tillNumber} onChange={(e) => setNested('payment', { tillNumber: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="pay-paybill">Paybill</label>
          <input id="pay-paybill" className="input w-full" value={state.payment.paybill} onChange={(e) => setNested('payment', { paybill: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="pay-account">Account / reference (optional)</label>
        <input id="pay-account" className="input w-full" value={state.payment.accountNo} onChange={(e) => setNested('payment', { accountNo: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="pay-instructions">Instructions</label>
        <textarea id="pay-instructions" rows={3} className="input w-full resize-y" value={state.payment.instructions} onChange={(e) => setNested('payment', { instructions: e.target.value })} placeholder="Go to M-Pesa, select Buy Goods & Services, enter till/paybill…" />
      </div>
      <p className="text-xs text-amber-600">No real payment is collected. This QR shares instructions only — payment providers are integrated in a future release.</p>
    </Card>
  )
}