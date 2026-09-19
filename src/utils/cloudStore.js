// Cloud backup for saved QR codes — via Supabase Storage.
// Every saved QR record (type, payload, design, timestamps, download count) is
// stored as a JSON file in a Supabase Storage bucket:
//   qrs/<deviceId>/<codeId>.json
// Records persist in *your* Supabase project until you delete them (or remove
// the bucket) — not tied to one browser. localStorage stays the fast offline
// cache; the cloud is the durable copy. Everything degrades gracefully: when
// Supabase isn't configured (or the bucket is unreachable) the app keeps
// working locally. No function in this module throws.

// supabase-js is lazy-imported so the main bundle stays small; cloud sync only
// needs the library when it's actually used.

// Keep in sync with folders.js (QR_KEY). Duplicated to avoid an import cycle.
const CODES_STORAGE_KEY = 'qrforge:codes:v2'
const LOCAL_LIMIT = 200

const DEFAULT_BUCKET = 'qrforge-codes'
const STATUS_KEY = 'qrforge:cloudstatus:v1'
const DEVICE_KEY = 'qrforge:device:v1'
const PROBE_TTL = 60_000

export function bucketName() {
  try {
    const raw = localStorage.getItem('qrforge:bucket:v1')
    if (raw && raw.trim()) return raw.trim()
  } catch { /* ignore */ }
  return import.meta.env.VITE_SUPABASE_BUCKET || DEFAULT_BUCKET
}

// Same credentials hierarchy as dynamic.js, without importing supabase-js.
function localConfig() {
  try {
    const raw = localStorage.getItem('qrforge:supabase:v1')
    if (raw) {
      const p = JSON.parse(raw)
      if (p && p.url && p.key) return { url: p.url, key: p.key }
    }
  } catch { /* ignore */ }
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return { url: import.meta.env.VITE_SUPABASE_URL, key: import.meta.env.VITE_SUPABASE_ANON_KEY }
  }
  return null
}

export function isCloudEnabled() {
  return Boolean(localConfig())
}

let cachedCreate = null
async function getClient() {
  const cfg = localConfig()
  if (!cfg) return null
  try {
    if (!cachedCreate) {
      const mod = await import('@supabase/supabase-js')
      cachedCreate = mod.createClient
    }
    return cachedCreate(cfg.url, cfg.key)
  } catch {
    return null
  }
}

function deviceKey() {
  try {
    let k = localStorage.getItem(DEVICE_KEY)
    if (!k) {
      const rand =
        typeof crypto !== 'undefined' && crypto.getRandomValues
          ? Array.from(crypto.getRandomValues(new Uint8Array(8)))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('')
          : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      localStorage.setItem(DEVICE_KEY, rand)
      k = rand
    }
    return k
  } catch {
    return `dev_${Date.now()}`
  }
}

const basePath = () => `qrs/${deviceKey()}`

// Status used across the UI. Cheap probe cached briefly so we don't hammer the
// backend on every render. Always resolves to { enabled, ok, message, ... }.
export async function cloudStatus(force = false) {
  if (!isCloudEnabled()) {
    return { enabled: false, ok: false, message: 'Codes are kept on this device only.' }
  }
  if (!force) {
    try {
      const raw = localStorage.getItem(STATUS_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (s && typeof s.ok === 'boolean' && Date.now() - (s.at || 0) < PROBE_TTL) return s
      }
    } catch { /* ignore */ }
  }
  return refreshCloudStatus()
}

export async function refreshCloudStatus() {
  const sb = await getClient()
  if (!sb) {
    return { enabled: false, ok: false, message: 'Codes are kept on this device only.' }
  }
  const bucket = bucketName()
  let status
  try {
    const { error } = await sb.storage.from(bucket).list(basePath(), { limit: 1 })
    status = error
      ? {
          enabled: true,
          ok: false,
          bucket,
          message: `Supabase is connected, but the "${bucket}" bucket is not reachable for this key. Create it (and check the bucket name in Settings) to enable cloud backup.`
        }
      : {
          enabled: true,
          ok: true,
          bucket,
          message: 'Backed up to Supabase Storage - codes persist until you delete them.'
        }
  } catch {
    status = {
      enabled: true,
      ok: false,
      bucket,
      message: 'Could not reach Supabase Storage right now. Your codes still work locally.'
    }
  }
  status.at = Date.now()
  try { localStorage.setItem(STATUS_KEY, JSON.stringify(status)) } catch { /* ignore */ }
  return status
}

