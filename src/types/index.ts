export interface Category {
  _id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  category: Category | string
  images: string[]
  isActive: boolean
  reviews?: unknown[]
  ratingsAverage: number
  ratingsCount: number
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface ProductsListResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface ProductListParams {
  page?: number
  limit?: number
  category?: string
  minLimit?: number
  maxLimit?: number
  search?: string
}

export interface AuthUser {
  _id: string
  name: string
  email: string
  role?: 'user' | 'admin'
}

export interface AuthResponse extends AuthUser {
  token: string
}

/** Stored with guest cart lines for display without extra API calls. */
export interface GuestCartSnapshot {
  name: string
  price: number
  images: string[]
  stock: number
}

export interface GuestCartLine {
  productId: string
  quantity: number
  snapshot: GuestCartSnapshot
}

export interface CartItem {
  product: string | Product
  quantity: number
}

export interface Cart {
  _id: string
  user: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  product: string | Product
  quantity: number
  price: number
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered'

export interface Order {
  _id: string
  user: string
  items: OrderItem[]
  totalPrice: number
  status: OrderStatus
  stripePaymentIntentId?: string | null
  createdAt: string
  updatedAt: string
}

/** POST /api/orders/checkout — Razorpay flow */
export interface CheckoutResponse {
  message: string
  order: Order | null
  keyId?: string
  razorpayOrderId?: string
  amount?: number
  currency?: string
}

export interface VerifyPaymentBody {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface VerifyPaymentResponse {
  message: string
  order: Order
}

/** Body for POST /product (admin). Server sets createdBy from JWT. */
export interface CreateProductBody {
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  isActive?: boolean
}

export interface Review {
  _id: string
  user: string | { name: string }
  product: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
}
