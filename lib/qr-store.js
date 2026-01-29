// In-memory store for shared QR codes
// In production, this would be replaced with a database

const qrStore = new Map()

export function saveQRCode(id, data) {
  qrStore.set(id, {
    ...data,
    createdAt: Date.now(),
  })
}

export function getQRCode(id) {
  return qrStore.get(id)
}

export function deleteQRCode(id) {
  return qrStore.delete(id)
}

export function hasQRCode(id) {
  return qrStore.has(id)
}
