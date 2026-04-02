export {}

declare global {
  interface RazorpaySuccessResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }

  interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    order_id: string
    name?: string
    description?: string
    handler: (response: RazorpaySuccessResponse) => void
    modal?: { ondismiss?: () => void }
    prefill?: { email?: string; contact?: string }
    theme?: { color?: string }
  }

  interface RazorpayInstance {
    open: () => void
  }

  interface RazorpayConstructor {
    new (options: RazorpayOptions): RazorpayInstance
  }

  interface Window {
    Razorpay?: RazorpayConstructor
  }
}
