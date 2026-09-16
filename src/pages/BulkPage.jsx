import { useRef, useState } from 'react'
import {
  FileSpreadsheet, UploadCloud, Download, Image as ImageIcon, RefreshCw,
  AlertTriangle, CheckCircle2, Loader2, FileText
} from 'lucide-react'
import {
  parseCSV, detectQRType, bulkGenerate, downloadAllAsZip, downloadMappingCSV
} from '../utils/bulk.js'
import { QR_TYPES } from '../utils/qrGenerator.js'
import { formatNumber } from '../utils/analytics.js'

const SAMPLE = `name,url
Restaurant A,https://restaurant-a.example.com
Restaurant B,https://restaurant-b.example.com
Restaurant C,https://restaurant-c.example.com`

const SAMPLE_WIFI = `location,ssid,password
Table 1,Joe's Café,guest123
Table 2,Joe's Café,guest123
Lounge,Upstairs_WiFi,welcome2026`

export default function BulkPage() {
  const fileRef = useRef(null)
  const [csvText, setCsvText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [qrType, setQrType] = useState('')
  const [items, setItems] = useState([])
  const [errors, setErrors] = useState([])
  const [generating, setGenerating] = useState(false)
  const [filename, setFilename] = useState('qr-bulk')

  const handleParse = () => {
    const result = parseCSV(csvText)
    setParsed(result)
    setItems([])
    setErrors(result.errors)
    const detected = detectQRType(result.headers)
    setQrType(detected || 'url')
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFilename((file.name || 'qr-bulk').replace(/\.csv$/i, ''))
    const reader = new FileReader()
    reader.onload = () => { setCsvText(String(reader.result || '')) }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleGenerate = async () => {
    if (!parsed || !qrType) return
    setGenerating(true)
    const start = Date.now()
    const res = await bulkGenerate(parsed.rows, qrType, { fg: '#111827', bg: '#ffffff', size: 256, margin: 4, errorCorrection: 'M', rounded: false })
    // force a tick so the spinner paints
    if (Date.now() - start < 300) await new Promise(r => setTimeout(r, 300))
    setItems(res.items)
    setErrors(res.errors)
    setGenerating(false)
  }

  const validCount = items.filter(i => i.valid).length
  const invalidCount = items.length - validCount

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Bulk QR Generator</h1>
        <p className="text-sm text-slate-500">
          Upload a CSV, generate one QR code per row, then download all as a ZIP. Free and unlimited.
        </p>
      </header>

      {/* Sample / upload */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-900">
            <FileSpreadsheet size={18} className="text-indigo-500" /> 1. Add your CSV
          </h2>
          <p className="mb-3 text-sm text-slate-500">Paste CSV data or upload a file. First row should be column headers.</p>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={7}
            placeholder="name,url&#10;Restaurant A,https://example.com/a&#10;Restaurant B,https://example.com/b"
            className="input w-full resize-y font-mono text-xs"
            aria-label="CSV data"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={handleParse} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw size={15} /> Parse CSV
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <UploadCloud size={15} /> Upload .csv
            </button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </div>
          <details className="mt-4 text-xs text-slate-400">
            <summary className="cursor-pointer font-medium text-slate-500">View sample data</summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-3 font-mono">{SAMPLE}</pre>
            <p className="mt-2 font-medium text-slate-500">Wi-Fi example (ssid/password columns):</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-3 font-mono">{SAMPLE_WIFI}</pre>
          </details>
        </div>

        <div className="card p-6">
          <h2 className="mb-2 text-base font-semibold text-slate-900">2. Choose QR type</h2>
          <p className="mb-3 text-sm text-slate-500">
            {parsed
              ? `Detected ${parsed.headers.length} column(s), ${parsed.rows.length} row(s). Auto-guessed type below — change if needed.`
              : 'Parse a CSV first to auto-detect the QR type.'}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {QR_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setQrType(t.id)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  qrType === t.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            disabled={!parsed || generating}
            className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {generating ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <>Generate {parsed ? parsed.rows.length : 'all'} QR codes</>}
          </button>
          {errors.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-red-500">
              {errors.slice(0, 5).map((e, i) => <li key={i} className="flex items-center gap-1.5"><AlertTriangle size={12} />{e}</li>)}
            </ul>
          )}
        </div>
      </div>

      {/* Results */}
      {items.length > 0 && (
        <section className="card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">3. Results</h2>
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 size={15} className="text-emerald-500" />
                {formatNumber(validCount)} generated
                {invalidCount > 0 && <span className="flex items-center gap-1 text-amber-600"><AlertTriangle size={13} />{formatNumber(invalidCount)} invalid (skipped)</span>}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => downloadAllAsZip(items, `${filename}-codes.zip`)} className="btn-primary inline-flex items-center gap-2">
                <Download size={15} /> Download All (.zip)
              </button>
              <button onClick={() => downloadMappingCSV(items, `${filename}-mapping.csv`)} className="btn-secondary inline-flex items-center gap-2">
                <FileText size={15} /> Mapping CSV
              </button>
            </div>
          </div>

          <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((item, idx) => (
              <div key={item.id || idx} className={`rounded-xl border p-3 ${item.valid ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50'}`}>
                {item.valid ? (
                  <>
                    <img src={item.dataUrl} alt="" className="mx-auto h-28 w-28 object-contain" />
                    <p className="mt-2 truncate text-center text-xs font-medium text-slate-700" title={item.title}>{item.title}</p>
                    <a
                      href={item.dataUrl}
                      download={`${(item.title || `qr-${idx + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_')}.png`}
                      className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                    >
                      <ImageIcon size={12} /> PNG
                    </a>
                  </>
                ) : (
                  <div className="flex h-28 flex-col items-center justify-center gap-1 text-center text-amber-600">
                    <AlertTriangle size={18} />
                    <p className="px-1 text-[11px] leading-tight">{item.error || 'Invalid row'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}