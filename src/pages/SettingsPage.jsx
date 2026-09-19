import { useState } from 'react'
import { Settings as SettingsIcon, Database, Trash2, ExternalLink, CheckCircle2, Cloud, RefreshCw, UploadCloud, DownloadCloud } from 'lucide-react'
import { isBackendConfigured } from '../utils/dynamic.js'
import { clearCodes } from '../utils/folders.js'
import {
  bucketName, cloudStatus, refreshCloudStatus, syncFromCloud,
  pushAllToCloud, clearCloudCodes
} from '../utils/cloudStore.js'

export default function SettingsPage() {
  const [configured, setConfigured] = useState(isBackendConfigured)
  const [copied, setCopied] = useState(false)
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '')
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  const [updating, setUpdating] = useState(false)
  const [cloud, setCloud] = useState(null)
  const [bucket, setBucket] = useState(bucketName)
  const [cloudBusy, setCloudBusy] = useState(false)

  const refreshCloud = async () => {
    const s = await refreshCloudStatus()
    setCloud(s)
    return s
  }

  const copyExample = () => {
    navigator.clipboard?.writeText(`VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_ANON_KEY=${supabaseKey}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {})
  }

  const applyLocalConfig = () => {
    setUpdating(true)
    // Persist a local override so dynamic/analytics pages can reach the backend.
    try {
      const config = { url: supabaseUrl.trim(), key: supabaseKey.trim() }
      localStorage.setItem('qrforge:supabase:v1', JSON.stringify(config))
      setConfigured(Boolean(config.url && config.key))
      alert('Saved to this device.\n\nIMPORTANT: for the public redirect endpoint (/api/r/:slug) to work for everyone who scans your QR, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel → Project → Settings → Environment Variables, and run supabase/schema.sql in your Supabase project.')
    } finally {
      setUpdating(false)
    }
  }

  const clearLocalData = () => {
    if (!confirm('This clears ALL locally stored QR codes, history, folders and brand kit on this device. Continue?')) return
    clearCodes()
    try { localStorage.removeItem('qrforge:brandkit:v1'); localStorage.removeItem('qrforge:folders:v1'); localStorage.removeItem('qrforge:qr_folders:v1'); localStorage.removeItem('qrforge:campaigns:v1') } catch { /* ignore */ }
    location.href = '/'
  }

  const saveBucket = () => {
    try { localStorage.setItem('qrforge:bucket:v1', bucket.trim()) } catch { /* ignore */ }
    refreshCloud().then((s) => alert(s.message))
  }

  const doCloudSync = async (kind) => {
    if (cloudBusy) return
    setCloudBusy(true)
    try {
      const s = await refreshCloud()
      if (!s.ok) { alert(s.message); }
      else if (kind === 'push') {
        try { localStorage.setItem('qrforge:bucket:v1', bucket.trim()) } catch { /* ignore */ }
        const n = await pushAllToCloud()
        alert(`Uploaded ${n} QR code record(s) to Supabase Storage.`)
      } else if (kind === 'pull') {
        const list = await syncFromCloud()
        alert(list ? `Merged ${list.length} QR code(s) from cloud into this device.` : 'Nothing to pull, or cloud is unreachable right now.')
      } else if (kind === 'clear') {
        if (!confirm('Delete ALL QR code records stored in the cloud backup for this device? They will be gone from every synced device. This does not touch local copies on other devices.')) return
        const n = await clearCloudCodes()
        alert(n ? `Deleted ${n} record(s) from cloud storage.` : 'No cloud records to delete (or already cleared).')
      }
      setCloud(await cloudStatus(true))
    } finally {
      setCloudBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <SettingsIcon className="text-indigo-500" /> Settings
        </h1>
      </header>

      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Database size={16} className="text-indigo-500" /> Dynamic QR backend (Supabase)
        </h2>
        <div className={`mt-3 rounded-xl border p-4 text-sm ${configured ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
          <p className="flex items-center gap-2 font-semibold">
            {configured ? <CheckCircle2 size={16} /> : 'Not configured'} {configured ? 'Dynamic QR enabled.' : 'Dynamic QR redirect requires setup.'}
          </p>
          <p className="mt-1 text-xs">
            {configured
              ? 'Your Supabase credentials are saved on this device. The redirect endpoint still needs the same values in Vercel env vars to work for all scanners.'
              : 'Static QR generation is 100% free and needs nothing. To enable dynamic QR redirects + real analytics: create a free Supabase project, run supabase/schema.sql, then add the URL + anon key below and in Vercel.'}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="sb-url">Supabase project URL</label>
            <input id="sb-url" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} placeholder="https://xxxx.supabase.co" className="input w-full" />
          </div>
          <div>
            <label className="label" htmlFor="sb-key">Supabase anon (publishable) key</label>
            <input id="sb-key" value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)} placeholder="eyJhbGciOi…" className="input w-full font-mono text-xs" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={applyLocalConfig} disabled={updating} className="btn-primary text-sm">Save on this device</button>
            <button onClick={copyExample} className="btn-secondary text-sm">Copy .env block</button>
          </div>
          {copied && <p className="text-xs text-emerald-600">Copied!</p>}
          <details className="rounded-xl border border-slate-200 p-3 text-xs text-slate-500">
            <summary className="cursor-pointer font-medium text-slate-600">Setup steps in Vercel</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Create a free project at supabase.com and run the SQL in <code>supabase/schema.sql</code>.</li>
              <li>In Vercel project → Settings → Environment Variables add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (also available to the serverless function via <code>SUPABASE_URL</code>/<code>SUPABASE_ANON_KEY</code>).</li>
              <li>Deploy. Dynamic QR links at <code>/api/r/:slug</code> now redirect live and record scans.</li>
            </ol>
          </details>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Cloud size={16} className="text-indigo-500" /> QR code backup (Supabase Storage)
        </h2>
        <div className={`mt-3 rounded-xl border p-4 text-sm ${cloud && cloud.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
          <p className="flex items-center gap-2 font-semibold">
            {!cloud && <RefreshCw size={15} className="animate-spin" />}
            {cloud && cloud.ok ? <CheckCircle2 size={16} /> : 'Off'}
            {cloud ? (cloud.ok ? 'Cloud backup active.' : cloud.message) : 'Checking cloud storage…'}
          </p>
          <p className="mt-1 text-xs">
            {cloud && cloud.ok
              ? 'Every saved QR code is stored as a JSON record in your Supabase Storage bucket. It persists across browsers and devices until you delete it (or the bucket).'
              : 'Uses the same Supabase connection above. Enable it to store your QR codes in the cloud instead of only this device.'}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="sb-bucket">Storage bucket name</label>
            <input id="sb-bucket" value={bucket} onChange={(e) => setBucket(e.target.value)} placeholder="qrforge-codes" className="input w-full font-mono text-xs" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={saveBucket} className="btn-secondary text-sm"><RefreshCw size={14} /> Check connection</button>
            <button onClick={() => doCloudSync('push')} disabled={cloudBusy} className="btn-primary text-sm"><UploadCloud size={14} /> {cloudBusy ? 'Working…' : 'Sync my codes to cloud'}</button>
            <button onClick={() => doCloudSync('pull')} disabled={cloudBusy} className="btn-secondary text-sm"><DownloadCloud size={14} /> Fetch from cloud</button>
            <button
              onClick={() => doCloudSync('clear')}
              disabled={cloudBusy}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <Trash2 size={14} /> Delete everything from cloud
            </button>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Records live at <code>qrs/&lt;device&gt;/&lt;code&gt;.json</code> in the selected bucket. Deleting a
            QR in My Codes removes its cloud record too. Running <code>supabase/schema.sql</code> creates the
            <code> qrforge-codes</code> bucket and its access policies automatically.
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold text-slate-900">Data & privacy</h2>
        <p className="mt-2 text-sm text-slate-500">
          Static QR generation, templates, brand kit and folders run locally in your browser. Your saved
          QR codes additionally sync to your own Supabase project when cloud backup is enabled; otherwise
          everything stays in localStorage. Nothing ever goes to a third party.
        </p>
        <button
          onClick={clearLocalData}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          <Trash2 size={15} /> Clear all local data
        </button>
      </div>

      <a href="https://supabase.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
        Supabase — free tier available <ExternalLink size={13} />
      </a>
    </div>
  )
}