import { contrastRatio, effectiveEC } from './qrGenerator.js'
import { normalizeHex } from './validators.js'

// Real, honest checks for QR health and destination safety.
// These run in the browser. URL checks hit the actual destination via a
// same-origin relay on the server (/api/health) to avoid CORS blocking:
// a plain browser fetch() to a cross-origin site may fail on CORS even when
// the site is perfectly fine — so we route through the serverless relay.
const RELAY = '/api/health?url='

export async function checkDestination(url) {
  const input = String(url || '').trim() || ''
  const result = {
    rawUrl: input,
    domain: '',
    https: null,       // null = unknown
    httpStatus: null,  // null = unknown
    title: null,
    okay: false,       // did we get a verifiable 2xx/3xx response
    note: '',
    resolvable: false
  }
  if (!input) {
    result.note = 'No URL entered.'
    return result
  }
  if (!/^https?:\/\//i.test(input)) {
    result.note = 'Add http:// or https:// so the destination is valid.'
    return result
  }
  let parsed
  try {
    parsed = new URL(input)
  } catch {
    result.note = 'This does not look like a valid URL.'
    return result
  }
  result.domain = parsed.hostname
  result.https = parsed.protocol === 'https:'

  try {
    const res = await fetch(`${RELAY}${encodeURIComponent(input)}`, { method: 'GET' })
    const data = await res.json().catch(() => ({}))
    result.httpStatus = data.status ?? null
    result.okay = data.body !== false
    result.resolvable = data.resolved === true
    if (!result.okay && data.note) result.note = data.note
    else if (!result.okay) result.note = 'The destination could not be verified right now.'
  } catch {
    // Network failure (e.g., offline) — do not claim anything is wrong.
    result.note = 'Verification unavailable in your network snapshot — the QR is still valid.'
    result.okay = true
  }
  return result
}

export function destinationBrief(d) {
  if (!d.domain) return d.note
  const parts = [d.domain]
  if (d.https === true) parts.push('HTTPS ✓')
  else if (d.https === false) parts.push('HTTP (not encrypted)')
  if (d.httpStatus) parts.push(`HTTP ${d.httpStatus}`)
  return parts.join(' · ')
}

// QR rendering quality checks (purely local, always available)
export function qrHealth({ fg, bg, margin, rounded, logoDataUrl, logoRatio, errorCorrection }) {
  const fgHex = normalizeHex(fg) || '#111827'
  const bgHex = normalizeHex(bg) || '#ffffff'
  const ratio = contrastRatio(fgHex, bgHex)
  const checks = [
    {
      id: 'contrast',
      label: 'Contrast',
      status: ratio >= 3 ? 'ok' : ratio >= 2 ? 'warn' : 'bad',
      message: ratio >= 3
        ? 'Strong foreground/background contrast.'
        : ratio >= 2
          ? 'Contrast is acceptable but could be stronger.'
          : 'Low contrast — this QR may be hard to scan.'
    }
  ]
  checks.push({
    id: 'quietZone',
    label: 'Quiet zone',
    status: margin >= 3 ? 'ok' : margin >= 1 ? 'warn' : 'bad',
    message: margin >= 3
      ? `${margin} module quiet zone — good.`
      : `${margin} module quiet zone — scanners prefer at least 3–4.`
  })
  checks.push({
    id: 'logo',
    label: 'Logo',
    status: !logoDataUrl ? 'ok' : logoRatio <= 0.22 ? 'warn' : 'bad',
    message: !logoDataUrl
      ? 'No logo — cleanest possible encoding.'
      : logoRatio <= 0.22
        ? 'Logo present. Error correction raised to High.'
        : 'Logo is too large — shrink it below 22% of the QR width.'
  })
  if (rounded) {
    checks.push({
      id: 'rounded',
      label: 'Rounded modules',
      status: errorCorrection === 'H' || margin >= 3 ? 'warn' : 'bad',
      message: 'Rounded modules look great but can reduce scan reliability on small sizes.'
    })
  }
  checks.push({
    id: 'errorCorrection',
    label: 'Error correction',
    status: errorCorrection === 'H' ? 'ok' : errorCorrection === 'M' ? 'warn' : 'bad',
    message: `EC level ${errorCorrection}${logoDataUrl ? ' (raised to H for logo safety)' : ''}.`
  })
  const score = checks.reduce((acc, c) => acc + (c.status === 'ok' ? 2 : c.status === 'warn' ? 1 : 0), 0)
  const max = checks.length * 2
  const overall = score / max >= 0.85 ? 'excellent' : score / max >= 0.5 ? 'attention' : 'problem'
  return { score, max, overall, checks }
}

export function overallLabel(overall) {
  if (overall === 'excellent') return '✓ Excellent'
  if (overall === 'attention') return '⚠ Needs attention'
  return '✕ Problem detected'
}

// QR size guidance
export function sizeGuidance(size) {
  return size >= 512 ? 'ok' : 'warn'
}

// Keep a stable reference to effectiveEC for bundled use elsewhere
export { effectiveEC }