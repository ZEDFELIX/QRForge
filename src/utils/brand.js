// Brand kit: saved brand settings for landing pages and QR customization
const KEY = 'qrforge:brandkit:v1'

const DEFAULTS = {
  logo: null,
  primary: '#6366f1',
  secondary: '#e0e7ff',
  text: '#111827',
  background: '#ffffff',
  businessName: '',
  tagline: '',
  website: '',
  phone: '',
  email: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  youtube: '',
  linkedin: '',
  x: ''
}

export function loadBrandKit() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveBrandKit(brand) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...DEFAULTS, ...brand }))
  } catch { /* quota */ }
}

export function resetBrandKit() {
  saveBrandKit(DEFAULTS)
}

export function getBrandColors(brand) {
  return {
    primary: brand.primary || DEFAULTS.primary,
    secondary: brand.secondary || DEFAULTS.secondary,
    text: brand.text || DEFAULTS.text,
    background: brand.background || DEFAULTS.background
  }
}
