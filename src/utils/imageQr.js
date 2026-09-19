// Prepares an uploaded image for embedding inside a QR payload.
// A QR module holds at most ~2.9 KB (byte mode, EC-L), so we aggressively
// scale + compress so the resulting code stays scannable.

const TARGET_BYTES = 1400

export function base64Bytes(dataUrl) {
  const b64 = dataUrl.split(',')[1] || ''
  return Math.floor((b64.length * 3) / 4)
}

export function processImageForQr(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type) return reject(new Error('No image selected.'))
    if (!/^image\//.test(file.type))
      return reject(new Error('Please choose an image file (PNG, JPG, WebP or GIF).'))

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const result = encodeScaled(img)
        URL.revokeObjectURL(url)
        resolve(result)
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image file. Try another one.'))
    }
    img.src = url
  })
}

function encodeScaled(img) {
  const maxDim = 128
  let dim = maxDim
  let quality = 0.72
  let dataUrl = ''
  let bytes = Infinity

  for (let i = 0; i < 7; i++) {
    const canvas = document.createElement('canvas')
    canvas.width = dim
    canvas.height = dim
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not supported in this browser.')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, dim, dim)

    const nw = img.naturalWidth || dim
    const nh = img.naturalHeight || dim
    const s = Math.min(dim / nw, dim / nh)
    const w = Math.max(1, Math.round(nw * s))
    const h = Math.max(1, Math.round(nh * s))
    ctx.drawImage(img, Math.floor((dim - w) / 2), Math.floor((dim - h) / 2), w, h)

    dataUrl = canvas.toDataURL('image/jpeg', quality)
    bytes = base64Bytes(dataUrl)
    if (bytes <= TARGET_BYTES) break
    if (quality > 0.45) quality -= 0.14
    else dim = Math.max(48, Math.round(dim * 0.72))
  }

  return { dataUrl, bytes, size: dim }
}