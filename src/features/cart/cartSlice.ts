import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api/client'
import { getErrorMessage } from '../../api/errors'
import type { Cart, GuestCartLine, GuestCartSnapshot } from '../../types'
import { loadGuestCartFromStorage, persistGuestCartToStorage } from './guestCartStorage'

interface CartResultBody {
  result: Cart | undefined
}

/** Narrow getState for merge thunk (avoids importing RootState from store). */
interface MergeCartRootState {
  auth: { token: string | null }
  cart: CartState
}

export const fetchCart = createAsyncThunk<Cart | null, void, { rejectValue: string }>(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<CartResultBody>('/api/cart')
      return data.result ?? null
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

export const addToCart = createAsyncThunk<Cart, { productId: string; quantity: number }, { rejectValue: string }>(
  'cart/add',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post<CartResultBody>('/api/cart', body)
      if (!data.result) throw new Error('Invalid cart response')
      return data.result
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

export const updateCartItem = createAsyncThunk<
  Cart,
  { productId: string; quantity: number },
  { rejectValue: string }
>('cart/update', async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.put<CartResultBody>('/api/cart', body)
    if (!data.result) throw new Error('Invalid cart response')
    return data.result
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const removeCartItem = createAsyncThunk<void, string, { rejectValue: string }>(
  'cart/remove',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/api/cart/${productId}`)
      await dispatch(fetchCart()).unwrap()
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

/** Push persisted guest lines to the server cart (requires Bearer). */
export const mergeGuestCartToServer = createAsyncThunk<void, void, { rejectValue: string }>(
  'cart/mergeGuest',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as MergeCartRootState
    const token = state.auth.token
    const guestItems = state.cart.guestItems
    if (!token || guestItems.length === 0) return

    try {
      for (const line of guestItems) {
        await dispatch(addToCart({ productId: line.productId, quantity: line.quantity })).unwrap()
      }
      dispatch(clearGuestCart())
      await dispatch(fetchCart()).unwrap()
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

export interface CartState {
  cart: Cart | null
  guestItems: GuestCartLine[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  mutationStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: CartState = {
  cart: null,
  guestItems: loadGuestCartFromStorage(),
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartState(state) {
      state.cart = null
      state.status = 'idle'
      state.mutationStatus = 'idle'
      state.error = null
    },
    guestCartAdd(
      state,
      action: PayloadAction<{ productId: string; quantity: number; snapshot: GuestCartSnapshot }>
    ) {
      const { productId, quantity, snapshot } = action.payload
      const max = Math.max(0, snapshot.stock)
      if (max <= 0) return
      const add = Math.min(Math.max(1, quantity), max)
      const idx = state.guestItems.findIndex((i) => i.productId === productId)
      if (idx >= 0) {
        const nextQty = Math.min(state.guestItems[idx].quantity + add, max)
        state.guestItems[idx].quantity = nextQty
        state.guestItems[idx].snapshot = { ...snapshot }
      } else {
        state.guestItems.push({ productId, quantity: add, snapshot: { ...snapshot } })
      }
      persistGuestCartToStorage(state.guestItems)
    },
    guestCartSetQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const { productId, quantity } = action.payload
      const idx = state.guestItems.findIndex((i) => i.productId === productId)
      if (idx < 0) return
      const stock = state.guestItems[idx].snapshot.stock
      if (quantity <= 0) {
        state.guestItems.splice(idx, 1)
      } else {
        state.guestItems[idx].quantity = Math.min(quantity, stock)
      }
      persistGuestCartToStorage(state.guestItems)
    },
    guestCartRemove(state, action: PayloadAction<string>) {
      state.guestItems = state.guestItems.filter((i) => i.productId !== action.payload)
      persistGuestCartToStorage(state.guestItems)
    },
    clearGuestCart(state) {
      state.guestItems = []
      persistGuestCartToStorage([])
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.cart = action.payload
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Failed to load cart'
      })
      .addCase(addToCart.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.cart = action.payload
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? 'Could not add to cart'
      })
      .addCase(updateCartItem.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.cart = action.payload
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? 'Could not update cart'
      })
      .addCase(removeCartItem.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(removeCartItem.fulfilled, (state) => {
        state.mutationStatus = 'succeeded'
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? 'Could not remove item'
      })
  },
})

export const {
  clearCartState,
  guestCartAdd,
  guestCartSetQuantity,
  guestCartRemove,
  clearGuestCart,
} = cartSlice.actions
export default cartSlice.reducer
