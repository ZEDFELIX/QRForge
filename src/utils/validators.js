// Validation + normalization helpers. All rules are quiet-zone friendly and
// return either an error string or null (valid). Never throws.

import { textPageUrl, TEXT_PAGE_HARD } from './textPage.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidHex(input) {
  return Boolean(normalizeHex(input))
}

export function normalizeHex(input) {
  if (typeof input !== 'string') return null
  let v = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(v)) {
    v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
  }
  return /^[0-9a-f]{6}$/i.test(v) ? '#' + v.toLowerCase() : null
}

function isHttpUrl(s) {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function normalizeUrl(input) {
  const s = (input || '').trim()
  if (!s) return ''
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return s
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s
  return 'https://' + s
}

function requireNonEmpty(v, msg) {
  if (!v || !String(v).trim()) return msg
  return null
}

export function validateType(type, fields) {
  switch (type) {
    case 'url': {
      const u = normalizeUrl(fields?.url)
      if (!u) return 'Please enter a URL.'
      if (!isHttpUrl(u)) return 'Please enter a valid URL (e.g., https://example.com).'
      return null
    }
    case 'text': {
      const missing = requireNonEmpty(fields?.text, 'Please enter some text or content.')
      if (missing) return missing
      if (fields?.textMode === 'page') {
        const len = textPageUrl(fields.text, fields).length
        if (len > TEXT_PAGE_HARD)
          return `That text makes a ${len}-character QR code, which is too long to scan reliably. Keep the total under ${TEXT_PAGE_HARD} characters, or switch to plain text.`
      }
      return null
    }
    case 'phone': {
      const digits = (fields?.phone || '').replace(/[^\d+]/g, '')
      if (!digits) return 'Please enter a phone number.'
      if (digits.replace('+', '').length < 3) return 'That phone number looks too short. Add the full number.'
      return null
    }
    case 'email': {
      const e = (fields?.email || '').trim()
      if (!e) return 'Please enter an email address.'
      if (!EMAIL_RE.test(e)) return 'Please enter a valid email address.'
      return null
    }
    case 'sms': {
      const digits = (fields?.smsPhone || '').replace(/[^\d+]/g, '')
      if (!digits) return 'Please enter a phone number for the SMS.'
      if (digits.replace('+', '').length < 3) return 'That phone number looks too short.'
      return null
    }
    case 'wifi': {
      if (!fields?.wifiSsid || !String(fields.wifiSsid).trim())
        return 'Please enter the Wi-Fi network name (SSID).'
      return null
    }
    case 'contact': {
      const any =
        (fields?.contactName || '').trim() ||
        (fields?.contactPhone || '').trim() ||
        (fields?.contactEmail || '').trim()
      if (!any) return 'Add at least a name, phone or email for the contact.'
      if (fields?.contactEmail) {
        const e = fields.contactEmail.trim()
        if (e && !EMAIL_RE.test(e)) return 'Contact email is not valid.'
      }
      return null
    }
    case 'location': {
      const lat = Number(fields?.lat)
      const lng = Number(fields?.lng)
      if (fields?.lat === '' || fields?.lat == null || Number.isNaN(lat))
        return 'Please enter a latitude.'
      if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90.'
      if (fields?.lng === '' || fields?.lng == null || Number.isNaN(lng))
        return 'Please enter a longitude.'
      if (lng < -180 || lng > 180) return 'Longitude must be between -180 and 180.'
      return null
    }
    case 'whatsapp': {
      const digits = ((fields?.whatsappNumber || '').replace(/[^\d]/g, ''))
      if (!digits) return 'Please enter a WhatsApp phone number.'
      if (digits.length < 6) return 'That WhatsApp number looks too short.'
      return null
    }
    case 'payment': {
      const any =
        (fields?.payTillNumber || '').trim() ||
        (fields?.payBusinessNumber || '').trim() ||
        (fields?.payAccountNo || '').trim() ||
        (fields?.payInstructions || '').trim()
      if (!any) return 'Add at least one payment detail (Till, Paybill, account or instructions).'
      return null
    }
    case 'image': {
      if ((fields?.imageMode || 'embed') === 'url') {
        const u = normalizeUrl(fields?.imageUrl)
        if (!u) return 'Enter the image URL.'
        if (!isHttpUrl(u)) return 'Enter a valid image URL (https://…).'
        return null
      }
      if (!fields?.imageData) return 'Upload an image to embed.'
      if ((fields?.imageData || '').length > 2400)
        return 'That embedded image is too large to scan reliably. Try a smaller image.'
      return null
    }
    default:
      return 'Select a QR type.'
  }
}