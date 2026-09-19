import { useCallback, useMemo, useState } from 'react'
import { Upload } from 'lucide-react'
import { QR_TYPES, buildPayload, drawQrAsync, qrToSvg, effectiveEC } from '../utils/qrGenerator.js'
import { validateType } from '../utils/validators.js'
import { processImageForQr, base64Bytes } from '../utils/imageQr.js'
import { textPageUrl, textPageConfig, TEXT_PAGE_WARN, TEXT_PAGE_HARD } from '../utils/textPage.js'
import { markDownloaded } from '../utils/storage.js'
import { loadBrandKit } from '../utils/brand.js'
import TextPageView from './TextPageView.jsx'
import QRTypeSelector from './QRTypeSelector.jsx'
import QRCustomization from './QRCustomization.jsx'
import QRPreview from './QRPreview.jsx'
import DownloadButtons from './DownloadButtons.jsx'
import QuickExamples from './QuickExamples.jsx'
import QRHistory from './QRHistory.jsx'
import QRHealthCard from './QRHealthCard.jsx'
import QRScanner from './QRScanner.jsx'

const EMPTY_FIELDS = {
  url: 'https://example.com',
  text: '',
  phone: '',
  email: '',
  emailSubject: '',
  emailBody: '',
  smsPhone: '',
  smsMessage: '',
  wifiSsid: '',
  wifiPassword: '',
  wifiSecurity: 'WPA',
  wifiHidden: false,
  contactName: '',
  contactOrg: '',
  contactPhone: '',
  contactEmail: '',
  contactWebsite: '',
  contactAddress: '',
  lat: '',
  lng: '',
  whatsappNumber: '',
  whatsappMessage: '',
  payBusinessName: '',
  payTillNumber: '',
  payBusinessNumber: '',
  payAccountNo: '',
  payInstructions: '',
  imageMode: 'embed',
  imageData: '',
  imageUrl: '',
  textMode: 'plain',
  textPageTitle: '',
  textPageAccent: '#635bff',
  textPageTheme: 'light',
  textPageBig: false
}

