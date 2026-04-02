import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { resetCheckout, startCheckout, verifyPayment } from '../features/checkout/checkoutSlice'
import { fetchCart } from '../features/cart/cartSlice'
import { upsertOrderInList } from '../features/orders/ordersSlice'
import { loadRazorpayScript } from '../lib/razorpay'
import ProtectedRoute from '../components/ProtectedRoute'
import PageContainer from '../components/PageContainer'

function CheckoutBody() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)
  const { keyId, razorpayOrderId, amount, currency, orderId, status, error, message } = useAppSelector(
    (s) => s.checkout
  )
  const startedRef = useRef(false)
  const rzpOpenedRef = useRef(false)

  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  const effectiveKeyId = keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || ''

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    async function run() {
      dispatch(resetCheckout())
      await dispatch(fetchCart())
      await dispatch(startCheckout())
    }

    void run()
  }, [dispatch])

  useEffect(() => {
    if (status !== 'succeeded') return
    if (!razorpayOrderId || amount == null || !currency) return
    if (!effectiveKeyId) return
    if (rzpOpenedRef.current) return
    rzpOpenedRef.current = true

    const key = effectiveKeyId
    const rid = razorpayOrderId
    const amt = amount
    const cur = currency

    let cancelled = false

    async function openRazorpay() {
      try {
        await loadRazorpayScript()
        if (cancelled || !window.Razorpay) throw new Error('Razorpay is not available')
        const options: RazorpayOptions = {
          key,
          amount: amt,
          currency: cur,
          order_id: rid,
          name: 'ShopSphere',
          description: 'Order payment',
          handler(response: RazorpaySuccessResponse) {
            void (async () => {
              setVerifyError(null)
              setVerifying(true)
              try {
                const result = await dispatch(
                  verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  })
                ).unwrap()
                dispatch(upsertOrderInList(result.order))
                await dispatch(fetchCart()).unwrap()
                dispatch(resetCheckout())
                navigate(`/orders/${result.order._id}`, { replace: true })
              } catch (e) {
                const msg = e instanceof Error ? e.message : String(e)
                setVerifyError(msg || 'Payment verification failed. You can retry from your cart.')
              } finally {
                setVerifying(false)
              }
            })()
          },
          modal: {
            ondismiss() {
              rzpOpenedRef.current = false
              setVerifyError((prev) => prev ?? 'Payment window closed. Your order may still be pending.')
            },
          },
          prefill: {
            email: user?.email,
          },
          theme: { color: '#166534' },
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Could not start Razorpay'
        setVerifyError(msg)
        rzpOpenedRef.current = false
      }
    }

    void openRazorpay()

    return () => {
      cancelled = true
    }
  }, [status, razorpayOrderId, amount, currency, effectiveKeyId, dispatch, navigate, user?.email])

  if (status === 'loading' || status === 'idle') {
    return <p className="text-text-muted">Preparing checkout…</p>
  }

  if (status === 'failed') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        <p>{error}</p>
        <Link to="/cart" className="mt-2 inline-block font-semibold underline">
          Back to cart
        </Link>
      </div>
    )
  }

  if (!razorpayOrderId || amount == null || !currency || !orderId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <p>{message ?? 'Checkout could not create a Razorpay order.'}</p>
        <p className="mt-2 text-sm">Ensure your cart has items and the server returns keyId, razorpayOrderId, amount, and currency.</p>
        {!effectiveKeyId ? (
          <p className="mt-2 text-sm">
            Set <code className="rounded bg-white/80 px-1">VITE_RAZORPAY_KEY_ID</code> in <code className="rounded bg-white/80 px-1">.env</code> if the API omits <code className="rounded bg-white/80 px-1">keyId</code> (public key only — never the secret).
          </p>
        ) : null}
        <Link to="/cart" className="mt-2 inline-block font-semibold underline">
          Back to cart
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-text-muted">{message}</p> : null}
      <p className="text-text">
        Order <span className="font-mono text-sm">{orderId}</span>
      </p>
      <p className="text-sm text-text-muted">
        {verifying ? 'Verifying payment with the server…' : 'Complete payment in the Razorpay window.'}
      </p>
      {verifyError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {verifyError}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Link to="/cart" className="text-sm font-semibold text-primary underline">
          Back to cart
        </Link>
        <button
          type="button"
          className="text-sm font-semibold text-primary underline"
          onClick={() => {
            setVerifyError(null)
            rzpOpenedRef.current = false
            dispatch(resetCheckout())
            void (async () => {
              await dispatch(fetchCart())
              await dispatch(startCheckout())
            })()
          }}
        >
          Retry checkout
        </button>
      </div>
      <p className="text-xs text-text-muted">
        Use Razorpay test mode cards/UPI from your dashboard when using test keys.
      </p>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <PageContainer className="py-10">
        <div className="mx-auto max-w-lg">
          <h1 className="font-display text-3xl font-bold text-text">Checkout</h1>
          <div className="mt-8">
            <CheckoutBody />
          </div>
        </div>
      </PageContainer>
    </ProtectedRoute>
  )
}
