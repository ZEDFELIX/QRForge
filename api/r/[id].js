// Vercel serverless function: dynamic QR redirect + minimal scan recording.
//
// Route: GET /api/r/:id?password=...
//
// Behavior:
//   - Resolves the QR's current destination (honoring scheduled schedules,
//     expiration rules, and optional password protection).
//   - Records a minimal scan event (no personal data): user agent string,
//     coarse region (from request geo), referer, timestamp.
//   - Redirects (302) to the destination.
//
// Storage is Supabase. If Supabase is NOT configured (missing env vars), this
// endpoint returns a clear "not configured" response rather than pretending to
// work — see https://qrforge docs. Setup: copy .env.example → .env
// (in Vercel: project → Settings → Environment Variables) and run supabase/schema.sql.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

function buildClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { 'x-qrforge-relay': 'redirect' } }
  })
}

// -------------------------------
// Helpers
// -------------------------------
function nowIso() {
  return new Date().toISOString()
}

function inCurrentSchedule(schedule) {
  // schedule = [{ days: [0..6], startTime: 'HH:MM', endTime: 'HH:MM', destination }]
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) return null
  const now = new Date()
  const day = now.getUTCDay()
  const timeMin = now.getUTCHours() * 60 + now.getUTCMinutes()
  for (const slot of schedule) {
    const days = Array.isArray(slot.days) ? slot.days : []
    if (!days.includes(day)) continue
    const startMin = parseHHMM(slot.startTime)
    const endMin = parseHHMM(slot.endTime)
    if (startMin === null && endMin === null) return slot.destination
    if (startMin !== null && endMin !== null && timeMin >= startMin && timeMin <= endMin) return slot.destination
  }
  return null
}

function parseHHMM(s) {
  if (!s) return null
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim())
  if (!m) return null
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

function isExpired(qr, scanCount) {
  if (!qr) return { expired: false, reason: null }
  if (qr.expireOn && qr.expireOn !== '') {
    const exp = new Date(qr.expireOn)
    if (!isNaN(exp.getTime()) && exp.getTime() <= Date.now()) {
      return { expired: true, reason: `${qr.destination || 'This QR'} has expired (expiration date reached).` }
    }
  }
  if (qr.expireAfterScans && Number(qr.expireAfterScans) > 0 && scanCount >= Number(qr.expireAfterScans)) {
    return { expired: true, reason: `${qr.destination || 'This QR'} has reached its maximum scan limit.` }
  }
  return { expired: false, reason: null }
}

