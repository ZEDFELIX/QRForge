import { useState } from 'react'
import { Download, Image as ImageIcon, FileCode, FileText, Printer, Copy, Check } from 'lucide-react'
import { downloadCanvasAs, downloadSvg, copyCanvasToClipboard } from '../utils/download.js'

const HI_RES = 1024

export default function DownloadButtons({ disabled, rasterize, generateSvg, title, onDownload, downloads }) {
  const [copied, setCopied] = useState(false)

  const handleDownload = async (format) => {
    if (disabled) return
    try {
      if (format === 'svg') {
        downloadSvg(generateSvg(), `${title}-qr`)
      } else {
        const canvas = await rasterize(HI_RES)
        downloadCanvasAs(canvas, format, `${title}-qr`)
      }
      onDownload?.('download')
    } catch {
      alert('Download failed in this browser. Try PNG.')
    }
  }

  const handleCopy = async () => {
    if (disabled) return
    try {
      const canvas = await rasterize(512)
      await copyCanvasToClipboard(canvas)
      onDownload?.('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Image copy isn’t supported in this browser. You can still download the PNG.')
    }
  }

  const handlePrint = async () => {
    if (disabled) return
    // open a dedicated print surface using the same rasterizer
    const win = window.open('', '_blank', 'width=560,height=760')
    if (!win) {
      alert('Please allow pop-ups to print.')
      return
    }
    const canvas = await rasterize(HI_RES)
    const dataUrl = canvas.toDataURL('image/png')
    const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>Print QR Code</title>
<style>
 body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;
      margin:0;padding:40px 32px;text-align:center}
 h1{font-size:20px;margin:0 0 4px;font-weight:600}
 p{font-size:13px;color:#6b7280;margin:0 0 24px;max-width:380px;margin-left:auto;margin-right:auto}
 img{width:460px;max-width:92vw;height:auto;border-radius:12px;margin:0 auto;display:block;
     background:#fff;padding:14px;border:1px solid #e5e7eb}
 @media print{body{padding:12mm}}
</style></head>
<body>
 <h1>${escapeHtml(title)}</h1>
 <p>${titleLegend()}</p>
 <img src="${dataUrl}" alt="${escapeHtml(title)} QR code"/>
 <script>window.onload=function(){setTimeout(function(){window.print()},200)}<\/script>
</body></html>`
    win.document.write(html)
    win.document.close()
  }

  const btn =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button
          onClick={() => handleDownload('png')}
          disabled={disabled}
          className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}
        >
          <ImageIcon size={16} aria-hidden="true" /> PNG
        </button>
        <button
          onClick={() => handleDownload('svg')}
          disabled={disabled}
          className={`${btn} border border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600`}
        >
          <FileCode size={16} aria-hidden="true" /> SVG
        </button>
        <button
          onClick={() => handleDownload('jpg')}
          disabled={disabled}
          className={`${btn} border border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600`}
        >
          <FileText size={16} aria-hidden="true" /> JPG
        </button>
        <button
          onClick={handleCopy}
          disabled={disabled}
          className={`${btn} col-span-2 border border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600 sm:col-span-1`}
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? 'Copied!' : 'Copy QR'}
        </button>
        <button
          onClick={handlePrint}
          disabled={disabled}
          className={`${btn} col-span-2 border border-slate-300 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 sm:col-span-2`}
        >
          <Printer size={16} aria-hidden="true" /> Print QR Code
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        <Download size={12} className="mr-1 inline" aria-hidden="true" /> High-resolution PNG (1024px) is recommended for crisp scanning.
      </p>
    </div>
  )
}

function titleLegend() {
  return 'Scan with your phone camera to open the destination.'
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}