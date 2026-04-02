import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { getCategoryLabel, getProductImage } from '../utils/productDisplay'
import { formatInr } from '../utils/formatCurrency'
import { useAppSelector } from '../app/hooks'
import { selectCartQuantityForProduct } from '../utils/cartSelectors'
import CartQuantityStepper from './CartQuantityStepper'

interface ProductCardProps {
  product: Product
}

function guestSnapshotFromProduct(p: Product) {
  return {
    name: p.name,
    price: p.price,
    images: p.images,
    stock: p.stock,
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const quantity = useAppSelector((s) => selectCartQuantityForProduct(s, product._id))
  const image = getProductImage(product)
  const category = getCategoryLabel(product.category)
  const guestSnapshot = guestSnapshotFromProduct(product)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/product/${product._id}`} className="block overflow-hidden">
        <img
          src={image}
          alt={product.name}
          className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{category}</p>
          <Link to={`/product/${product._id}`} className="mt-1 block font-display text-lg font-semibold text-text hover:text-primary">
            {product.name}
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-bold text-primary">{formatInr(product.price)}</span>
            {product.ratingsCount > 0 ? (
              <span className="text-sm text-text-muted">
                {product.ratingsAverage.toFixed(1)} ★ ({product.ratingsCount})
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-auto">
          <CartQuantityStepper
            productId={product._id}
            quantity={quantity}
            maxStock={product.stock}
            layout="card"
            guestSnapshot={guestSnapshot}
          />
        </div>
      </div>
    </article>
  )
}
