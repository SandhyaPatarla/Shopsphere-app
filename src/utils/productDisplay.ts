import type { Product } from '../types'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80'

export function getProductImage(product: Pick<Product, 'images'>): string {
  const first = product.images?.[0]
  return first && first.length > 0 ? first : PLACEHOLDER
}

export function getCategoryLabel(category: Product['category']): string {
  if (category && typeof category === 'object' && 'name' in category) {
    return String(category.name)
  }
  return 'Fresh produce'
}
