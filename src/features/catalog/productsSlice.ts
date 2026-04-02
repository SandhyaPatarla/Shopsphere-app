import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api/client'
import { getErrorMessage } from '../../api/errors'
import type { CreateProductBody, Product, ProductListParams, ProductsListResponse } from '../../types'

export const fetchProducts = createAsyncThunk<
  ProductsListResponse,
  ProductListParams | undefined,
  { rejectValue: string }
>('products/fetchList', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get<ProductsListResponse>('/product', { params })
    return data
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const fetchProductById = createAsyncThunk<Product | null, string, { rejectValue: string }>(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Product | null>(`/product/${id}`)
      return data
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

export const createProduct = createAsyncThunk<Product, CreateProductBody, { rejectValue: string }>(
  'products/create',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Product>('/product', body)
      return data
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

export const updateProduct = createAsyncThunk<
  Product,
  { id: string; body: Partial<CreateProductBody> & Record<string, unknown> },
  { rejectValue: string }
>('products/update', async ({ id, body }, { rejectWithValue }) => {
  try {
    const { data } = await api.put<Product>(`/product/${id}`, body)
    return data
  } catch (e) {
    return rejectWithValue(getErrorMessage(e))
  }
})

export const deleteProduct = createAsyncThunk<string, string, { rejectValue: string }>(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/product/${id}`)
      return id
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

export interface ShopFilters {
  categoryId: string
  search: string
  minPrice: string
  maxPrice: string
  page: number
  limit: number
}

const defaultFilters: ShopFilters = {
  categoryId: '',
  search: '',
  minPrice: '',
  maxPrice: '',
  page: 1,
  limit: 12,
}

interface ProductsState {
  list: Product[]
  listMeta: Pick<ProductsListResponse, 'total' | 'page' | 'limit' | 'pages'>
  filters: ShopFilters
  currentProduct: Product | null
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ProductsState = {
  list: [],
  listMeta: { total: 0, page: 1, limit: defaultFilters.limit, pages: 0 },
  filters: { ...defaultFilters },
  currentProduct: null,
  listStatus: 'idle',
  detailStatus: 'idle',
  error: null,
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setShopFilters(state, action: PayloadAction<Partial<ShopFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
      if (action.payload.categoryId !== undefined || action.payload.search !== undefined) {
        state.filters.page = 1
      }
    },
    resetProductDetail(state) {
      state.currentProduct = null
      state.detailStatus = 'idle'
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.list = action.payload.products
        state.listMeta = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          pages: action.payload.pages,
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.payload ?? 'Failed to load products'
      })
      .addCase(fetchProductById.pending, (state) => {
        state.detailStatus = 'loading'
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.currentProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = action.payload ?? 'Failed to load product'
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        const p = action.payload
        const rest = state.list.filter((x) => x._id !== p._id)
        state.list = [p, ...rest]
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const p = action.payload
        state.list = state.list.map((x) => (x._id === p._id ? p : x))
        if (state.currentProduct?._id === p._id) state.currentProduct = p
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload)
        if (state.currentProduct?._id === action.payload) state.currentProduct = null
      })
  },
})

export const { setShopFilters, resetProductDetail } = productsSlice.actions
export default productsSlice.reducer
