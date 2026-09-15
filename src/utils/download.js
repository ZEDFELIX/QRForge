// Download helpers: PNG, JPG, SVG, clipboard copy, print window.

function slugify(input) {
  const s = String(input || 'qr-forge')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)
  return s || 'qr-forge'
}

function triggerDownload(href, filename) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function downloadCanvasAs(canvas, format, baseName) {
  const name = `${slugify(baseName)}.${format === 'png' ? 'png' : 'jpg'}`
  const mime = format === 'png' ? 'image/png' : 'image/jpeg'
  const href = canvas.toDataURL(mime, format === 'jpg' ? 0.92 : undefined)
  triggerDownload(href, name)
}

export function downloadSvg(svgString, baseName) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `${slugify(baseName)}.svg`)
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function copyCanvasToClipboard(canvas) {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('unsupported')
  }
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  )
  if (!blob) throw new Error('unsupported')
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ])
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function openPrintWindow({ dataUrl, title, description }) {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const win = window.open('', '_blank', 'width=520,height=700')
  if (!win) {
    throw new Error('popup-blocked')
  }
  win.document.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${t || 'QR Code'}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         color:#111827; margin:0; padding:40px 32px; text-align:center; }
  h1 { font-size:20px; margin:0 0 4px; }
  p  { font-size:13px; color:#6b7280; margin:0 0 20px; max-width:380px; }
  .qr { width: 480px; max-width:100%; height:auto;
        border:1px solid #e5e7eb; border-radius:16px; padding:16px; background:#fff; margin:0 auto; }
  @media print { body { padding:12mm; } }
</style>
</head>
<body>
  ${t ? `<h1>${t}</h1>` : ''}
  ${d ? `<p>${d}</p>` : ''}
  <img class="qr" src="${dataUrl}" alt="QR Code" />
</body>
</html>`)
  win.document.close()
  win.onload = () => {
    setTimeout(() => {
      win.focus()
      win.print()
    }, 250)
  }
  return win
}