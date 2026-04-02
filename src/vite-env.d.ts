/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  /** Public Razorpay key id (e.g. rzp_test_…). Optional if POST /api/orders/checkout returns keyId. Never put the key secret here. */
  readonly VITE_RAZORPAY_KEY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
