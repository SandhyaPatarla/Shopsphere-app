import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchOrderById } from '../features/orders/ordersSlice'
import type { Product } from '../types'
import { getProductImage } from '../utils/productDisplay'
import { formatInr } from '../utils/formatCurrency'
import ProtectedRoute from '../components/ProtectedRoute'
import PageContainer from '../components/PageContainer'

function itemProduct(item: { product: string | Product }): Product | null {
  if (typeof item.product === 'object' && item.product && '_id' in item.product) {
    return item.product as Product
  }
  return null
}

function OrderDetailBody({ orderId }: { orderId: string }) {
  const dispatch = useAppDispatch()
  const order = useAppSelector((s) => s.orders.current)
  const detailStatus = useAppSelector((s) => s.orders.detailStatus)
  const error = useAppSelector((s) => s.orders.error)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    void dispatch(fetchOrderById(orderId))
  }, [dispatch, orderId])

  useEffect(() => {
    if (order?.status === 'pending') {
      pollRef.current = setInterval(() => {
        void dispatch(fetchOrderById(orderId))
      }, 2500)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [dispatch, orderId, order?.status])

  if (detailStatus === 'loading' || detailStatus === 'idle') {
    return <p className="text-text-muted">Loading order…</p>
  }

  if (detailStatus === 'failed' || !order) {
    return (
      <div>
        <p className="text-red-600">{error ?? 'Order not found.'}</p>
        <Link to="/orders" className="mt-4 inline-block text-primary hover:underline">
          Back to orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {order.status === 'pending' ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Payment is processing. This page refreshes until your order shows as paid (usually within a few seconds after
          Razorpay confirms).
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase text-text-muted">Order</p>
          <p className="font-display text-xl font-bold text-text">{order._id}</p>
          <p className="text-sm text-text-muted">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-muted">Status</p>
          <p className="font-semibold capitalize text-primary">{order.status}</p>
          <p className="mt-2 text-2xl font-bold text-text">{formatInr(order.totalPrice)}</p>
        </div>
      </div>

      <ul className="divide-y divide-surface-muted rounded-2xl border border-surface-muted bg-surface">
        {order.items.map((line, i) => {
          const p = itemProduct(line)
          const key = p?._id ?? i
          return (
            <li key={key} className="flex gap-4 p-4">
              {p ? (
                <img src={getProductImage(p)} alt={p.name} className="h-20 w-20 rounded-lg object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-surface-muted" />
              )}
              <div className="min-w-0 flex-1">
                {p ? (
                  <Link to={`/product/${p._id}`} className="font-medium text-text hover:text-primary">
                    {p.name}
                  </Link>
                ) : (
                  <span className="text-text-muted">Product</span>
                )}
                <p className="text-sm text-text-muted">Qty {line.quantity}</p>
              </div>
              <p className="font-semibold text-text">{formatInr(line.price * line.quantity)}</p>
            </li>
          )
        })}
      </ul>

      <Link to="/orders" className="inline-block text-sm font-medium text-primary hover:underline">
        ← All orders
      </Link>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return (
      <ProtectedRoute>
        <PageContainer className="py-10 text-center">
          <p>Missing order id.</p>
          <Link to="/orders">Back</Link>
        </PageContainer>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PageContainer className="py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-text">Order detail</h1>
          <div className="mt-8">
            <OrderDetailBody orderId={id} />
          </div>
        </div>
      </PageContainer>
    </ProtectedRoute>
  )
}
