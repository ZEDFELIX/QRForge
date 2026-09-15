// Generates the QRForge PNG icons + favicon entirely in Node (no native deps).
// Usage: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const iconsDir = join(root, 'icons')
mkdirSync(iconsDir, { recursive: true })

// ---- tiny PNG encoder ----
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// ---- brand artwork: an indigo rounded square with a stylised QR mark ----
const ACCENT = [99, 102, 241] // #6366F1
const WHITE = [255, 255, 255]

function roundedInset(dist, size, radius) {
  // returns alpha fraction (0..1) if inside rounded square
  const inset = (size - dist) / 2
  if (inset <= 0) return 0
  const effR = Math.min(radius, inset)
  const cx = (size - 1) / 2
  const cy = (size - 1) / 2
  const nx = Math.abs(dist - cx)
  const ny = Math.abs(dist - cy)
  const rx = cx - effR
  const ry = cy - effR
  if (nx <= rx || ny <= ry) return 1
  const dx = nx - rx
  const dy = ny - ry
  const od = Math.hypot(dx, dy)
  return Math.max(0, Math.min(1, effR + 0.5 - od))
}

// A recognisable QR-like mark on a rounded indigo tile.
function renderIcon(size) {
  const radius = size * 0.22
  const buf = Buffer.alloc(size * size * 4)
  const g = 29
  const finder = (gx, gy) => {
    return (x, y) => {
      const ix = x - gx
      const iy = y - gy
      if (ix < 0 || iy < 0 || ix >= 7 || iy >= 7) return -1
      const ring = Math.max(Math.abs(ix - 3), Math.abs(iy - 3))
      if (ring === 0 || ring >= 3) return 1
      return 0
    }
  }
  const finders = [finder(1, 1), finder(21, 1), finder(1, 21)]
  let seed = 1337
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const a = Math.round(roundedInset(x, size, radius) * 255)
      const gx = Math.floor((x / size) * g)
      const gy = Math.floor((y / size) * g)
      let cell = 0
      for (const f of finders) {
        const v = f(gx, gy)
        if (v >= 0) { cell = v; break }
      }
      if (cell === 0) {
        const inL = gx < 8 && gy < 8
        const inR = gx >= 21 && gy < 8
        const inB = gx < 8 && gy >= 21
        cell = inL || inR || inB ? 0 : rnd() > 0.45 ? 1 : 0
      }
      const col = cell === 1 ? WHITE : ACCENT
      const i = (y * size + x) * 4
      buf[i] = col[0]
      buf[i + 1] = col[1]
      buf[i + 2] = col[2]
      buf[i + 3] = a
    }
  }
  return buf
}

const targets = [
  ['icons/icon-192.png', 192, renderIcon(192)],
  ['icons/icon-512.png', 512, renderIcon(512)],
  ['icons/maskable-512.png', 512, renderIcon(512)],
  ['icons/apple-touch-icon.png', 180, renderIcon(180)],
  ['icons/og-image.png', 600, renderIcon(600)]
]

for (const [rel, w, rgba] of targets) {
  const [dir, name] = rel.split('/')
  mkdirSync(join(root, dir), { recursive: true })
  writeFileSync(join(root, dir, name), encodePng(w, w, rgba))
  console.log('wrote', rel)
}

writeFileSync(join(root, 'favicon.png'), encodePng(32, 32, renderIcon(32)))
console.log('wrote favicon.png')