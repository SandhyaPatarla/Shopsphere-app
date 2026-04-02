import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api/client'
import { getErrorMessage } from '../../api/errors'
import type { Review } from '../../types'

export const fetchProductReviews = createAsyncThunk<Review[], string, { rejectValue: string }>(
  'reviews/fetchByProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Review[]>(`/api/reviews/product/${productId}`)
      return data
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

interface CreateReviewBody {
  productId: string
  rating: number
  comment: string
}

export const createReview = createAsyncThunk<Review, CreateReviewBody, { rejectValue: string }>(
  'reviews/create',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Review>('/api/reviews', body)
      return data
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

interface ReviewsState {
  byProductId: Record<string, Review[]>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ReviewsState = {
  byProductId: {},
  status: 'idle',
  createStatus: 'idle',
  error: null,
}

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewsForProduct(state, action: PayloadAction<string>) {
      delete state.byProductId[action.payload]
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const productId = action.meta.arg
        state.byProductId[productId] = action.payload
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Failed to load reviews'
      })
      .addCase(createReview.pending, (state) => {
        state.createStatus = 'loading'
        state.error = null
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        const pid = action.payload.product
        const list = state.byProductId[pid] ?? []
        state.byProductId[pid] = [action.payload, ...list]
      })
      .addCase(createReview.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.error = action.payload ?? 'Failed to submit review'
      })
  },
})

export const { clearReviewsForProduct } = reviewsSlice.actions
export default reviewsSlice.reducer
