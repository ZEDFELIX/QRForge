import { useCallback, useMemo, useState } from 'react'
import { QR_TYPES, buildPayload, drawQr, qrToSvg, contrastRatio, effectiveEC } from '../utils/qrGenerator.js'
import { validateType } from '../utils/validators.js'
import QRTypeSelector from './QRTypeSelector.jsx'
import QRCustomization from './QRCustomization.jsx'
import QRPreview from './QRPreview.jsx'
import DownloadButtons from './DownloadButtons.jsx'
import QuickExamples from './QuickExamples.jsx'
import QRHistory from './QRHistory.jsx'

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
  lng: ''
}

export default function QRGenerator() {
  const [type, setType] = useState('url')
  const [fields, setFields] = useState({ ...EMPTY_FIELDS })
  const [fg, setFg] = useState('#111827')
  const [bg, setBg] = useState('#FFFFFF')
  const [size, setSize] = useState(512)
  const [margin, setMargin] = useState(4)
  const [errorCorrection, setErrorCorrection] = useState('M')
  const [rounded, setRounded] = useState(false)
  const [logoDataUrl, setLogoDataUrl] = useState(null)
  const [logoRatio, setLogoRatio] = useState(0.2)

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

  const rasterize = useCallback((targetSize) => {
    const c = document.createElement('canvas')
    drawQr(c, payload, {
      fg,
      bg,
      size: targetSize || size,
      margin,
      errorCorrection: ec,
      rounded,
      logoDataUrl,
      logoRatio
    })
    return c
  }, [payload, fg, bg, size, margin, ec, rounded, logoDataUrl, logoRatio])

  const generateSvg = useCallback(() => {
    return qrToSvg(payload, {
      fg,
      bg,
      margin,
      errorCorrection: ec,
      rounded,
      logoDataUrl,
      logoRatio
    })
  }, [payload, fg, bg, margin, ec, rounded, logoDataUrl, logoRatio])

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
          />

          <div className="card p-6">
            <h2 className="mb-1 text-base font-semibold text-slate-900">Export</h2>
            <DownloadButtons
              disabled={errors.length > 0 || !payload}
              rasterize={rasterize}
              generateSvg={generateSvg}
              title={getTitle(type, fields)}
              payload={payload}
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-24 self-start">
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
          />
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {FIELD_SCHEMAS[type].map((conf) => (
        <div key={conf.key} className={conf.type === 'textarea' || conf.type === 'checkbox' ? 'sm:col-span-2' : ''}>
          <label htmlFor={conf.key} className="label">
            {conf.label}
            {conf.required && <span className="text-red-500"> *</span>}
          </label>
          {renderInput(conf)}
        </div>
      ))}
    </div>
  )
}

const FIELD_SCHEMAS = {
  url: [
    { key: 'url', label: 'Website URL', required: true, placeholder: 'https://example.com', inputType: 'url' }
  ],
  text: [
    { key: 'text', label: 'Text', required: true, placeholder: 'Enter any text…', type: 'textarea', rows: 4 }
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
      return (fields.text || label).slice(0, 40)
    case 'email':
      return fields.email || 'email'
    case 'sms':
      return fields.smsPhone || 'sms'
    case 'phone':
      return fields.phone || 'phone'
    case 'location':
      return 'location'
    default:
      return label
  }
}