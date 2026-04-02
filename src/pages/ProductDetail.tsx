import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchProductById, resetProductDetail } from '../features/catalog/productsSlice'
import { fetchProductReviews } from '../features/reviews/reviewsSlice'
import CartQuantityStepper from '../components/CartQuantityStepper'
import { selectCartQuantityForProduct } from '../utils/cartSelectors'
import ReviewList from '../components/ReviewList'
import ReviewForm from '../components/ReviewForm'
import PageContainer from '../components/PageContainer'
import { getCategoryLabel, getProductImage } from '../utils/productDisplay'
import { formatInr } from '../utils/formatCurrency'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const product = useAppSelector((s) => s.products.currentProduct)
  const detailStatus = useAppSelector((s) => s.products.detailStatus)
  const error = useAppSelector((s) => s.products.error)
  const reviews = useAppSelector((s) => (id ? s.reviews.byProductId[id] : undefined) ?? [])
  const reviewsStatus = useAppSelector((s) => s.reviews.status)
  const quantityInCart = useAppSelector((s) => (id ? selectCartQuantityForProduct(s, id) : 0))

  useEffect(() => {
    if (!id) return
    void dispatch(fetchProductById(id))
    void dispatch(fetchProductReviews(id))
    return () => {
      dispatch(resetProductDetail())
    }
  }, [dispatch, id])

  if (!id) {
    return (
      <PageContainer className="py-16 text-center">
        <p>Product missing.</p>
        <Link to="/" className="text-primary hover:underline">
          Back to shop
        </Link>
      </PageContainer>
    )
  }

  if (detailStatus === 'loading' || detailStatus === 'idle') {
    return (
      <PageContainer className="py-16 text-center text-text-muted">
        Loading product…
      </PageContainer>
    )
  }

  if (detailStatus === 'failed' || !product) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-red-700">{error ?? 'Product not found.'}</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          Back to shop
        </Link>
      </PageContainer>
    )
  }

  const img = getProductImage(product)
  const category = getCategoryLabel(product.category)

  return (
    <PageContainer className="py-10">
      <nav className="mb-6 text-sm text-text-muted">
        <Link to="/" className="hover:text-primary">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
          <img src={img} alt={product.name} className="aspect-square w-full object-cover" />
        </div>
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{category}</p>
          <h1 className="font-display text-3xl font-bold text-text md:text-4xl">{product.name}</h1>
          <p className="text-3xl font-bold text-primary">{formatInr(product.price)}</p>
          {product.ratingsCount > 0 ? (
            <p className="text-text-muted">
              {product.ratingsAverage.toFixed(1)} average from {product.ratingsCount} reviews
            </p>
          ) : null}
          <p className="leading-relaxed text-text">{product.description}</p>
          <p className="text-sm text-text-muted">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

          <div className="max-w-sm">
            <CartQuantityStepper
              productId={product._id}
              quantity={quantityInCart}
              maxStock={product.stock}
              layout="card"
              guestSnapshot={{
                name: product.name,
                price: product.price,
                images: product.images,
                stock: product.stock,
              }}
            />
          </div>
        </div>
      </div>

      <section className="mt-14 space-y-6">
        <h2 className="font-display text-2xl font-bold text-text">Reviews</h2>
        <ReviewForm productId={product._id} />
        {reviewsStatus === 'loading' ? (
          <p className="text-sm text-text-muted">Loading reviews…</p>
        ) : (
          <ReviewList reviews={reviews} />
        )}
      </section>
    </PageContainer>
  )
}
