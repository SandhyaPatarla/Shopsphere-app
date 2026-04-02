import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchCart, guestCartRemove, removeCartItem } from '../features/cart/cartSlice'
import CartQuantityStepper from '../components/CartQuantityStepper'
import type { Product } from '../types'
import { getProductImage } from '../utils/productDisplay'
import { formatInr } from '../utils/formatCurrency'
import PageContainer from '../components/PageContainer'

function lineProduct(line: { product: string | Product; quantity: number }): Product | null {
  if (typeof line.product === 'object' && line.product && '_id' in line.product) {
    return line.product as Product
  }
  return null
}

function ServerCartContent() {
  const dispatch = useAppDispatch()
  const cart = useAppSelector((s) => s.cart.cart)
  const status = useAppSelector((s) => s.cart.status)
  const mutationBusy = useAppSelector((s) => s.cart.mutationStatus === 'loading')

  useEffect(() => {
    void dispatch(fetchCart())
  }, [dispatch])

  if (status === 'loading') {
    return <p className="text-text-muted">Loading your cart…</p>
  }

  const items = cart?.items ?? []

  let subtotal = 0
  for (const line of items) {
    const p = lineProduct(line)
    if (p) subtotal += p.price * line.quantity
  }

  return (
    <>
      {!items.length ? (
        <p className="text-text-muted">
          Your cart is empty.{' '}
          <Link to="/" className="font-semibold text-primary hover:underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-surface-muted rounded-2xl border border-surface-muted bg-surface shadow-sm">
          {items.map((line) => {
            const p = lineProduct(line)
            const pid = typeof line.product === 'string' ? line.product : line.product._id
            if (!p) {
              return (
                <li key={pid} className="flex flex-wrap items-center gap-4 p-4 text-sm text-text-muted">
                  Product unavailable ({pid})
                  <button
                    type="button"
                    onClick={() => void dispatch(removeCartItem(pid))}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              )
            }
            return (
              <li key={pid} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <img
                  src={getProductImage(p)}
                  alt={p.name}
                  className="h-24 w-24 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${p._id}`} className="font-semibold text-text hover:text-primary">
                    {p.name}
                  </Link>
                  <p className="text-sm text-text-muted">{formatInr(p.price)} each</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <CartQuantityStepper
                    productId={pid}
                    quantity={line.quantity}
                    maxStock={p.stock}
                    layout="inline"
                    guestSnapshot={{
                      name: p.name,
                      price: p.price,
                      images: p.images,
                      stock: p.stock,
                    }}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${p.name} from cart`}
                    disabled={mutationBusy}
                    onClick={() => void dispatch(removeCartItem(pid))}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <p className="font-semibold text-text sm:w-24 sm:text-right">
                  {formatInr(p.price * line.quantity)}
                </p>
              </li>
            )
          })}
        </ul>
      )}

      {items.length > 0 ? (
        <div className="mt-8 flex flex-col items-end gap-4 border-t border-surface-muted pt-6">
          <p className="text-lg">
            Subtotal <span className="font-bold text-primary">{formatInr(subtotal)}</span>
            <span className="ml-2 text-sm text-text-muted">(tax/shipping may apply at payment)</span>
          </p>
          <Link
            to="/checkout"
            className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            Proceed to checkout
          </Link>
        </div>
      ) : null}
    </>
  )
}

function GuestCartContent() {
  const dispatch = useAppDispatch()
  const lines = useAppSelector((s) => s.cart.guestItems)

  let subtotal = 0
  for (const line of lines) {
    subtotal += line.snapshot.price * line.quantity
  }

  const checkoutLoginState = { from: { pathname: '/checkout' as const } }

  return (
    <>
      {!lines.length ? (
        <p className="text-text-muted">
          Your cart is empty.{' '}
          <Link to="/" className="font-semibold text-primary hover:underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-surface-muted rounded-2xl border border-surface-muted bg-surface shadow-sm">
          {lines.map((line) => {
            const snap = line.snapshot
            const fakeProduct: Pick<Product, '_id' | 'name' | 'price' | 'images' | 'stock'> = {
              _id: line.productId,
              name: snap.name,
              price: snap.price,
              images: snap.images,
              stock: snap.stock,
            }
            return (
              <li key={line.productId} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <img
                  src={getProductImage(fakeProduct)}
                  alt={snap.name}
                  className="h-24 w-24 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/product/${line.productId}`}
                    className="font-semibold text-text hover:text-primary"
                  >
                    {snap.name}
                  </Link>
                  <p className="text-sm text-text-muted">{formatInr(snap.price)} each</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <CartQuantityStepper
                    productId={line.productId}
                    quantity={line.quantity}
                    maxStock={snap.stock}
                    layout="inline"
                    guestSnapshot={snap}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${snap.name} from cart`}
                    onClick={() => dispatch(guestCartRemove(line.productId))}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <p className="font-semibold text-text sm:w-24 sm:text-right">
                  {formatInr(snap.price * line.quantity)}
                </p>
              </li>
            )
          })}
        </ul>
      )}

      {lines.length > 0 ? (
        <div className="mt-8 flex flex-col items-end gap-4 border-t border-surface-muted pt-6">
          <p className="text-lg">
            Subtotal <span className="font-bold text-primary">{formatInr(subtotal)}</span>
          </p>
          <p className="max-w-md text-right text-sm text-text-muted">
            Log in or sign up to sync your cart and pay securely. Your items stay here until then.
          </p>
          <Link
            to="/login"
            state={checkoutLoginState}
            className="inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            Log in to checkout
          </Link>
        </div>
      ) : null}
    </>
  )
}

export default function CartPage() {
  const token = useAppSelector((s) => s.auth.token)

  return (
    <PageContainer className="py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-text">Your cart</h1>
        <div className="mt-8">{token ? <ServerCartContent /> : <GuestCartContent />}</div>
      </div>
    </PageContainer>
  )
}
