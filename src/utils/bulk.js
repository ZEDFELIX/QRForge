import JSZip from 'jszip'
import { buildPayload, qrToSvg, drawQrAsync } from './qrGenerator.js'
import { validateType } from './validators.js'

const EMPTY_FIELDS = {
  url: '',
  text: '',
  phone: '',
  email: '',
  emailSubject: '',
  emailBody: '',
  smsPhone: '',
  smsMessage: '',
  wifiSsid: '',
  wifiPassword: '',
  wifiSecurity: 'WPA',
  wifiHidden: false,
  contactName: '',
  contactOrg: '',
  contactPhone: '',
  contactEmail: '',
  contactWebsite: '',
  contactAddress: '',
  lat: '',
  lng: '',
}

function cloneFields() {
  return { ...EMPTY_FIELDS, wifiHidden: false }
}

function normalizeHeader(h) {
  return h.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

function findColumn(row, candidates) {
  for (const key of Object.keys(row)) {
    const norm = normalizeHeader(key)
    for (const c of candidates) {
      if (norm === c) return row[key]
    }
  }
  return undefined
}

export function parseCSV(text) {
  const headers = []
  const rows = []
  const errors = []
  const source = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  let pos = 0
  const len = source.length

  function readField() {
    if (pos >= len) return ''

    if (source[pos] === '"') {
      pos++
      let value = ''
      while (pos < len) {
        if (source[pos] === '"') {
          if (pos + 1 < len && source[pos + 1] === '"') {
            value += '"'
            pos += 2
          } else {
            pos++
            break
          }
        } else {
          value += source[pos]
          pos++
        }
      }
      return value
    }

    let value = ''
    while (pos < len && source[pos] !== ',' && source[pos] !== '\n') {
      value += source[pos]
      pos++
    }
    return value
  }

  function skipDelimiter() {
    if (pos < len && source[pos] === ',') {
      pos++
      return true
    }
    if (pos < len && source[pos] === '\n') {
      pos++
      return true
    }
    return false
  }

  function readRow() {
    const cells = []
    let colIndex = 0
    while (true) {
      const atEnd = pos >= len
      const atNewline = pos < len && source[pos] === '\n'
      const atComma = pos < len && source[pos] === ','

      if (colIndex > 0 && !atComma && !atNewline && !atEnd) {
        break
      }

      if (colIndex > 0) {
        pos++
      }

      if (pos >= len) break
      if (source[pos] === '\n') {
        pos++
        break
      }

      cells.push(readField())
      colIndex++
    }
    return cells
  }

  const headerCells = readRow()
  for (const cell of headerCells) {
    const name = cell.trim()
    if (name === '' && headerCells.length === 1) continue
    let finalName = name
    let counter = 2
    while (headers.includes(finalName)) {
      finalName = `${name}_${counter}`
      counter++
    }
    headers.push(finalName)
  }

  if (headers.length === 0) {
    return { headers: [], rows: [], errors: ['No headers found in CSV'] }
  }

  let rowIndex = 0
  while (pos < len || rowIndex === 0) {
    if (pos >= len) break

    const savedPos = pos
    const cells = readRow()
    rowIndex++

    const allEmpty = cells.every((c) => c.trim() === '')
    if (allEmpty && pos >= len) break

    if (cells.length !== headers.length) {
      errors.push(
        `Row ${rowIndex}: expected ${headers.length} columns but found ${cells.length}`
      )
      continue
    }

    const row = {}
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = cells[i]
    }
    rows.push(row)
  }

  return { headers, rows, errors }
}

export function detectQRType(headers) {
  const normalized = headers.map(normalizeHeader)

  const has = (terms) => normalized.some((n) => terms.includes(n))

  if (has(['url', 'link', 'website'])) return 'url'
  if (has(['ssid', 'wifi'])) return 'wifi'
  if (has(['lat', 'latitude']) && has(['lng', 'longitude', 'long'])) return 'location'
  if (has(['phone', 'tel', 'mobile']) && has(['message', 'body', 'msg'])) return 'sms'
  if (has(['email', 'mail']) && has(['subject'])) return 'email'

  const hasName = has(['name', 'fullname', 'full_name', 'contact'])
  const hasPhone = has(['phone', 'tel', 'mobile'])
  const hasEmail = has(['email', 'mail'])
  if (hasName && (hasPhone || hasEmail)) return 'contact'

  if (has(['phone', 'tel', 'mobile']) && !has(['message', 'body'])) return 'phone'
  if (has(['email', 'mail']) && !has(['subject', 'body', 'message'])) return 'email'
  if (has(['text', 'content', 'message', 'description'])) return 'text'

  return null
}

