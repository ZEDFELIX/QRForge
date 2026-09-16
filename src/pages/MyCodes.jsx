import { useMemo, useState } from 'react'
import {
  Search, Folder, FolderPlus, RefreshCw, Trash2, Copy, Pencil, Lock, LockOpen,
  ArrowRight, X, Check, Grid2X2, QrCode
} from 'lucide-react'
import {
  loadAllCodes, deleteCode, duplicateCode, updateCode,
  loadFolders, createFolder, renameFolder, deleteFolder, loadAssignments, assignQrToFolder
} from '../utils/folders.js'

export default function MyCodes() {
  const [codes, setCodes] = useState(() => loadAllCodes())
  const [folders, setFolders] = useState(() => loadFolders())
  const [assignments, setAssignments] = useState(() => loadAssignments())
  const [query, setQuery] = useState('')
  const [activeFolder, setActiveFolder] = useState(null)
  const [editing, setEditing] = useState(null) // code id being renamed
  const [renameValue, setRenameValue] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [moving, setMoving] = useState(null) // code id being moved

  const refresh = (list = loadAllCodes(), f = loadFolders(), a = loadAssignments()) => {
    setCodes(list); setFolders(f); setAssignments(a)
  }

  const filtered = useMemo(() => {
    let list = codes
    if (activeFolder) list = list.filter(c => assignments[c.id] === activeFolder)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(c =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.payload || '').toLowerCase().includes(q) ||
        (c.type || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [codes, query, activeFolder, assignments])

  const handleAddFolder = () => {
    const name = newFolderName.trim()
    if (!name) return
    refresh(loadAllCodes(), createFolder(name), loadAssignments())
    setNewFolderName('')
    setShowNewFolder(false)
  }

  const doRename = (id) => {
    updateCode(id, { title: renameValue.trim() || 'Untitled' })
    refresh()
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900">My QR Codes</h1>
        <p className="text-sm text-slate-500">Everything is stored on this device only.</p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, URL, or type…"
          className="input w-full pl-10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Folders */}
        <aside>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Folder size={15} className="text-indigo-500" /> Folders
            </h2>
            <button
              onClick={() => setShowNewFolder((s) => !s)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
              aria-label="New folder"
            >
              <FolderPlus size={16} />
            </button>
          </div>
          {showNewFolder && (
            <div className="mb-2 flex gap-1.5">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                placeholder="Folder name"
                className="input py-1.5 text-sm"
              />
              <button onClick={handleAddFolder} className="btn-primary px-3 text-sm">Add</button>
            </div>
          )}
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveFolder(null)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${activeFolder === null ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Grid2X2 size={16} /> All codes <span className="ml-auto text-xs text-slate-400">{codes.length}</span>
              </button>
            </li>
            {folders.map((f) => (
              <li key={f.id} className="group">
                <div className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium ${activeFolder === f.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <button onClick={() => setActiveFolder(f.id)} className="flex flex-1 items-center gap-2 overflow-hidden text-left">
                    <Folder size={16} /> <span className="truncate">{f.name}</span>
                  </button>
                  <span className="ml-1 hidden shrink-0 gap-0.5 group-hover:flex">
                    <button
                      onClick={() => {
                        const n = prompt('Rename folder', f.name)
                        if (n && n.trim()) refresh(loadAllCodes(), renameFolder(f.id, n.trim()), loadAssignments())
                      }}
                      className="rounded p-1 text-slate-400 hover:text-indigo-600" aria-label="Rename folder"
                    ><Pencil size={12} /></button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete folder "${f.name}"? Codes stay in "All codes".`)) refresh(loadAllCodes(), deleteFolder(f.id), loadAssignments())
                      }}
                      className="rounded p-1 text-slate-400 hover:text-red-500" aria-label="Delete folder"
                    ><Trash2 size={12} /></button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Codes grid */}
        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
              <QrCode size={40} className="text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                {query ? 'No codes match your search.' : 'No QR codes yet. Create one from the generator.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c) => {
                const folderId = assignments[c.id]
                const folderName = folders.find(f => f.id === folderId)?.name
                return (
                  <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      {c.preview ? (
                        <img src={c.preview} alt="" className="h-16 w-16 rounded-xl border border-slate-100 object-contain" />
                      ) : (
                        <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><QrCode size={24} /></span>
                      )}
                      <div className="min-w-0 flex-1">
                        {editing === c.id ? (
                          <div className="flex gap-1.5">
                            <input
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && doRename(c.id)}
                              className="input py-1 text-sm"
                              autoFocus
                            />
                            <button onClick={() => doRename(c.id)} className="text-emerald-600" aria-label="Confirm rename"><Check size={16} /></button>
                            <button onClick={() => setEditing(null)} className="text-slate-400" aria-label="Cancel"><X size={16} /></button>
                          </div>
                        ) : (
                          <p className="truncate text-sm font-medium text-slate-800" title={c.title}>{c.title || c.type}</p>
                        )}
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          {c.type}
                          {c.isDynamic && <span className="rounded bg-violet-100 px-1 text-[10px] font-semibold text-violet-700">dynamic</span>}
                          {folderName && <span className="inline-flex items-center gap-0.5"><Folder size={11} />{folderName}</span>}
                        </p>
                        <p className="truncate text-[11px] text-slate-400" title={c.payload}>{c.payload}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                      <a href={c.preview || '#'} download={`${(c.title || c.type || 'qr').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium ${c.locked ? 'pointer-events-none opacity-40' : 'text-slate-600 hover:bg-slate-50'}`}><QrCode size={13} /> PNG</a>
                      <button onClick={() => { setEditing(c.id); setRenameValue(c.title || '') }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"><Pencil size={13} /> Rename</button>
                      <button onClick={() => refresh(duplicateCode(c.id, `${c.title} (copy)`))} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"><Copy size={13} /> Duplicate</button>
                      <button onClick={() => setMoving(moving === c.id ? null : c.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"><Folder size={13} /> Move</button>
                      <button
                        onClick={() => refresh(updateCode(c.id, { locked: !c.locked }))}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        title={c.locked ? 'Unlock design' : 'Lock design (prevent changes)'}
                      >
                        {c.locked ? <LockOpen size={13} /> : <Lock size={13} />} {c.locked ? 'Unlock' : 'Lock'}
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this QR code?')) refresh(deleteCode(c.id)) }}
                        className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 hover:bg-red-50 hover:text-red-500"
                      ><Trash2 size={13} /> Delete</button>
                    </div>

                    {moving === c.id && (
                      <div className="mt-2 rounded-xl bg-slate-50 p-2">
                        <p className="mb-1.5 text-[11px] font-medium text-slate-500">Move to folder:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <button onClick={() => { assignQrToFolder(c.id, null); refresh() }} className={`rounded-lg px-2 py-1 text-xs font-medium ${!folderId ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>All</button>
                          {folders.map(f => (
                            <button key={f.id} onClick={() => { assignQrToFolder(c.id, f.id); refresh() }} className={`rounded-lg px-2 py-1 text-xs font-medium ${folderId === f.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{f.name}</button>
                          ))}
                          <ArrowRight size={13} className="ml-auto self-center text-slate-300" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}