import QRCode from 'qrcode'
import { normalizeHex } from './validators.js'
import { textPageUrl } from './textPage.js'

const EC_DEFAULT = 'M'
const LOGO_EC = 'H'

const logoCache = new Map()

function loadLogoImage(dataUrl) {
  if (logoCache.has(dataUrl)) return logoCache.get(dataUrl)
  const promise = new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => {
      logoCache.delete(dataUrl)
      reject(new Error('Logo image could not be loaded.'))
    }
    img.src = dataUrl
  })
  logoCache.set(dataUrl, promise)
  return promise
}

export const QR_TYPES = [
  { id: 'url', label: 'URL', icon: 'Link' },
  { id: 'text', label: 'Plain Text', icon: 'Type' },
  { id: 'image', label: 'Image', icon: 'Image' },
  { id: 'phone', label: 'Phone', icon: 'Phone' },
  { id: 'email', label: 'Email', icon: 'Mail' },
  { id: 'sms', label: 'SMS', icon: 'MessageSquare' },
  { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi' },
  { id: 'contact', label: 'Contact', icon: 'User' },
  { id: 'location', label: 'Location', icon: 'MapPin' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { id: 'payment', label: 'Payment', icon: 'CreditCard' }
]

// Build the exact payload string that gets encoded into the QR matrix.
export function buildPayload(type, fields) {
  switch (type) {
    case 'url':
      return fields.url.trim()
    case 'text':
      return fields.textMode === 'page' ? textPageUrl(fields.text, fields) : fields.text
    case 'phone': {
      const digits = fields.phone.replace(/[^\d+]/g, '')
      return `tel:${digits}`
    }
    case 'email': {
      const q = []
      if (fields.emailSubject) q.push(`subject=${encodeURIComponent(fields.emailSubject)}`)
      if (fields.emailBody) q.push(`body=${encodeURIComponent(fields.emailBody)}`)
      const suffix = q.length ? `?${q.join('&')}` : ''
      return `mailto:${fields.email.trim()}${suffix}`
    }
    case 'sms': {
      const digits = fields.smsPhone.replace(/[^\d+]/g, '')
      const msg = fields.smsMessage ? `:${fields.smsMessage}` : ''
      return `SMSTO:${digits}${msg}`
    }
    case 'wifi': {
      const esc = (v) => v.replace(/([\\;,:"])/g, '\\$1').replace(/\r?\n/g, '')
      const sec = fields.wifiSecurity === 'none' ? 'nopass' : fields.wifiSecurity
      const parts = [`T:${sec}`, `S:${esc(fields.wifiSsid)}`]
      if (sec !== 'nopass') parts.push(`P:${esc(fields.wifiPassword)}`)
      if (fields.wifiHidden) parts.push('H:true')
      return `WIFI:${parts.join(';')};;`
    }
    case 'contact':
      return buildVCard(fields)
    case 'location':
      return `https://maps.google.com/maps?q=${String(fields.lat).trim()},${String(fields.lng).trim()}`
    case 'whatsapp': {
      const digits = (fields.whatsappNumber || '').replace(/[^\d]/g, '')
      const msg = fields.whatsappMessage ? `?text=${encodeURIComponent(fields.whatsappMessage)}` : ''
      return `https://wa.me/${digits}${msg}`
    }
    case 'payment': {
      // Encodes payment INSTRUCTIONS, never processes a payment.
      const parts = []
      if (fields.payBusinessName) parts.push(fields.payBusinessName)
      if (fields.payTillNumber) parts.push(`M-Pesa Till: ${fields.payTillNumber}`)
      if (fields.payBusinessNumber) parts.push(`M-Pesa Paybill: ${fields.payBusinessNumber}`)
      if (fields.payAccountNo) parts.push(`Account/Ref: ${fields.payAccountNo}`)
      if (fields.payInstructions) parts.push(fields.payInstructions)
      return parts.join('\n').trim()
    }
    case 'image': {
      if ((fields.imageMode || 'embed') === 'url') return (fields.imageUrl || '').trim()
      return fields.imageData || ''
    }
    default:
      return ''
  }
}

const vcardEsc = (v) => String(v || '')
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,')

function buildVCard(f) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  if (f.contactName) lines.push(`FN:${vcardEsc(f.contactName)}`)
  if (f.contactOrg) lines.push(`ORG:${vcardEsc(f.contactOrg)}`)
  const tel = (f.contactPhone || '').replace(/[^\d+]/g, '')
  if (tel) lines.push(`TEL:${tel}`)
  if (f.contactEmail) lines.push(`EMAIL:${f.contactEmail.trim()}`)
  if (f.contactWebsite) lines.push(`URL:${f.contactWebsite.trim()}`)
  if (f.contactAddress) lines.push(`ADR:;;${vcardEsc(f.contactAddress)};;;`)
  lines.push('END:VCARD')
  return lines.join('\n')
}

// Effectively effective error correction to apply given a logo.
export function effectiveEC(ec, hasLogo) {
  return hasLogo ? LOGO_EC : ec
}

function getMatrix(payload, errorCorrection) {
  const qr = QRCode.create(payload, { errorCorrectionLevel: errorCorrection })
  return { size: qr.modules.size, data: qr.modules.data }
}

// Draw a QR code onto a canvas. Pure browser drawing — sharp, standard margin,
// optional rounded modules, optional centered logo with white backing.
export function drawQr(canvas, payload, opts) {
  const { logoDataUrl = null } = opts || {}
  const logoImg = logoDataUrl && logoCache.has(logoDataUrl) ? logoCache.get(logoDataUrl) : null
  if (logoDataUrl && logoImg) {
    return drawQrCore(canvas, payload, opts, logoImg)
  }
  return drawQrCore(canvas, payload, opts, null)
}

// Async variant: waits for a (possibly not-yet-loaded) logo before drawing.
export async function loadLogoAsync(logoDataUrl) {
  if (!logoDataUrl) return null
  return loadLogoImage(logoDataUrl)
}

export async function drawQrAsync(canvas, payload, opts) {
  const { logoDataUrl = null } = opts || {}
  let logoImg = null
  if (logoDataUrl) {
    logoImg = await loadLogoImage(logoDataUrl)
  }
  return drawQrCore(canvas, payload, opts, logoImg)
}

function drawQrCore(canvas, payload, opts, logoImg) {
  const {
    fg = '#111827',
    bg = '#ffffff',
    size = 512,
    margin = 4,
    errorCorrection = EC_DEFAULT,
    rounded = false,
    logoDataUrl = null,
    logoRatio = 0.2,
    frameLabel = '',
    frameLabelColor = '#ffffff',
    ctaText = '',
    ctaBg = '#111827',
    ctaColor = '#ffffff'
  } = opts || {}

  const fgHex = normalizeHex(fg) || '#111827'
  const bgHex = normalizeHex(bg) || '#ffffff'

  const { size: n, data } = getMatrix(payload, errorCorrection)
  const mod = Math.max(1, Math.floor(size / (n + 2 * margin)))
  const area = mod * (n + 2 * margin)
  const qx = Math.floor((size - area) / 2)

  // Frames/CTA bands live OUTSIDE the QR's own quiet zone:
  // the QR square (size × size) stays scannable; the canvas is taller.
  const hasFrame = Boolean(frameLabel && String(frameLabel).trim())
  const hasCta = Boolean(ctaText && String(ctaText).trim())
  const frameH = hasFrame ? Math.max(28, Math.round(size * 0.16)) : 0
  const ctaH = hasCta ? Math.max(24, Math.round(size * 0.11)) : 0
  canvas.width = size
  canvas.height = size + frameH + ctaH

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = bgHex
  ctx.fillRect(0, 0, size, canvas.height)

  const qy = frameH

  // Top frame banner ("SCAN ME" etc.)
  if (hasFrame) {
    ctx.fillStyle = frameLabelColor === 'auto' ? fgHex : normalizeHex(frameLabelColor) || fgHex
    ctx.fillRect(0, 0, size, frameH)
    ctx.fillStyle = '#ffffff'
    ctx.font = `800 ${Math.round(frameH * 0.5)}px system-ui, -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(frameLabel).trim().toUpperCase(), size / 2, frameH / 2 + 2)
  }

  // QR modules
  const canRound = rounded && typeof ctx.roundRect === 'function' && mod >= 4
  ctx.fillStyle = fgHex
  ctx.beginPath()
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (data[r * n + c] !== 0) {
        const x = qx + (c + margin) * mod
        const y = qy + (r + margin) * mod
        if (canRound) {
          const rad = Math.round(mod * 0.35)
          ctx.roundRect(x, y, mod, mod, rad)
        } else {
          ctx.rect(x, y, mod, mod)
        }
      }
    }
  }
  ctx.fill()

  if (logoDataUrl && logoImg) drawLogo(ctx, canvas, logoImg, logoRatio, size, qy)

  // CTA band ("Scan to Order" etc.)
  if (hasCta) {
    const y = size + frameH
    ctx.fillStyle = normalizeHex(ctaBg) || bgHex
    ctx.fillRect(0, y, size, ctaH)
    const dot = (0.47 * ctaH)
    ctx.font = `700 ${Math.round(ctaH * 0.42)}px system-ui, -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = normalizeHex(ctaColor) || (normalizeHex(ctaBg) || fgHex)
    ctx.fillText(String(ctaText).trim(), size / 2, y + ctaH / 2 + 2)
  }

  return { matrixSize: n, ratios: [fgHex, bgHex] }
}

function drawLogo(ctx, canvas, img, logoRatio, size, qy = 0) {
  const box = Math.round(size * logoRatio)
  const padding = Math.max(4, Math.round(box * 0.09))
  const x = (size - box) / 2
  const y = qy + (size - box) / 2

  // white backing
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x - padding, y - padding, box + padding * 2, box + padding * 2, Math.round(padding * 1.6))
  } else {
    ctx.rect(x - padding, y - padding, box + padding * 2, box + padding * 2)
  }
  ctx.fill()

  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const scale = Math.min(box / iw, box / ih)
  const dw = Math.floor(iw * scale)
  const dh = Math.floor(ih * scale)
  ctx.drawImage(img, (size - dw) / 2, y + (size - dh) / 2, dw, dh)
}

// Build an SVG string for download (vector, crisp, with optional embedded logo).
export function qrToSvg(payload, opts) {
  const {
    fg = '#111827',
    bg = '#ffffff',
    margin = 4,
    errorCorrection = EC_DEFAULT,
    rounded = false,
    logoDataUrl = null,
    logoRatio = 0.2,
    frameLabel = '',
    frameLabelColor = '#ffffff',
    ctaText = '',
    ctaBg = '#111827',
    ctaColor = '#ffffff'
  } = opts || {}
  const fgHex = normalizeHex(fg) || '#111827'
  const bgHex = normalizeHex(bg) || '#ffffff'
  const { size: n, data } = getMatrix(payload, errorCorrection)
  const total = n + 2 * margin
  const hasFrame = Boolean(frameLabel && String(frameLabel).trim())
  const hasCta = Boolean(ctaText && String(ctaText).trim())
  const frameH = hasFrame ? Math.max(4, Math.round(total * 0.16)) : 0
  const ctaH = hasCta ? Math.max(3, Math.round(total * 0.11)) : 0
  const height = total + frameH + ctaH
  const cells = []
  const radius = rounded ? 0.32 : 0
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (data[r * n + c] !== 0) {
        cells.push(
          `<rect x="${c + margin}" y="${frameH + r + margin}" width="1" height="1" rx="${radius}" ry="${radius}"/>`
        )
      }
    }
  }
  let logo = ''
  if (logoDataUrl) {
    const box = total * logoRatio
    const pad = box * 0.09
    const x = (total - box) / 2
    const y = frameH + (total - box) / 2
    logo = `<rect x="${x - pad}" y="${y - pad}" width="${box + pad * 2}" height="${box + pad * 2}" fill="#ffffff" rx="${pad * 1.6}"/>` +
      `<image x="${x}" y="${y}" width="${box}" height="${box}" preserveAspectRatio="xMidYMid meet" href="${logoDataUrl}"/>`
  }
  const frameSvg = hasFrame
    ? `<rect width="${total}" height="${frameH}" fill="${frameLabelColor === 'auto' ? fgHex : normalizeHex(frameLabelColor) || fgHex}"/>` +
      `<text x="${total / 2}" y="${frameH / 2}" fill="#ffffff" font-size="${Math.round(frameH * 0.5)}" font-weight="800" text-anchor="middle" dominant-baseline="middle" style="font-family:system-ui,-apple-system,sans-serif">${escapeSvg(String(frameLabel).trim().toUpperCase())}</text>`
    : ''
  const ctaSvg = hasCta
    ? `<rect x="0" y="${total + frameH}" width="${total}" height="${ctaH}" fill="${normalizeHex(ctaBg) || bgHex}"/>` +
      `<text x="${total / 2}" y="${total + frameH + ctaH / 2}" fill="${normalizeHex(ctaColor) || (normalizeHex(ctaBg) || fgHex)}" font-size="${Math.round(ctaH * 0.42)}" font-weight="700" text-anchor="middle" dominant-baseline="middle" style="font-family:system-ui,-apple-system,sans-serif">${escapeSvg(String(ctaText).trim())}</text>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${height}" width="${total}" height="${height}" shape-rendering="${rounded ? 'geometricPrecision' : 'crispEdges'}" font-family="sans-serif">` +
    `<rect width="${total}" height="${height}" fill="${bgHex}"/>` +
    frameSvg +
    `<g fill="${fgHex}">${cells.join('')}</g>${logo}${ctaSvg}` +
    `</svg>`
}

function escapeSvg(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Compute WCAG-ish contrast ratio between two hex colors.
export function contrastRatio(a, b) {
  const lum = (hex) => {
    const h = normalizeHex(hex) || '#000000'
    const vals = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    const lin = vals.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
  }
  const l1 = lum(a)
  const l2 = lum(b)
  const hi = Math.max(l1, l2)
  const lo = Math.min(l1, l2)
  return (hi + 0.05) / (lo + 0.05)
}