export function mapRowToFields(row, qrType) {
  const fields = cloneFields()
  let title = ''

  const setIfPresent = (field, value) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      fields[field] = String(value).trim()
    }
  }

  function pickTitle() {
    for (const val of Object.values(row)) {
      const s = String(val || '').trim()
      if (s.length > 0) {
        return s.length > 40 ? s.slice(0, 40) : s
      }
    }
    return `QR ${Date.now()}`
  }

  switch (qrType) {
    case 'url':
      setIfPresent('url', findColumn(row, ['url', 'link', 'website']))
      break

    case 'text':
      setIfPresent('text', findColumn(row, ['text', 'content', 'message', 'description']))
      break

    case 'wifi':
      setIfPresent('wifiSsid', findColumn(row, ['ssid', 'network', 'name']))
      setIfPresent('wifiPassword', findColumn(row, ['password', 'pass', 'key']))
      setIfPresent('wifiSecurity', findColumn(row, ['security', 'enc', 'encryption']))
      setIfPresent('wifiHidden', findColumn(row, ['hidden', 'visibility']))
      if (typeof fields.wifiHidden === 'string') {
        fields.wifiHidden = fields.wifiHidden.toLowerCase() === 'true' || fields.wifiHidden === '1'
      }
      if (!fields.wifiSecurity) fields.wifiSecurity = 'WPA'
      break

    case 'contact':
      setIfPresent('contactName', findColumn(row, ['name', 'fullname', 'full_name']))
      setIfPresent('contactOrg', findColumn(row, ['org', 'company', 'organization']))
      setIfPresent('contactPhone', findColumn(row, ['phone', 'tel', 'mobile']))
      setIfPresent('contactEmail', findColumn(row, ['email', 'mail']))
      setIfPresent('contactWebsite', findColumn(row, ['website', 'url', 'link']))
      setIfPresent('contactAddress', findColumn(row, ['address', 'location']))
      break

    case 'phone':
      setIfPresent('phone', findColumn(row, ['phone', 'number', 'tel', 'mobile']))
      break

    case 'email':
      setIfPresent('email', findColumn(row, ['email', 'to', 'mail']))
      setIfPresent('emailSubject', findColumn(row, ['subject', 'subj']))
      setIfPresent('emailBody', findColumn(row, ['body', 'message', 'content']))
      break

    case 'sms':
      setIfPresent('smsPhone', findColumn(row, ['phone', 'number', 'tel', 'mobile']))
      setIfPresent('smsMessage', findColumn(row, ['message', 'body', 'msg']))
      break

    case 'location':
      setIfPresent('lat', findColumn(row, ['lat', 'latitude']))
      setIfPresent('lng', findColumn(row, ['lng', 'longitude', 'long']))
      break

    default:
      break
  }

  title = pickTitle()
  return { fields, title }
}

function processInBatches(items, batchSize, fn) {
  return new Promise((resolve) => {
    let index = 0

    function processBatch() {
      const end = Math.min(index + batchSize, items.length)
      for (let i = index; i < end; i++) {
        fn(items[i], i)
      }
      index = end

      if (index < items.length) {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(processBatch, { timeout: 50 })
        } else {
          setTimeout(processBatch, 0)
        }
      } else {
        resolve()
      }
    }

    processBatch()
  })
}

export async function bulkGenerate(parsedRows, qrType, qrOptions = {}) {
  const {
    fg = '#000000',
    bg = '#ffffff',
    size = 300,
    margin = 4,
    errorCorrection = 'M',
    rounded = false,
  } = qrOptions

  const items = []
  const errors = []

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const workItems = parsedRows.map((row, index) => ({ row, index }))

  await processInBatches(workItems, 10, async (workItem) => {
    const { row, index } = workItem

    try {
      const { fields, title } = mapRowToFields(row, qrType)
      const validation = validateType(qrType, fields)
      const valid = validation === true || validation === undefined || (validation && !validation.error)

      let dataUrl = ''
      let payload = ''
      let error = ''

      if (valid) {
        try {
          payload = buildPayload(qrType, fields)

          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, size, size)

          await drawQrAsync(canvas, payload, {
            fg,
            bg,
            size,
            margin,
            errorCorrection,
            rounded,
          })

          dataUrl = canvas.toDataURL('image/png')
        } catch (err) {
          error = err.message || 'Failed to generate QR code'
          dataUrl = ''
        }
      } else {
        error = validation?.error || 'Invalid fields for this QR type'
      }

      items.push({
        id: index + 1,
        title,
        payload,
        type: qrType,
        dataUrl,
        fields,
        valid: valid && !error,
        error,
      })
    } catch (err) {
      const errorMsg = err.message || 'Unknown error processing row'
      errors.push(`Row ${index + 1}: ${errorMsg}`)
      items.push({
        id: index + 1,
        title: `Row ${index + 1}`,
        payload: '',
        type: qrType,
        dataUrl: '',
        fields: cloneFields(),
        valid: false,
        error: errorMsg,
      })
    }
  })

  return { items, errors }
}

export function generateMappingCSV(items) {
  const escapeCSVField = (value) => {
    const str = String(value ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  const lines = []
  lines.push(['Title', 'Type', 'Payload', 'Status', 'Error'].map(escapeCSVField).join(','))

  for (const item of items) {
    const status = item.valid ? 'Valid' : 'Invalid'
    const error = item.error || ''
    lines.push(
      [item.title, item.type, item.payload, status, error].map(escapeCSVField).join(',')
    )
  }

  return lines.join('\r\n')
}

export function downloadMappingCSV(items, filename = 'qr-mapping.csv') {
  const csv = generateMappingCSV(items)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export async function downloadAllAsZip(items, filename = 'qr-codes.zip') {
  const zip = new JSZip()
  const folder = zip.folder('qr-codes')

  for (const item of items) {
    if (!item.valid) continue
    const base64 = item.dataUrl.split(',')[1]
    const safeName = (item.title || `qr-${item.id}`)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60)
    folder.file(`${safeName}.png`, base64, { base64: true })
  }

  const csv = generateMappingCSV(items)
  folder.file('mapping.csv', csv)

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
