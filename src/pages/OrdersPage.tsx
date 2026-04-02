import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchOrders } from '../features/orders/ordersSlice'
import ProtectedRoute from '../components/ProtectedRoute'
import PageContainer from '../components/PageContainer'
import { formatInr } from '../utils/formatCurrency'

const statusClass: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  paid: 'bg-primary-soft text-primary-dark',
  shipped: 'bg-blue-100 text-blue-900',
  delivered: 'bg-emerald-100 text-emerald-900',
}

function OrdersBody() {
  const dispatch = useAppDispatch()
  const list = useAppSelector((s) => s.orders.list)
  const status = useAppSelector((s) => s.orders.listStatus)
  const error = useAppSelector((s) => s.orders.error)

  useEffect(() => {
    void dispatch(fetchOrders())
  }, [dispatch])

  if (status === 'loading') {
    return <p className="text-text-muted">Loading orders…</p>
  }

  if (status === 'failed') {
    return <p className="text-red-600">{error}</p>
  }

  if (!list.length) {
    return (
      <p className="text-text-muted">
        No orders yet.{' '}
        <Link to="/" className="font-semibold text-primary hover:underline">
          Start shopping
        </Link>
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {list.map((o) => (
        <li key={o._id}>
          <Link
            to={`/orders/${o._id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-muted bg-surface p-4 shadow-sm transition hover:border-primary/30"
          >
            <div>
              <p className="font-semibold text-text">Order {o._id.slice(-8).toUpperCase()}</p>
              <p className="text-sm text-text-muted">{new Date(o.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{formatInr(o.totalPrice)}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  statusClass[o.status] ?? 'bg-surface-muted text-text'
                }`}
              >
                {o.status}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <PageContainer className="py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-text">Your orders</h1>
          <div className="mt-8">
            <OrdersBody />
          </div>
        </div>
      </PageContainer>
    </ProtectedRoute>
  )
}
