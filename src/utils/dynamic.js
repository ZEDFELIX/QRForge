// Dynamic QR helper: builds the redirect URL the QR encodes.
//
// Architecture: a dynamic QR encodes a link under this same domain
// (/api/r/:slug). The serverless redirect endpoint resolves the current
// destination, records a minimal scan, respects schedules/expiration/password,
// and redirects. When the user edits the destination, the QR image is unchanged.
//
// This module is the client-side contract + the honest "is it configured?"
// check. It does NOT pretend dynamic works when the backend isn't set up.

import { createClient } from '@supabase/supabase-js'

export const BASE_URL = (() => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin
  }
  return 'https://qrforge-peach.vercel.app'
})()

export function localSupabaseConfig() {
  try {
    const raw = localStorage.getItem('qrforge:supabase:v1')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.url && parsed.key) return { url: parsed.url, key: parsed.key }
    return null
  } catch { return null }
}

export function isBackendConfigured() {
  return Boolean(
    (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
    localSupabaseConfig()
  )
}

export function supabaseClient() {
  const local = typeof window !== 'undefined' ? localSupabaseConfig() : null
  const url = local?.url || import.meta.env.VITE_SUPABASE_URL || ''
  const key = local?.key || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  if (!url || !key) return null
  return createClient(url, key)
}

// Build the short link from a slug.
export function dynamicUrl(slug) {
  const clean = String(slug || '').replace(/[^a-zA-Z0-9_-]/g, '')
  return `${BASE_URL}/api/r/${clean}`
}

// Generate a short random slug (6 chars).
export function makeSlug(length = 6) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : null
  for (let i = 0; i < length; i++) {
    const idx = cryptoObj ? cryptoObj.getRandomValues(new Uint8Array(1))[0] % alphabet.length : Math.floor(Math.random() * alphabet.length)
    out += alphabet[idx]
  }
  return out
}

// SHA-256 of a password (client-side). The server stores only the digest.
export async function hashPassword(password) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Secure crypto not available in this browser.')
  }
  const data = new TextEncoder().encode(`qrforge::${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Days-of-week helper for schedules.
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Build a scan metrics query key so Analytics can share the same shape.
export function emptyMetrics() {
  return {
    totalScans: 0,
    uniqueScans: 0,
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    byDate: [],
    byDevice: {},
    byOS: {},
    byBrowser: {},
    byCountry: {},
    byReferer: {}
  }
}