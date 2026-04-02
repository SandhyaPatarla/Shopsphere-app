import type { GuestCartLine } from '../../types'

export const GUEST_CART_STORAGE_KEY = 'shopsphere_guest_cart'

export function loadGuestCartFromStorage(): GuestCartLine[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isGuestCartLine)
  } catch {
    return []
  }
}

export function persistGuestCartToStorage(items: GuestCartLine[]) {
  try {
    if (!items.length) localStorage.removeItem(GUEST_CART_STORAGE_KEY)
    else localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore quota / private mode */
  }
}

function isGuestCartLine(x: unknown): x is GuestCartLine {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (typeof o.productId !== 'string' || typeof o.quantity !== 'number') return false
  const snap = o.snapshot
  if (!snap || typeof snap !== 'object') return false
  const s = snap as Record<string, unknown>
  return (
    typeof s.name === 'string' &&
    typeof s.price === 'number' &&
    Array.isArray(s.images) &&
    typeof s.stock === 'number'
  )
}
