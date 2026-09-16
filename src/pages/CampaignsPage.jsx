import { useState } from 'react'
import { Layers, Plus, QrCode, Trash2, Pencil, Check, X } from 'lucide-react'
import { loadAllCodes } from '../utils/folders.js'

const CAMPAIGN_KEY = 'qrforge:campaigns:v1'

function loadCampaigns() {
  try { return JSON.parse(localStorage.getItem(CAMPAIGN_KEY)) || [] } catch { return [] }
}
function saveCampaigns(list) {
  try { localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(list)) } catch { /* quota */ }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(loadCampaigns)
  const codes = loadAllCodes()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [editing, setEditing] = useState(null)

  const addCampaign = () => {
    if (!name.trim()) return
    const c = { id: `camp_${Date.now()}`, name: name.trim(), description: desc.trim(), qrIds: [], createdAt: new Date().toISOString(), status: 'active' }
    const list = editing ? campaigns.map(x => x.id === editing.id ? { ...x, name: name.trim(), description: desc.trim() } : x) : [...campaigns, c]
    saveCampaigns(list)
    setCampaigns(list)
    setName(''); setDesc(''); setEditing(null)
  }

  const toggleQr = (campId, qrId) => {
    const list = campaigns.map(c => {
      if (c.id !== campId) return c
      const has = c.qrIds.includes(qrId)
      return { ...c, qrIds: has ? c.qrIds.filter(id => id !== qrId) : [...c.qrIds, qrId] }
    })
    saveCampaigns(list)
    setCampaigns(list)
  }

  const remove = (campId) => {
    const list = campaigns.filter(c => c.id !== campId)
    saveCampaigns(list)
    setCampaigns(list)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Layers className="text-indigo-500" /> Campaigns
        </h1>
        <p className="text-sm text-slate-500">Group multiple QR codes into a marketing campaign and track them together.</p>
      </header>

      <div className="card p-6">
        <h2 className="mb-3 text-base font-semibold text-slate-900">{editing ? 'Rename campaign' : 'New campaign'}</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2026 Christmas Campaign" className="input" />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description (optional)" className="input" />
          <button onClick={addCampaign} className="btn-primary inline-flex items-center gap-1.5"><Plus size={15} /> {editing ? 'Save' : 'Create'}</button>
        </div>
        {editing && <button onClick={() => { setEditing(null); setName(''); setDesc('') }} className="mt-2 text-xs text-slate-400 hover:underline">Cancel editing</button>}
      </div>

      {campaigns.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400">
          No campaigns yet. Create one to group related QR codes.
        </p>
      ) : (
        <div className="space-y-6">
          {campaigns.map((c) => {
            const campCodes = codes.filter(x => c.qrIds.includes(x.id))
            return (
              <section key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{c.name}</h3>
                    {c.description && <p className="text-sm text-slate-500">{c.description}</p>}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditing(c.id); setName(c.name); setDesc(c.description || '') }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
                    <button onClick={() => remove(c.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-indigo-50 p-3 text-center">
                    <p className="text-lg font-bold text-indigo-700">{campCodes.length}</p>
                    <p className="text-xs text-slate-500">QR codes in campaign</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 text-center">
                    <p className="text-lg font-bold text-emerald-700">Combined</p>
                    <p className="text-xs text-slate-500">Analytics shown per code when backend is live</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3 text-center">
                    <p className="text-sm font-bold text-amber-700" style={{ lineHeight: '1.9rem' }}>{c.status}</p>
                    <p className="text-xs text-slate-500">Status</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-slate-700">Attach QR codes</p>
                  {codes.length === 0 ? (
                    <p className="text-sm text-slate-400">Create some QR codes first (generator or bulk).</p>
                  ) : (
                    <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto">
                      {codes.map((code) => {
                        const selected = c.qrIds.includes(code.id)
                        return (
                          <button
                            key={code.id}
                            onClick={() => toggleQr(c.id, code.id)}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${selected ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                          >
                            <QrCode size={13} /> <span className="max-w-[140px] truncate">{code.title || code.type}</span>
                            {selected && <Check size={13} />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}