// localStorage-backed QR code store. Everything stays on the user's device.
// This file is the shared API used by the Home generator history AND the
// "My Codes" dashboard. All persisted in one place (qrforge:codes:v2).

import { loadAllCodes, saveCode, updateCode, deleteCode, duplicateCode, clearCodes, incrementDownload } from './folders.js'

export function loadHistory() {
  return loadAllCodes()
}

export function saveHistoryEntry(entry) {
  return saveCode(entry)
}

export function removeHistoryEntry(id) {
  return deleteCode(id)
}

export function clearHistory() {
  return clearCodes()
}

export function markDownloaded(payload) {
  return incrementDownload(payload)
}

export { updateCode, duplicateCode }