// Text landing page: embed text + design directly inside the QR's URL.
//
// A plain text QR shows raw text on a phone. Instead, we encode a URL like
//   <origin>/p/<base64url(JSON)>
// where the JSON holds the text content plus a small design config. Any phone
// that scans the code opens a nice, branded page rendered client-side from the
// data embedded in the URL — no hosting, no backend, works on every camera app.
//
// Honest limits: the payload grows with the text (base64 inflates ~4/3x), and a
// QR code can only reliably hold so much. We expose length thresholds so the UI
// can warn and cap long content.

const TAG = 'qftxt1'

export const TEXT_PAGE_WARN = 800   // above this: amber "getting long" note
export const TEXT_PAGE_HARD = 1500  // above this: validation error

export const DEFAULT_TEXT_PAGE = {
  accent: '#635bff',
  theme: 'light',
  big: false
}

const THEMES = ['light', 'gradient', 'dark']

const BASE_URL =
  (typeof window !== 'undefined' && window.location && window.location.origin) || ''

function isHexColor(input) {
  if (typeof input !== 'string') return false
  let v = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(v)) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
  return /^[0-9a-f]{6}$/i.test(v) ? '#' + v.toLowerCase() : false
}

export function b64urlEncode(str) {
  const raw = new TextEncoder().encode(str)
  let bin = ''
  for (const b of raw) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function b64urlDecode(data) {
  let s = String(data || '').replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  const bin = atob(s)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

export function textPageConfig(text, fields = {}) {
  const accent = isHexColor(fields.textPageAccent) || DEFAULT_TEXT_PAGE.accent
  return {
    text: String(text || ''),
    title: typeof fields.textPageTitle === 'string' ? fields.textPageTitle : '',
    accent,
    theme: THEMES.includes(fields.textPageTheme) ? fields.textPageTheme : DEFAULT_TEXT_PAGE.theme,
    big: Boolean(fields.textPageBig)
  }
}

export function textPageUrl(text, fields = {}) {
  const cfg = textPageConfig(text, fields)
  const payload = {
    v: TAG,
    t: cfg.text,
    c: { title: cfg.title, accent: cfg.accent, theme: cfg.theme, big: cfg.big }
  }
  return `${BASE_URL}/p/${b64urlEncode(JSON.stringify(payload))}`
}

// Returns a normalized page config, or null when the payload can't be decoded.
export function decodeTextPageParam(data) {
  try {
    const obj = JSON.parse(b64urlDecode(data))
    if (!obj || typeof obj.t !== 'string' || obj.t === '') return null
    const c = obj.c || {}
    return {
      text: obj.t,
      title: typeof c.title === 'string' ? c.title : '',
      accent: isHexColor(c.accent) || DEFAULT_TEXT_PAGE.accent,
      theme: THEMES.includes(c.theme) ? c.theme : DEFAULT_TEXT_PAGE.theme,
      big: Boolean(c.big)
    }
  } catch {
    return null
  }
}

/** Turn '#rrggbb' into an rgba() string with a given alpha. */
export function hexToRgba(hex, alpha) {
  const v = isHexColor(hex) || '#635bff'
  const n = parseInt(v.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}