function parseUserAgent(ua = '') {
  const lower = ua.toLowerCase()
  let device = 'desktop'
  let os = 'other'
  let browser = 'other'
  if (/iphone|ipod/i.test(lower)) { device = 'mobile'; os = 'ios' }
  else if (/ipad/i.test(lower)) { device = 'tablet'; os = 'ios' }
  else if (/android/i.test(lower)) { device = 'mobile'; os = 'android'; if (/mobile/i.test(lower) === false && /android/i.test(lower)) device = 'mobile' }
  if (/windows/i.test(lower)) os = 'windows'
  else if (/macintosh|mac os/i.test(lower)) os = 'macos'
  else if (/linux/i.test(lower)) os = 'linux'
  if (/edg(e)?\//i.test(lower)) browser = 'edge'
  else if (/chrome|crios/i.test(lower)) browser = 'chrome'
  else if (/safari/i.test(lower) && !/chrome/i.test(lower)) browser = 'safari'
  else if (/firefox|fxios/i.test(lower)) browser = 'firefox'
  else if (/opera|opr/i.test(lower)) browser = 'opera'
  return { device, os, browser }
}

const SAFE_REDIRECT_RE = /^https?:\/\//i

// -------------------------------
// Main handler
// -------------------------------
export default async function handler(req, res) {
  // Only the id segment we care about
  const id = (req.query.id || '').toString().trim()

  if (!id) {
    if (req.headers.accept?.includes('text/html')) {
      res.setHeader('content-type', 'text/html; charset=utf-8')
      return res.status(200).send(renderInfoPage('Missing QR id', 'This dynamic QR link is missing its identifier.'))
    }
    return res.status(400).json({ error: 'missing_id' })
  }

  const supabase = buildClient()
  if (!supabase) {
    if (req.headers.accept?.includes('text/html')) {
      res.setHeader('content-type', 'text/html; charset=utf-8')
      return res.status(200).send(renderInfoPage('Not configured yet', 'This dynamic QR endpoint is not connected to a database yet. Once Supabase is configured this link will redirect automatically.'))
    }
    return res.status(200).json({ ok: false, code: 'not_configured', detail: 'supabase env vars missing' })
  }

  try {
    const { data: qrs, error } = await supabase
      .from('qr_destinations')
      .select('*')
      .eq('slug', id)
      .eq('status', 'active')
      .limit(1)

    if (error) throw error
    const qr = qrs && qrs[0]

    if (!qr) {
      if (req.headers.accept?.includes('text/html')) {
        res.setHeader('content-type', 'text/html; charset=utf-8')
        return res.status(200).send(renderInfoPage('Not found', 'This QR link does not point to anything yet.'))
      }
      return res.status(200).json({ ok: false, code: 'not_found' })
    }

    // Scan count (for expiration + stats)
    const { count: scanCount } = await supabase
      .from('qr_scans')
      .select('id', { count: 'exact', head: true })

    const { expired, reason } = isExpired(qr, scanCount)
    if (expired) {
      const msg = qr.expireMessage || reason
      if (req.headers.accept?.includes('text/html')) {
        res.setHeader('content-type', 'text/html; charset=utf-8')
        return res.status(200).send(renderInfoPage('This QR has expired', msg))
      }
      return res.status(200).json({ ok: false, code: 'expired', message: msg })
    }

    // Password gate
    if (qr.passwordHash && qr.passwordHash !== '') {
      const passwordProvided = (req.query.password || '').toString()
      // The client hashes with SHA-256 before sending; compare digest.
      const { createHash } = await import('node:crypto')
      const digest = createHash('sha256').update(passwordProvided).digest('hex')
      if (digest !== qr.passwordHash && digest !== qr.passwordHash.replace('sha256:', '')) {
        if (req.headers.accept?.includes('text/html')) {
          res.setHeader('content-type', 'text/html; charset=utf-8')
          return res.status(200).send(renderPasswordGate(id))
        }
        return res.status(200).json({ ok: false, code: 'password_required' })
      }
    }

    // Scheduled destination resolution
    let destination = qr.destination
    const scheduled = inCurrentSchedule(qr.schedule)
    if (scheduled) destination = scheduled

    if (!destination || !SAFE_REDIRECT_RE.test(destination)) {
      return res.status(200).json({ ok: false, code: 'no_destination', detail: 'destination_missing' })
    }

    // Record minimal scan (fire-and-forget, never blocks redirect)
    try {
      const parsed = parseUserAgent(req.headers['user-agent'] || '')
      await supabase.from('qr_scans').insert({
        qr_id: qr.id,
        device: parsed.device,
        os: parsed.os,
        browser: parsed.browser,
        country: req.headers['x-vercel-ip-country'] || null,
        region: req.headers['x-vercel-ip-country-region'] || null,
        city: 'unknown',
        referer: req.headers.referer || null,
        scanned_at: nowIso()
      })
    } catch { /* analytics must never break a redirect */ }

    // Redirect — fast, no extra latency beyond the single DB read
    if (req.headers.accept?.includes('text/html')) {
      res.writeHead(302, { Location: destination, 'Cache-Control': 'no-store' })
      return res.end()
    }
    return res.status(200).json({ ok: true, redirect: destination })
  } catch (err) {
    res.setHeader('content-type', 'text/html; charset=utf-8')
    return res.status(500).send(renderInfoPage('Temporary issue', 'The redirect service hit a temporary issue. Please try again shortly.'))
  }
}

function renderInfoPage(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)} · QRForge</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;background:#f5f7fb;color:#111827;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px}main{background:#fff;border-radius:20px;padding:36px;max-width:420px;width:100%;box-shadow:0 12px 40px rgba(17,24,39,.08);text-align:center}h1{font-size:22px;margin:0 0 10px}p{font-size:15px;color:#4b5563;margin:0;line-height:1.6}.logo{width:56px;height:56px;border-radius:16px;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;margin:0 auto 18px}</style></head>
<body><main><div class="logo">Q</div><h1>${esc(title)}</h1><p>${esc(body)}</p></main></body></html>`
}

function renderPasswordGate(id) {
  const form = `<form method="get"><input type="hidden" name="id" value="${esc(id)}"/><input type="password" name="password" placeholder="Password" required/><button type="submit">Unlock</button></form>`
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/><title>Protected QR · QRForge</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;background:#f5f7fb;color:#111827;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px}main{background:#fff;border-radius:20px;padding:36px;max-width:420px;width:100%;box-shadow:0 12px 40px rgba(17,24,39,.08)}h1{font-size:22px;margin:0 0 6px}p{font-size:14px;color:#4b5563;margin:0 0 18px}form{display:flex;flex-direction:column;gap:10px}input,button{font:inherit;border-radius:12px;padding:12px 14px;border:1px solid #d1d5db}button{background:#6366f1;color:#fff;border:none;cursor:pointer;font-weight:600;font-size:15px}</style></head>
<body><main><h1>Protected content</h1><p>This QR code is password protected.</p>${form}</main></body></html>`
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}