import type { RootState } from '../app/store'

/** Total item count (guest vs server depending on auth). */
export function selectCartLineCount(state: RootState): number {
  if (state.auth.token) {
    const items = state.cart.cart?.items
    if (!items?.length) return 0
    return items.reduce((n, line) => n + line.quantity, 0)
  }
  return state.cart.guestItems.reduce((n, line) => n + line.quantity, 0)
}

/** Quantity for this product (guest vs server). */
export function selectCartQuantityForProduct(state: RootState, productId: string): number {
  if (state.auth.token) {
    const items = state.cart.cart?.items ?? []
    for (const line of items) {
      const id = typeof line.product === 'string' ? line.product : line.product._id
      if (id === productId) return line.quantity
    }
    return 0
  }
  const g = state.cart.guestItems.find((x) => x.productId === productId)
  return g?.quantity ?? 0
}
