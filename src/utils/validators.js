// Validation + normalization helpers. All rules are quiet-zone friendly and
// return either an error string or null (valid). Never throws.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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
    case 'text':
      return requireNonEmpty(fields?.text, 'Please enter some text or content.')
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
    default:
      return 'Select a QR type.'
  }
}