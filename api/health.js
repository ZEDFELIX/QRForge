// Vercel serverless function: relay for QR destination health checks.
// Browser → /api/health?url=<encoded> → fetches the URL server-side (avoids
// CORS blockers) → returns { status, resolved, body } where `body !== false`
// means we got a verifiable response. It never follows redirect automatically
// so the browser can report the actual first-hop status.

export default async function handler(req, res) {
  const { url } = req.query
  if (!url) return res.status(400).json({ status: null, resolved: false, body: false, note: 'no url provided' })

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return res.status(200).json({ status: null, resolved: false, body: false, note: 'invalid url' })
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.status(200).json({ status: null, resolved: false, body: false, note: 'unsupported protocol' })
  }

  // SSRF guard: never allow localhost/private ranges in checks
  const host = parsed.hostname.toLowerCase()
  if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(host) || host.endsWith('.local') || host.startsWith('10.') || host.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
    return res.status(200).json({ status: null, resolved: false, body: false, note: 'local/private address — skipped' })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const resp = await fetch(url, {
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'user-agent': 'QRForgeHealthCheck/1.0' },
      method: 'GET'
    })
    clearTimeout(timer)
    let title = null
    if (resp.status >= 200 && resp.status < 400) {
      const html = await resp.text().catch(() => '')
      const m = /<title[^>]*>([^<]+)<\/title>/i.exec(html)
      if (m) title = m[1].trim().slice(0, 120)
    }
    return res.status(200).json({ status: resp.status, resolved: true, body: true, title })
  } catch {
    clearTimeout(timer)
    return res.status(200).json({ status: null, resolved: true, body: false, note: 'no response received (may be blocked, offline, or refusing headless checks)' })
  }
}