export default function QRGenerator({ initialType, initialFields, initialFg, initialBg, initialRounded }) {
  const [type, setType] = useState(initialType || 'url')
  const [fields, setFields] = useState({ ...EMPTY_FIELDS, ...(initialFields || {}) })
  const [fg, setFg] = useState(initialFg || '#111827')
  const [bg, setBg] = useState(initialBg || '#FFFFFF')
  const [size, setSize] = useState(512)
  const [margin, setMargin] = useState(4)
  const [errorCorrection, setErrorCorrection] = useState('M')
  const [rounded, setRounded] = useState(Boolean(initialRounded))
  const [logoDataUrl, setLogoDataUrl] = useState(null)
  const [logoRatio, setLogoRatio] = useState(0.2)
  const [frameText, setFrameText] = useState('')
  const [frameColor, setFrameColor] = useState('auto')
  const [ctaText, setCtaText] = useState('')
  const [ctaBg, setCtaBg] = useState('#111827')
  const [ctaColor, setCtaColor] = useState('#ffffff')
  const [designLocked, setDesignLocked] = useState(false)
  const [lockedMeta, setLockedMeta] = useState('')

  const setField = useCallback((key, value) => {
    setFields((f) => ({ ...f, [key]: value }))
  }, [])

  const errors = useMemo(() => {
    const e = validateType(type, fields)
    const list = []
    if (e) list.push(e)
    // URL content pre-normalization warning-free
    return list
  }, [type, fields])

  const payload = useMemo(() => {
    if (errors.length) return ''
    return buildPayload(type, fields)
  }, [type, fields, errors])

  const hasLogo = Boolean(logoDataUrl)
  const ec = effectiveEC(errorCorrection, hasLogo)

  const rasterize = useCallback(async (targetSize) => {
    const c = document.createElement('canvas')
    await drawQrAsync(c, payload, {
      fg,
      bg,
      size: targetSize || size,
      margin,
      errorCorrection: ec,
      rounded,
      logoDataUrl,
      logoRatio,
      frameLabel: frameText,
      frameLabelColor: frameColor,
      ctaText,
      ctaBg,
      ctaColor
    })
    return c
  }, [payload, fg, bg, size, margin, ec, rounded, logoDataUrl, logoRatio, frameText, frameColor, ctaText, ctaBg, ctaColor])

  const generateSvg = useCallback(() => {
    return qrToSvg(payload, {
      fg,
      bg,
      margin,
      errorCorrection: ec,
      rounded,
      logoDataUrl,
      logoRatio,
      frameLabel: frameText,
      frameLabelColor: frameColor,
      ctaText,
      ctaBg,
      ctaColor
    })
  }, [payload, fg, bg, margin, ec, rounded, logoDataUrl, logoRatio, frameText, frameColor, ctaText, ctaBg, ctaColor])

  const setTypeAndReset = (t) => {
    setType(t)
  }

  const quickExample = (example) => {
    setType(example.type)
    setFields((f) => ({ ...f, ...example.fields }))
  }

  const applyHistoryEntry = (entry) => {
    setType(entry.type)
    if (entry.fields) {
      setFields({ ...EMPTY_FIELDS, ...entry.fields })
    } else {
      // fallback: only set raw payload where possible
      const base = { ...EMPTY_FIELDS }
      if (entry.type === 'url') base.url = entry.payload
      else if (entry.type === 'text') base.text = entry.payload
      setFields(base)
    }
    if (typeof document !== 'undefined') {
      document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="generator" className="scroll-mt-24">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <QRTypeSelector current={type} onChange={setTypeAndReset} />

          {/* Content */}
          <div className="card p-6">
            <h2 className="mb-1 text-base font-semibold text-slate-900">Content</h2>
            <p className="mb-4 text-sm text-slate-500">
              What do you want your QR code to contain?
            </p>
            <ContentFields type={type} fields={fields} onChange={setField} />
            <QuickExamples onExample={quickExample} currentType={type} />
            {errors.length > 0 && (
              <ul className="mt-4 space-y-1">
                {errors.map((e, i) => (
                  <li key={i} className="text-sm text-red-600">
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Customization */}
          <QRCustomization
            fg={fg}
            bg={bg}
            onFg={setFg}
            onBg={setBg}
            size={size}
            onSize={setSize}
            margin={margin}
            onMargin={setMargin}
            errorCorrection={errorCorrection}
            onErrorCorrection={setErrorCorrection}
            rounded={rounded}
            onRounded={setRounded}
            logoDataUrl={logoDataUrl}
            onLogo={setLogoDataUrl}
            logoRatio={logoRatio}
            onLogoRatio={setLogoRatio}
            hasLogo={hasLogo}
            onApplyPreset={(p) => { setFg(p.fg); setBg(p.bg); setRounded(p.rounded) }}
            frameText={frameText}
            onFrameText={setFrameText}
            frameColor={frameColor}
            onFrameColor={setFrameColor}
            ctaText={ctaText}
            onCtaText={setCtaText}
            ctaBg={ctaBg}
            onCtaBg={setCtaBg}
            ctaColor={ctaColor}
            onCtaColor={setCtaColor}
            designLocked={designLocked}
            onToggleDesignLock={() => setDesignLocked((d) => !d)}
            onApplyBrand={() => {
              const brand = loadBrandKit()
              if (brand.text) setFg(brand.text)
              if (brand.background) setBg(brand.background)
              if (brand.logo) setLogoDataUrl(brand.logo)
            }}
          />

          <div className="card p-6">
            <h2 className="mb-1 text-base font-semibold text-slate-900">Export</h2>
            <DownloadButtons
              disabled={errors.length > 0 || !payload}
              rasterize={rasterize}
              generateSvg={generateSvg}
              title={getTitle(type, fields)}
              payload={payload}
              onDownload={() => markDownloaded(payload)}
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-24 self-start space-y-4">
          <QRPreview
            payload={payload}
            type={type}
            fields={fields}
            fg={fg}
            bg={bg}
            size={size}
            margin={margin}
            errorCorrection={ec}
            rounded={rounded}
            logoDataUrl={logoDataUrl}
            logoRatio={logoRatio}
            hasErrors={errors.length > 0}
            frameText={frameText}
            frameColor={frameColor}
            ctaText={ctaText}
            ctaBg={ctaBg}
            ctaColor={ctaColor}
          />
          {payload && !errors.length && (
            <>
              <QRHealthCard
                fg={fg}
                bg={bg}
                margin={margin}
                rounded={rounded}
                logoDataUrl={logoDataUrl}
                logoRatio={logoRatio}
                errorCorrection={ec}
                previewUrl={payload}
                canCheckUrl={type === 'url' || type === 'whatsapp' ? Boolean(payload) : false}
              />
              <QRScanner expectedPayload={payload} expectedType={type} />
            </>
          )}
        </div>
      </div>

      <QRHistory currentPayload={payload} type={type} fields={fields} onApply={applyHistoryEntry} />
    </section>
  )
}

function ContentFields({ type, fields, onChange }) {
  const renderInput = (conf) => {
    const key = conf.key
    const value = fields[key] ?? ''
    if (conf.type === 'textarea') {
      return (
        <textarea
          id={key}
          rows={conf.rows || 3}
          value={value}
          placeholder={conf.placeholder}
          onChange={(e) => onChange(key, e.target.value)}
          className="input resize-y"
        />
      )
    }
    if (conf.type === 'select') {
      return (
        <select
          id={key}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          className="input"
        >
          {conf.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
    }
    if (conf.type === 'checkbox') {
      return (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(key, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          {conf.label}
        </label>
      )
    }
    if (conf.type === 'file') {
      return (
        <div className="flex items-center gap-3">
          <label className="btn-secondary cursor-pointer px-4 py-2 text-xs">
            <Upload size={14} /> Choose image
            <input
              type="file"
              accept={conf.accept}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0]
                if (!file) return
                processImageForQr(file)
                  .then((res) => onChange('imageData', res.dataUrl))
                  .catch((err) => window.alert(err.message || 'Could not process that image.'))
              }}
            />
          </label>
          {fields.imageData ? (
            <div className="flex items-center gap-2.5">
              <img
                src={fields.imageData}
                alt="Uploaded image preview"
                className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <span className="text-xs text-slate-400">
                {Math.round((base64Bytes(fields.imageData) / 1024) * 10) / 10} KB · optimized for scannability
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">PNG, JPG, WebP or GIF</span>
          )}
        </div>
      )
    }
    return (
      <input
        id={key}
        type={conf.inputType || 'text'}
        value={value}
        placeholder={conf.placeholder}
        onChange={(e) => onChange(key, e.target.value)}
        className="input"
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELD_SCHEMAS[type].map((conf) => {
          if (conf.showWhen && !conf.showWhen(fields)) return null
          return (
            <div key={conf.key} className={conf.type === 'textarea' || conf.type === 'checkbox' || conf.type === 'file' ? 'sm:col-span-2' : ''}>
              <label htmlFor={conf.key} className="label">
                {conf.label}
                {conf.required && <span className="text-red-500"> *</span>}
              </label>
              {renderInput(conf)}
            </div>
          )
        })}
      </div>
      {type === 'text' && fields.textMode === 'page' && <TextPagePanel fields={fields} />}
      {type === 'image' && fields.imageMode !== 'url' && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800">
          How embedded images work: for a QR to display an image, it must squeeze the whole
          picture into the tiny pattern. We auto-compress it, but on any phone it’s better to{' '}
          <span className="font-semibold">link to an image URL</span> — that always opens the
          full photo on any camera app.
        </div>
      )}
    </>
  )
}

function TextPagePanel({ fields }) {
  const cfg = textPageConfig(fields?.text || '', fields)
  const len = textPageUrl(fields?.text || '', fields).length
  const tooLong = len > TEXT_PAGE_HARD
  const gettingLong = !tooLong && len > TEXT_PAGE_WARN

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs leading-relaxed text-indigo-800">
        The landing page is built into the QR code itself, so any phone camera opens this styled
        page — no hosting or backend needed. Keep the text concise enough for reliable scanning.
      </div>

      <p className={`flex items-center gap-2 text-xs font-semibold ${tooLong ? 'text-red-600' : gettingLong ? 'text-amber-600' : 'text-slate-500'}`}>
        <span className="rounded-full bg-slate-100 px-2 py-0.5">{len}</span> characters in the QR
        {gettingLong && ' — getting long, shorten it for fast scans'}
        {tooLong && ` — too long to scan reliably (max ${TEXT_PAGE_HARD})`}
      </p>

      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-500">On scan, they’ll see:</p>
        <TextPageView title={cfg.title} text={cfg.text} accent={cfg.accent} theme={cfg.theme} big={cfg.big} />
      </div>
    </div>
  )
}

const FIELD_SCHEMAS = {
  url: [
    { key: 'url', label: 'Website URL', required: true, placeholder: 'https://example.com', inputType: 'url' }
  ],
  text: [
    {
      key: 'textMode',
      label: 'How it appears when scanned',
      type: 'select',
      options: [
        { value: 'plain', label: 'Plain text (phone shows the raw text)' },
        { value: 'page', label: 'Custom landing page (styled, branded page)' }
      ]
    },
    { key: 'text', label: 'Text content', required: true, placeholder: 'Enter any text…', type: 'textarea', rows: 4 },
    {
      key: 'textPageTitle',
      label: 'Page title (optional)',
      placeholder: 'Shown as the big heading — defaults to the first line',
      showWhen: (f) => f.textMode === 'page'
    },
    {
      key: 'textPageAccent',
      label: 'Accent colour',
      placeholder: '#635bff',
      inputType: 'text',
      showWhen: (f) => f.textMode === 'page'
    },
    {
      key: 'textPageTheme',
      label: 'Background',
      type: 'select',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'gradient', label: 'Soft gradient' },
        { value: 'dark', label: 'Midnight' }
      ],
      showWhen: (f) => f.textMode === 'page'
    },
    { key: 'textPageBig', label: 'Large display type', type: 'checkbox', showWhen: (f) => f.textMode === 'page' }
  ],
  phone: [
    { key: 'phone', label: 'Phone number', required: true, placeholder: '+254711436169', inputType: 'tel' }
  ],
  email: [
    { key: 'email', label: 'Email address', required: true, placeholder: 'you@example.com', inputType: 'email' },
    { key: 'emailSubject', label: 'Subject (optional)', placeholder: 'Hello from QRForge' },
    { key: 'emailBody', label: 'Message (optional)', placeholder: 'Optional email body…', type: 'textarea', rows: 3 }
  ],
  sms: [
    { key: 'smsPhone', label: 'Phone number', required: true, placeholder: '+254711436169', inputType: 'tel' },
    { key: 'smsMessage', label: 'Text message (optional)', placeholder: 'Hello!', type: 'textarea', rows: 3 }
  ],
  wifi: [
    { key: 'wifiSsid', label: 'Network name (SSID)', required: true, placeholder: 'CoffeeShop' },
    { key: 'wifiPassword', label: 'Password', placeholder: '••••••••', inputType: 'password' },
    {
      key: 'wifiSecurity',
      label: 'Security',
      type: 'select',
      options: [
        { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
        { value: 'WEP', label: 'WEP' },
        { value: 'none', label: 'None (open)' }
      ]
    },
    { key: 'wifiHidden', label: 'Hidden network', type: 'checkbox' }
  ],
  contact: [
    { key: 'contactName', label: 'Full name', placeholder: 'John Doe' },
    { key: 'contactOrg', label: 'Organization', placeholder: 'Acme Co' },
    { key: 'contactPhone', label: 'Phone', placeholder: '+1 555 123 4567', inputType: 'tel' },
    { key: 'contactEmail', label: 'Email', placeholder: 'john@example.com', inputType: 'email' },
    { key: 'contactWebsite', label: 'Website', placeholder: 'https://example.com', inputType: 'url' },
    { key: 'contactAddress', label: 'Address', placeholder: '123 Main St, Nairobi' }
  ],
  location: [
    { key: 'lat', label: 'Latitude', required: true, placeholder: '-1.2921', inputType: 'number' },
    { key: 'lng', label: 'Longitude', required: true, placeholder: '36.8219', inputType: 'number' }
  ],
  whatsapp: [
    { key: 'whatsappNumber', label: 'WhatsApp number', required: true, placeholder: '254711436169', inputType: 'tel' },
    { key: 'whatsappMessage', label: 'Default message (optional)', placeholder: 'Hello from QRForge!', type: 'textarea', rows: 3 }
  ],
  payment: [
    { key: 'payBusinessName', label: 'Business name', placeholder: 'Acme Coffee' },
    { key: 'payTillNumber', label: 'M-Pesa Till number', placeholder: '123456' },
    { key: 'payBusinessNumber', label: 'M-Pesa Paybill number', placeholder: '123456' },
    { key: 'payAccountNo', label: 'Account / Reference', placeholder: 'Order #123' },
    { key: 'payInstructions', label: 'Additional instructions', placeholder: 'Scan to pay via M-Pesa', type: 'textarea', rows: 3 }
  ],
  image: [
    {
      key: 'imageMode',
      label: 'How the image appears when scanned',
      type: 'select',
      options: [
        { value: 'embed', label: 'Embed the image directly in the QR (reader apps show it)' },
        { value: 'url', label: 'Open an image URL on scan (any phone camera)' }
      ]
    },
    {
      key: 'imageFile',
      label: 'Image to embed',
      type: 'file',
      accept: 'image/png,image/jpeg,image/webp,image/gif',
      showWhen: (f) => f.imageMode !== 'url'
    },
    {
      key: 'imageUrl',
      label: 'Image URL',
      required: true,
      placeholder: 'https://example.com/photo.jpg',
      inputType: 'url',
      showWhen: (f) => f.imageMode === 'url'
    }
  ]
}

function getTitle(type, fields) {
  const t = QR_TYPES.find((x) => x.id === type)
  const label = t ? t.label : 'QR Code'
  switch (type) {
    case 'url':
      return fields.url || label
    case 'wifi':
      return fields.wifiSsid || 'wifi-qr'
    case 'contact':
      return fields.contactName || 'contact'
    case 'text':
      return fields.textPageTitle || (fields.text || label).slice(0, 40)
    case 'email':
      return fields.email || 'email'
    case 'sms':
      return fields.smsPhone || 'sms'
    case 'phone':
      return fields.phone || 'phone'
    case 'location':
      return 'location'
    case 'whatsapp':
      return fields.whatsappNumber || 'whatsapp'
    case 'payment':
      return fields.payBusinessName || fields.payTillNumber || 'payment'
    case 'image':
      return fields.imageUrl || 'image-qr'
    default:
      return label
  }
}