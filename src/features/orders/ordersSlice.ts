import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api/client'
import { getErrorMessage } from '../../api/errors'
import type { Order } from '../../types'

export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Order[]>('/api/orders')
      return data
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

export const fetchOrderById = createAsyncThunk<Order, string, { rejectValue: string }>(
  'orders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Order>(`/api/orders/${id}`)
      return data
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

interface OrdersState {
  list: Order[]
  current: Order | null
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: OrdersState = {
  list: [],
  current: null,
  listStatus: 'idle',
  detailStatus: 'idle',
  error: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    upsertOrderInList(state, action: PayloadAction<Order>) {
      const idx = state.list.findIndex((o) => o._id === action.payload._id)
      if (idx >= 0) state.list[idx] = action.payload
      else state.list.unshift(action.payload)
      if (state.current?._id === action.payload._id) state.current = action.payload
    },
    clearCurrentOrder(state) {
      state.current = null
      state.detailStatus = 'idle'
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.listStatus = 'loading'
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.payload ?? 'Failed to load orders'
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.detailStatus = 'loading'
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = action.payload ?? 'Failed to load order'
      })
  },
})

export const { upsertOrderInList, clearCurrentOrder } = ordersSlice.actions
export default ordersSlice.reducer
