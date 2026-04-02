const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

/** Ensures `window.Razorpay` exists (idempotent). */
export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed')))
      return
    }
    const s = document.createElement('script')
    s.src = RAZORPAY_SCRIPT
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Razorpay Checkout'))
    document.body.appendChild(s)
  })
}
