// Round-trip test: encodes a payload with the `qrcode` library, writes a PNG,
// decodes the PNG with jsQR (a real QR decoder), and asserts the scanned text
// exactly equals the input. This proves the generated QR codes are standards-
// compliant and scannable, not visual-only.
// Usage: node scripts/verify-qr.mjs
import QRCode from 'qrcode'
import { PNG } from 'pngjs'
import jsQR from 'jsqr'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '.verify')

const cases = [
  { label: 'URL', ec: 'M', text: 'https://www.google.com' },
  { label: 'Text', ec: 'L', text: 'Hello from QRForge' },
  {
    label: 'Wi-Fi',
    ec: 'M',
    text: 'WIFI:T:WPA;S:CoffeeShop;P:secret123;H:false;;'
  },
  {
    label: 'Email',
    ec: 'M',
    text: 'mailto:helloworld@example.com?subject=Hello%20QRForge&body=Hi%20there'
  },
  { label: 'Phone', ec: 'M', text: 'tel:+254711436169' },
  { label: 'SMS', ec: 'M', text: 'SMSTO:+254711436169:Hello from QRForge' },
  { label: 'vCard', ec: 'H', text: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Acme\nTEL:+254711436169\nEMAIL:john@example.com\nEND:VCARD' },
  { label: 'Geo', ec: 'Q', text: 'https://maps.google.com/maps?q=-1.2921,36.8219' },
  { label: 'Image URL', ec: 'M', text: 'https://example.com/photo.jpg' },
  { label: 'Long content', ec: 'H', text: 'https://example.com/this-is-a-very-long-url-path-that-pushes-the-qr-to-a-higher-version-with-more-modules-so-we-verify-mid-size-codes-work-too?query=1234567890&ref=qrforge' }
]

let pass = 0
let fail = 0
for (const c of cases) {
  try {
    const png = await QRCode.toBuffer(c.text, {
      errorCorrectionLevel: c.ec,
      margin: 4,
      width: 400,
      color: { dark: '#111827ff', light: '#ffffffff' }
    })
    writeFileSync(join(outDir, `${c.label.replace(/\W+/g, '-')}.png`), png)
    const img = PNG.sync.read(png)
    const decoded = jsQR(new Uint8ClampedArray(img.data.buffer), img.width, img.height)
    const ok = decoded && decoded.data === c.text
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.label.padEnd(16)} ${decoded ? JSON.stringify(decoded.data.slice(0, 40)) + (decoded.data.length > 40 ? '…' : '') : 'no decode'}`)
    ok ? pass++ : fail++
  } catch (e) {
    fail++
    console.log(`FAIL  ${c.label.padEnd(16)} error: ${e.message}`)
  }
}
console.log(`\n${pass} passed, ${fail} failed`)
if (fail > 0) process.exit(1)