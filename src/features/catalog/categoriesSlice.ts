import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../api/client'
import { getErrorMessage } from '../../api/errors'
import type { Category } from '../../types'

export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Category[]>('/category')
      return data
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

export interface CreateCategoryBody {
  name: string
  description?: string
  isActive?: boolean
}

export const createCategory = createAsyncThunk<Category, CreateCategoryBody, { rejectValue: string }>(
  'categories/create',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Category>('/category', body)
      return data
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

interface CategoriesState {
  items: Category[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  createError: string | null
}

const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null,
  createStatus: 'idle',
  createError: null,
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryCreateError(state) {
      state.createError = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Failed to load categories'
      })
      .addCase(createCategory.pending, (state) => {
        state.createStatus = 'loading'
        state.createError = null
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        const exists = state.items.some((c) => c._id === action.payload._id)
        if (!exists) state.items.push(action.payload)
        state.items = [...state.items].sort((a, b) => a.name.localeCompare(b.name))
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.createError = action.payload ?? 'Could not create category'
      })
  },
})

export const { clearCategoryCreateError } = categoriesSlice.actions

export default categoriesSlice.reducer
