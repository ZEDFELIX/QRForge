// Folders: organize QR codes into folders + search
import { pushCloudCode, deleteCloudCode, clearCloudCodes } from './cloudStore.js'

const FOLDERS_KEY = 'qrforge:folders:v1'

export function loadFolders() {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function saveFolders(list) {
  try { localStorage.setItem(FOLDERS_KEY, JSON.stringify(list)) } catch { /* quota */ }
}

export function createFolder(name) {
  const folders = loadFolders()
  const folder = { id: `f_${Date.now()}`, name, createdAt: new Date().toISOString() }
  folders.push(folder)
  saveFolders(folders)
  return folders
}

export function renameFolder(id, name) {
  const folders = loadFolders().map(f => f.id === id ? { ...f, name } : f)
  saveFolders(folders)
  return folders
}

export function deleteFolder(id) {
  const folders = loadFolders().filter(f => f.id !== id)
  saveFolders(folders)
  return folders
}

// QR-to-folder assignment stored separately
const ASSIGN_KEY = 'qrforge:qr_folders:v1'

export function loadAssignments() {
  try {
    const raw = localStorage.getItem(ASSIGN_KEY)
    const obj = raw ? JSON.parse(raw) : {}
    return typeof obj === 'object' && obj !== null ? obj : {}
  } catch { return {} }
}

export function assignQrToFolder(qrId, folderId) {
  const assignments = loadAssignments()
  if (folderId === null) delete assignments[qrId]
  else assignments[qrId] = folderId
  try { localStorage.setItem(ASSIGN_KEY, JSON.stringify(assignments)) } catch { /* quota */ }
  return assignments
}

// Enhanced QR storage (extends history with folders, search, rename, etc.)
const QR_KEY = 'qrforge:codes:v2'
const QR_LIMIT = 200

export function loadAllCodes() {
  try {
    const raw = localStorage.getItem(QR_KEY)
    if (!raw) return migrateFromHistory()
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function saveCode(entry) {
  const all = loadAllCodes()
  let saved
  const existing = all.findIndex(e => e.id === entry.id)
  if (existing >= 0) {
    saved = { ...all[existing], ...entry }
    all[existing] = saved
  } else {
    saved = { id: `qr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...entry, createdAt: new Date().toISOString() }
    all.unshift(saved)
  }
  persistCodes(all)
  void pushCloudCode(saved)
  return all
}

export function updateCode(id, updates) {
  let updated = null
  const all = loadAllCodes().map(e => {
    if (e.id !== id) return e
    updated = { ...e, ...updates, updatedAt: new Date().toISOString() }
    return updated
  })
  persistCodes(all)
  if (updated) void pushCloudCode(updated)
  return all
}

export function deleteCode(id) {
  const all = loadAllCodes().filter(e => e.id !== id)
  persistCodes(all)
  void deleteCloudCode(id)
  return all
}

export function duplicateCode(id, newName) {
  const all = loadAllCodes()
  const original = all.find(e => e.id === id)
  if (!original) return all
  const copy = { ...original, id: `qr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, title: newName || `${original.title} (copy)`, createdAt: new Date().toISOString(), locked: false }
  all.unshift(copy)
  persistCodes(all)
  void pushCloudCode(copy)
  return all
}

// Increment a local "times downloaded / copied" counter on a saved QR code.
export function incrementDownload(payload) {
  const matchPayload = String(payload || '')
  if (!matchPayload) return 0
  const all = loadAllCodes()
  const target = all.findIndex(e => String(e.payload || '') === matchPayload)
  if (target < 0) return 0
  const next = all[target].downloads || 0
  all[target] = { ...all[target], downloads: next + 1 }
  persistCodes(all)
  void pushCloudCode(all[target])
  return next + 1
}

export function searchCodes(query, folderId) {
  let codes = loadAllCodes()
  if (folderId) {
    const assignments = loadAssignments()
    codes = codes.filter(c => assignments[c.id] === folderId)
  }
  if (!query) return codes
  const q = query.toLowerCase()
  return codes.filter(c =>
    (c.title || '').toLowerCase().includes(q) ||
    (c.payload || '').toLowerCase().includes(q) ||
    (c.type || '').toLowerCase().includes(q) ||
    (c.folderName || '').toLowerCase().includes(q)
  )
}

// Migrate from old history format
function migrateFromHistory() {
  try {
    const raw = localStorage.getItem('qrforge:history:v1')
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    const migrated = arr.map(e => ({
      ...e,
      id: e.id || `qr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      locked: false,
      folderId: null
    }))
    persistCodes(migrated)
    return migrated
  } catch { return [] }
}

export function clearCodes() {
  try { localStorage.removeItem(QR_KEY) } catch { /* ignore */ }
  try { localStorage.removeItem('qrforge:history:v1') } catch { /* ignore */ }
  void clearCloudCodes()
  return []
}

function persistCodes(list) {
  const trimmed = list.slice(0, QR_LIMIT)
  try { localStorage.setItem(QR_KEY, JSON.stringify(trimmed)) } catch {
    let copy = trimmed
    while (copy.length > 0) {
      try { localStorage.setItem(QR_KEY, JSON.stringify(copy)); break }
      catch { copy = copy.slice(1) }
    }
  }
}
