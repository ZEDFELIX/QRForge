import { useEffect, useRef, useState } from 'react'
import { History as HistoryIcon, Trash2, RefreshCw, ShieldCheck, QrCode } from 'lucide-react'
import { loadHistory, saveHistoryEntry, removeHistoryEntry, clearHistory } from '../utils/storage.js'
import { drawQr } from '../utils/qrGenerator.js'

export default function QRHistory({ currentPayload, type, fields, onApply }) {
  const [items, setItems] = useState([])
  const [note, setNote] = useState('')
  const lastSaved = useRef('')

  // auto-save the current QR to history (once per unique payload)
  useEffect(() => {
    if (!currentPayload) return
    if (lastSaved.current === currentPayload) return
    let preview = null
    try {
      const c = document.createElement('canvas')
      drawQr(c, currentPayload, { size: 128, margin: 2, errorCorrection: 'M' })
      preview = c.toDataURL('image/png')
    } catch {
      preview = null
    }
    saveHistoryEntry({
      type,
      payload: currentPayload,
      fields,
      title: titleFrom(type, fields),
      preview
    })
    lastSaved.current = currentPayload
    setItems(loadHistory())
  }, [currentPayload, type, fields])

  useEffect(() => {
    setItems(loadHistory())
  }, [])

  const handleRemove = (id) => setItems(removeHistoryEntry(id))
  const handleClear = () => {
    if (items.length && confirm('Clear all saved QR codes on this device?')) {
      setItems(clearHistory())
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-10">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <HistoryIcon size={20} aria-hidden="true" /> Recent QR Codes
        </h2>
        <p className="text-sm text-slate-500">
          Your generated QR codes will appear here — stored only in this browser on your device.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <HistoryIcon size={20} aria-hidden="true" /> Recent QR Codes
        </h2>
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-red-300 hover:text-red-600"
        >
          <Trash2 size={14} aria-hidden="true" /> Clear History
        </button>
      </div>

      <p className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck size={13} aria-hidden="true" />
        Stored locally in your browser. You can delete anything anytime.
      </p>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <li key={it.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-center rounded-xl bg-slate-50 p-2">
              {it.preview ? (
                <img
                  src={it.preview}
                  alt={`Previous ${it.type} QR code`}
                  loading="lazy"
                  className="h-20 w-20 object-contain"
                />
              ) : (
                <QrCode size={36} className="text-slate-300" aria-hidden="true" />
              )}
            </div>
            <p className="truncate text-sm font-medium text-slate-800" title={it.title}>
              {it.title || it.type}
            </p>
            <p className="text-xs text-slate-400">
              {new Date(it.createdAt).toLocaleDateString()} · {it.type}
              {it.downloads > 0 && <span className="text-amber-500"> · downloaded {it.downloads}×</span>}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => onApply(it)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
              >
                <RefreshCw size={12} aria-hidden="true" /> Reuse
              </button>
              <button
                onClick={() => handleRemove(it.id)}
                aria-label={`Delete ${it.title} history item`}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-1 text-slate-400 hover:border-red-200 hover:text-red-500"
              >
                <Trash2 size={12} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function titleFrom(type, fields) {
  switch (type) {
    case 'url': return fields.url || 'URL'
    case 'wifi': return fields.wifiSsid || 'Wi-Fi'
    case 'contact': return fields.contactName || 'Contact'
    case 'text': return (fields.text || 'Text').slice(0, 40)
    case 'email': return fields.email || 'Email'
    case 'sms': return fields.smsPhone || 'SMS'
    case 'phone': return fields.phone || 'Phone'
    case 'location': return 'Location'
    default: return type
  }
}