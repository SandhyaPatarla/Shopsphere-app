import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../../api/client'
import { getErrorMessage } from '../../api/errors'
import type { AuthResponse, AuthUser } from '../../types'
import { getRoleFromJwt } from '../../utils/jwtRole'

interface LoginBody {
  email: string
  password: string
}

interface SignupBody {
  name: string
  email: string
  password: string
  role?: 'user' | 'admin'
}

function readPersistedAuth(): { token: string | null; user: AuthUser | null } {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!token || !raw) return { token: null, user: null }
    let user = JSON.parse(raw) as AuthUser
    const fromJwt = getRoleFromJwt(token)
    if (fromJwt && user.role !== fromJwt) {
      user = { ...user, role: fromJwt }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    }
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

function persistAuth(data: AuthResponse) {
  const { token, ...userFields } = data
  let role: AuthUser['role'] =
    'role' in userFields && userFields.role ? userFields.role : undefined
  if (!role) role = getRoleFromJwt(token)
  const user: AuthUser = {
    _id: userFields._id,
    name: userFields.name,
    email: userFields.email,
    role,
  }
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  return { token, user }
}

function clearPersistedAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

const persisted = readPersistedAuth()

export const login = createAsyncThunk<AuthResponse, LoginBody, { rejectValue: string }>(
  'auth/login',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/login', body)
      return data
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

export const signup = createAsyncThunk<AuthResponse, SignupBody, { rejectValue: string }>(
  'auth/signup',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/signup', {
        ...body,
        role: body.role ?? 'user',
      })
      return data
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

interface AuthState {
  token: string | null
  user: AuthUser | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  token: persisted.token,
  user: persisted.user,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      state.status = 'idle'
      state.error = null
      clearPersistedAuth()
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { token, user } = persistAuth(action.payload)
        state.token = token
        state.user = user
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Login failed'
      })
      .addCase(signup.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { token, user } = persistAuth(action.payload)
        state.token = token
        state.user = user
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Signup failed'
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