// Upload / upsert a single code record.
export async function pushCloudCode(code) {
  if (!isCloudEnabled() || !code || !code.id) return null
  const sb = await getClient()
  if (!sb) return null
  try {
    const path = `${basePath()}/${code.id}.json`
    const blob = new Blob([JSON.stringify(code)], { type: 'application/json' })
    const { error } = await sb.storage
      .from(bucketName())
      .upload(path, blob, { upsert: true, contentType: 'application/json' })
    return error ? null : path
  } catch {
    return null
  }
}

export async function deleteCloudCode(id) {
  if (!isCloudEnabled() || !id) return
  const sb = await getClient()
  if (!sb) return
  try {
    await sb.storage.from(bucketName()).remove([`${basePath()}/${id}.json`])
  } catch { /* ignore */ }
}

export async function clearCloudCodes() {
  if (!isCloudEnabled()) return 0
  const sb = await getClient()
  if (!sb) return 0
  try {
    const { data } = await sb.storage.from(bucketName()).list(basePath())
    const paths = (data || []).map((f) => `${basePath()}/${f.name}`)
    if (paths.length) {
      const r = await sb.storage.from(bucketName()).remove(paths)
      return r.error ? 0 : paths.length
    }
    return 0
  } catch {
    return 0
  }
}

export async function pushAllToCloud() {
  if (!isCloudEnabled()) return 0
  const sb = await getClient()
  if (!sb) return 0
  let codes = []
  try {
    codes = JSON.parse(localStorage.getItem(CODES_STORAGE_KEY) || '[]')
  } catch { /* ignore */ }
  if (!Array.isArray(codes)) codes = []
  let n = 0
  for (const c of codes) {
    if (!c || !c.id) continue
    try {
      const path = `${basePath()}/${c.id}.json`
      const blob = new Blob([JSON.stringify(c)], { type: 'application/json' })
      const { error } = await sb.storage
        .from(bucketName())
        .upload(path, blob, { upsert: true, contentType: 'application/json' })
      if (!error) n++
    } catch { /* ignore */ }
  }
  return n
}

// Pull every cloud record for this device and merge into the local cache.
// Returns the merged list, or null when cloud isn't usable.
export async function syncFromCloud() {
  if (!isCloudEnabled()) return null
  const sb = await getClient()
  if (!sb) return null
  const bucket = bucketName()

  let files = []
  try {
    const { data, error } = await sb.storage.from(bucket).list(basePath(), { limit: 500 })
    if (error || !data) return null
    files = data.filter((f) => f.name && f.name.endsWith('.json'))
  } catch {
    return null
  }
  if (!files.length) return null

  const cloud = []
  for (const f of files) {
    try {
      const r = await sb.storage.from(bucket).download(`${basePath()}/${f.name}`)
      if (r.error || !r.data) continue
      const obj = JSON.parse(await r.data.text())
      if (obj && obj.id) cloud.push(obj)
    } catch { /* ignore */ }
  }
  return mergeCloud(cloud)
}

function mergeCloud(cloud) {
  let local = []
  try {
    local = JSON.parse(localStorage.getItem(CODES_STORAGE_KEY) || '[]')
  } catch { /* ignore */ }
  if (!Array.isArray(local)) local = []

  const map = new Map()
  for (const c of local) if (c && c.id) map.set(c.id, c)
  for (const c of cloud) {
    if (!c || !c.id) continue
    const existing = map.get(c.id)
    if (!existing) {
      map.set(c.id, c)
      continue
    }
    const localTs = new Date(existing.updatedAt || existing.createdAt || 0).getTime() || 0
    const cloudTs = new Date(c.updatedAt || c.createdAt || 0).getTime() || 0
    if (cloudTs > localTs) map.set(c.id, c)
    else if (cloudTs === localTs) {
      // Prefer whichever has logged more downloads (e.g. counter bumped on
      // another device without a timestamp change).
      map.set(c.id, (existing.downloads || 0) >= (c.downloads || 0) ? existing : c)
    }
  }
  const merged = [...map.values()].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  )
  try {
    localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(merged.slice(0, LOCAL_LIMIT)))
  } catch { /* ignore */ }
  return merged
}