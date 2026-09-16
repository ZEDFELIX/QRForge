import { useEffect, useMemo, useState } from 'react'
import {
  Radio, Plus, Pencil, Trash2, Copy, Loader2, ExternalLink, AlertTriangle,
  CheckCircle2, ShieldCheck, Calendar, KeyRound, Clock, Globe, Info
} from 'lucide-react'
import { loadAllCodes, saveCode, updateCode, deleteCode, duplicateCode } from '../utils/folders.js'
import {
  dynamicUrl, makeSlug, hashPassword, isBackendConfigured, DAY_NAMES, DAY_SHORT
} from '../utils/dynamic.js'
import { drawQrAsync, qrToSvg } from '../utils/qrGenerator.js'
import { checkDestination, destinationBrief } from '../utils/health.js'
import { downloadCanvasAs, downloadSvg } from '../utils/download.js'

export default function DynamicQRPage() {
  const [codes, setCodes] = useState(() => loadAllCodes().filter(c => c.isDynamic))
  const [editing, setEditing] = useState(null) // dynamic code being created/edited
  const [slug, setSlug] = useState(() => makeSlug(6))
  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [expireOn, setExpireOn] = useState('')
  const [expireAfterScans, setExpireAfterScans] = useState('')
  const [password, setPassword] = useState('')
  const [schedule, setSchedule] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [preview, setPreview] = useState({})
  const [health, setHealth] = useState({})

  const configured = isBackendConfigured()

  const refresh = () => setCodes(loadAllCodes().filter(c => c.isDynamic))

  useEffect(() => { refresh() }, [])

  const regenerateSlug = () => setSlug(makeSlug(6))

  // Build preview QR of the dynamic link
  useEffect(() => {
    if (!slug) { setPreview({}); return }
    const link = dynamicUrl(slug)
    const canvas = document.createElement('canvas')
    drawQrAsync(canvas, link, { size: 256, margin: 4, errorCorrection: 'M' })
      .then(() => setPreview({ link, dataUrl: canvas.toDataURL('image/png') }))
      .catch(() => setPreview({ link, dataUrl: null }))
    // Debounced destination check
    const t = setTimeout(() => {
      checkDestination(destination).then(setHealth)
    }, 600)
    return () => clearTimeout(t)
  }, [slug, destination])

  const addScheduleSlot = () => {
    setSchedule(s => [...s, { days: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00', destination: '' }])
  }

  const updateSlot = (i, patch) => setSchedule(s => s.map((slot, idx) => idx === i ? { ...slot, ...patch } : slot))

  const removeSlot = (i) => setSchedule(s => s.filter((_, idx) => idx !== i))

  const save = async () => {
    setBusy(true); setMsg(null)
    try {
      const cleanedDest = destination.trim()
      if (!/^https?:\/\//i.test(cleanedDest)) throw new Error('Destination must start with http:// or https://.')
      if (!name.trim()) throw new Error('Give this QR a name.')
      let passwordHash = ''
      if (password) passwordHash = await hashPassword(password)
      const hasSchedule = schedule.some(s => s.destination && /^https?:\/\//i.test(s.destination.trim()))
      const base = {
        isDynamic: true,
        dynamicConfig: {
          slug,
          destination: cleanedDest,
          expireOn: expireOn || null,
          expireAfterScans: expireAfterScans ? Number(expireAfterScans) : null,
          hasPassword: Boolean(passwordHash),
          passwordHash,
          schedule: hasSchedule ? schedule.filter(s => s.destination).map(s => ({ ...s, days: s.days, destination: s.destination.trim(), startTime: s.startTime, endTime: s.endTime })) : []
        }
      }
      if (editing) {
        const updated = updateCode(editing.id, { title: name.trim(), ...base })
        setCodes(updated.filter(c => c.isDynamic))
        setMsg({ kind: 'ok', text: 'Destination updated. The QR image has NOT changed.' })
      } else {
        const entry = { id: `dyn_${Date.now()}_${slug}`, type: 'url', title: name.trim(), payload: dynamicUrl(slug), preview: null, ...base }
        const all = saveCode(entry)
        setCodes(all.filter(c => c.isDynamic))
        setMsg({ kind: 'ok', text: 'Dynamic QR created!' })
      }
      resetForm()
    } catch (e) {
      setMsg({ kind: 'err', text: e.message })
    } finally {
      setBusy(false)
    }
  }

  const resetForm = () => {
    setEditing(null)
    setName('')
    setDestination('')
    setExpireOn('')
    setExpireAfterScans('')
    setPassword('')
    setSchedule([])
    setSlug(makeSlug(6))
  }

  const editCode = (c) => {
    setEditing(c)
    setName(c.title || '')
    setDestination(c.dynamicConfig?.destination || '')
    setExpireOn(c.dynamicConfig?.expireOn || '')
    setExpireAfterScans(c.dynamicConfig?.expireAfterScans || '')
    setPassword('')
    setSchedule(c.dynamicConfig?.schedule || [])
    setSlug(c.dynamicConfig?.slug || makeSlug(6))
  }

  const downloadPreview = () => {
    if (!preview.dataUrl) return
    downloadCanvasAs({ toDataURL: () => preview.dataUrl }, 'png', `${name || 'dynamic'}-qr`)
  }

  const checkHealth = async (url) => checkDestination(url)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Radio className="text-violet-600" /> Dynamic QR
        </h1>
        <p className="text-sm text-slate-500">
          The QR points to a QRForge-managed link that redirects — so you can change the destination later <strong>without reprinting</strong>.
        </p>
      </header>

      {/* Backend status banner */}
      <div className={`rounded-2xl border p-4 text-sm ${configured ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
        <div className="flex items-start gap-2">
          {configured ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
          <div>
            <p className="font-semibold">{configured ? 'Dynamic backend connected.' : 'Dynamic backend not configured yet.'}</p>
            <p className="mt-1 text-xs">
              {configured
                ? 'You can create dynamic QR codes and edit destinations live.'
                : 'Create and design dynamic QRs now. To make them redirect, connect Supabase (see Settings → Dynamic QR) and run supabase/schema.sql. Until then, scanning shows a clear "not configured" page — nothing pretends to work.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create / edit form */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
            {editing ? <Pencil size={16} /> : <Plus size={16} />} {editing ? 'Edit dynamic QR' : 'Create dynamic QR'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="dyn-name">QR name</label>
              <input id="dyn-name" className="input w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="Restaurant Menu" />
            </div>

            <div>
              <label className="label" htmlFor="dyn-dest">Destination URL</label>
              <input id="dyn-dest" className="input w-full" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="https://restaurant.example.com/menu-2027" />
              {destination && (
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className={health.okay ? 'text-emerald-600' : health.note && !health.okay ? 'text-amber-600' : health.httpStatus ? 'text-slate-500' : 'text-slate-400'}>
                    {health.note && !health.okay ? health.note : destinationBrief(health)}
                  </span>
                  {health.domain && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                      <Globe size={11} /> {health.domain}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="label" htmlFor="dyn-slug">Dynamic link</label>
              <div className="flex items-center gap-2">
                <code className="input w-full flex-1 truncate bg-slate-50 text-xs">{dynamicUrl(slug)}</code>
                <button onClick={regenerateSlug} className="btn-secondary shrink-0 px-3 text-xs" title="New short code">
                  <Copy size={13} /> New
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">Changing the link changes the QR. Keep it fixed and you can edit the destination anytime.</p>
            </div>

            <details className="rounded-xl border border-slate-200 p-3 text-sm">
              <summary className="flex cursor-pointer items-center gap-2 font-medium text-slate-700">
                <Calendar size={15} className="text-indigo-500" /> Expiration (optional)
              </summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="dyn-expire-on">Expire on date</label>
                  <input id="dyn-expire-on" type="date" className="input w-full" value={expireOn} onChange={(e) => setExpireOn(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="dyn-expire-scans">Expire after N scans</label>
                  <input id="dyn-expire-scans" type="number" min="0" className="input w-full" value={expireAfterScans} onChange={(e) => setExpireAfterScans(e.target.value)} placeholder="e.g. 500" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-400">When expired, visitors see a clear message.</p>
            </details>

            <details className="rounded-xl border border-slate-200 p-3 text-sm">
              <summary className="flex cursor-pointer items-center gap-2 font-medium text-slate-700">
                <KeyRound size={15} className="text-indigo-500" /> Password protection (optional)
              </summary>
              <div className="mt-3">
                <input
                  type="password"
                  className="input w-full"
                  placeholder="Require a password to access"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck size={13} /> Stored as a SHA-256 hash only — never plaintext.
                </p>
              </div>
            </details>

            <details className="rounded-xl border border-slate-200 p-3 text-sm">
              <summary className="flex cursor-pointer items-center gap-2 font-medium text-slate-700">
                <Clock size={15} className="text-indigo-500" /> Schedule destination changes (optional)
              </summary>
              <div className="mt-3 space-y-3">
                {schedule.map((slot, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-3">
                    <div className="mb-2 flex flex-wrap gap-1">
                      {DAY_SHORT.map((d, di) => (
                        <button
                          key={di}
                          onClick={() => updateSlot(i, { days: slot.days.includes(di) ? slot.days.filter(x => x !== di) : [...slot.days, di] })}
                          className={`rounded-md px-2 py-1 text-xs font-medium ${slot.days.includes(di) ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}
                        >{d}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="time" value={slot.startTime} onChange={(e) => updateSlot(i, { startTime: e.target.value })} className="input text-xs" />
                      <input type="time" value={slot.endTime} onChange={(e) => updateSlot(i, { endTime: e.target.value })} className="input text-xs" />
                    </div>
                    <input value={slot.destination} onChange={(e) => updateSlot(i, { destination: e.target.value })} className="input mt-2 w-full text-xs" placeholder="Destination for these days/times" />
                    <button onClick={() => removeSlot(i)} className="mt-2 text-xs text-red-500 hover:underline">Remove slot</button>
                  </div>
                ))}
                <button onClick={addScheduleSlot} className="btn-secondary w-full text-xs">+ Add time slot</button>
              </div>
            </details>

            <div className="flex items-center gap-2">
              <button onClick={save} disabled={busy} className="btn-primary inline-flex flex-1 items-center justify-center gap-2">
                {busy ? <Loader2 size={15} className="animate-spin" /> : null}
                {editing ? 'Save changes (QR unchanged)' : 'Create Dynamic QR'}
              </button>
              {editing && <button onClick={resetForm} className="btn-secondary">Cancel</button>}
            </div>
            {msg && (
              <p className={`flex items-center gap-1.5 text-sm ${msg.kind === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
                {msg.kind === 'ok' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />} {msg.text}
              </p>
            )}
            {!configured && editing && (
              <p className="text-xs text-amber-600">You can edit these values locally. Live redirect behavior activates once the backend is connected.</p>
            )}
          </div>
        </div>

        {/* Live link preview */}
        <div className="card self-start p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Your dynamic link</h2>
          {preview.link ? (
            <div className="flex flex-col items-center">
              {preview.dataUrl ? (
                <img src={preview.dataUrl} alt="Dynamic QR preview" className="h-56 w-56 rounded-2xl border border-slate-200 p-2" />
              ) : (
                <span className="flex h-56 w-56 items-center justify-center rounded-2xl border border-slate-200 text-slate-300"><Radio size={40} /></span>
              )}
              <code className="mt-4 w-full truncate rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">{preview.link}</code>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <button onClick={downloadPreview} className="btn-primary inline-flex items-center gap-1.5 text-sm"><ExternalLink size={14} /> Download QR</button>
                <a href={preview.link} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-1.5 text-sm"><ExternalLink size={14} /> Open link</a>
              </div>
              <p className="mt-4 flex items-start gap-1.5 text-xs text-slate-400">
                <Info size={13} className="mt-0.5 shrink-0" />
                This QR never changes when you edit the destination — the magic of dynamic QR codes.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Enter a name to generate your dynamic link preview.</p>
          )}
        </div>
      </div>

      {/* Manage existing dynamic codes */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Your dynamic QR codes</h2>
        {codes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
            No dynamic QR codes yet. Create one above.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[720px] bg-white text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">QR name</th>
                  <th className="px-4 py-3 font-semibold">Destination URL</th>
                  <th className="px-4 py-3 font-semibold">Link</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {codes.map((c) => {
                  const cfg = c.dynamicConfig || {}
                  const link = dynamicUrl(cfg.slug || '')
                  return (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-medium text-slate-800">{c.title}</td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-slate-500" title={cfg.destination}>{cfg.destination || '—'}</td>
                      <td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-slate-400" title={link}>{link}</td>
                      <td className="px-4 py-3">
                        {cfg.expireOn && new Date(cfg.expireOn) < new Date() ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Expired</span>
                        ) : cfg.hasPassword || cfg.schedule?.length ? (
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">Protected</span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => editCode(c)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600" title="Edit destination (QR unchanged)"><Pencil size={15} /></button>
                          <button onClick={() => { const list = duplicateCode(c.id, `${c.title} (copy)`); setCodes(list.filter(x => x.isDynamic)) }} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" title="Duplicate"><Copy size={15} /></button>
                          <button onClick={async () => { const h = await checkHealth(cfg.destination); alert(h.okay ? `Destination responds.\n${destinationBrief(h)}` : h.note) }} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" title="Health check"><ShieldCheck size={15} /></button>
                          <button onClick={() => { if (confirm('Delete this dynamic QR?')) { const list = deleteCode(c.id); setCodes(list.filter(x => x.isDynamic)) } }} className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-500" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}