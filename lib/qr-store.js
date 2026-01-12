// In-memory store for shared QR codes
// In production, replace this with a proper database (e.g., PostgreSQL, MongoDB, Redis)

const qrStore = new Map()

export function saveQRCode(id, data) {
  qrStore.set(id, {
    ...data,
    createdAt: new Date().toISOString(),
  })
}

export function getQRCode(id) {
  return qrStore.get(id) || null
}

export function deleteQRCode(id) {
  return qrStore.delete(id)
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
