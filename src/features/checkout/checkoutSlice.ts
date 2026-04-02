import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../api/client'
import { getErrorMessage } from '../../api/errors'
import type { CheckoutResponse, VerifyPaymentBody, VerifyPaymentResponse } from '../../types'

export const startCheckout = createAsyncThunk<
  CheckoutResponse,
  void,
  { rejectValue: string }
>('checkout/start', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post<CheckoutResponse>('/api/orders/checkout', {})
    return data
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const verifyPayment = createAsyncThunk<
  VerifyPaymentResponse,
  VerifyPaymentBody,
  { rejectValue: string }
>('checkout/verifyPayment', async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post<VerifyPaymentResponse>('/api/orders/verify-payment', body)
    return data
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

interface CheckoutState {
  keyId: string | null
  razorpayOrderId: string | null
  amount: number | null
  currency: string | null
  orderId: string | null
  message: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: CheckoutState = {
  keyId: null,
  razorpayOrderId: null,
  amount: null,
  currency: null,
  orderId: null,
  message: null,
  status: 'idle',
  error: null,
}

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    resetCheckout(state) {
      state.keyId = null
      state.razorpayOrderId = null
      state.amount = null
      state.currency = null
      state.orderId = null
      state.message = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(startCheckout.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(startCheckout.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.message = action.payload.message
        const p = action.payload
        state.keyId = p.keyId ?? null
        state.razorpayOrderId = p.razorpayOrderId ?? null
        state.amount = typeof p.amount === 'number' ? p.amount : null
        state.currency = p.currency ?? null
        state.orderId = p.order?._id ?? null
      })
      .addCase(startCheckout.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Checkout failed'
      })
  },
})

export const { resetCheckout } = checkoutSlice.actions
export default checkoutSlice.reducer
