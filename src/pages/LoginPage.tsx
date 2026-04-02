import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { clearAuthError, login } from '../features/auth/authSlice'
import { mergeGuestCartToServer } from '../features/cart/cartSlice'
import PageContainer from '../components/PageContainer'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const status = useAppSelector((s) => s.auth.status)
  const authError = useAppSelector((s) => s.auth.error)
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearAuthError())
    void dispatch(login({ email, password }))
      .unwrap()
      .then(async () => {
        try {
          await dispatch(mergeGuestCartToServer()).unwrap()
        } catch {
          /* guest cart kept if merge fails (e.g. network) */
        }
        navigate(from, { replace: true })
      })
      .catch(() => {})
  }

  return (
    <PageContainer className="flex min-h-[60vh] flex-col justify-center py-16">
      <div className="mx-auto w-full max-w-md">
      <h1 className="font-display text-3xl font-bold text-text">Log in</h1>
      <p className="mt-2 text-sm text-text-muted">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-surface-muted bg-surface p-6 shadow-sm">
        <label className="block text-sm font-medium text-text">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
          />
        </label>
        <label className="block text-sm font-medium text-text">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
          />
        </label>
        {authError ? (
          <p className="text-sm text-red-600" role="alert">
            {authError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      </div>
    </PageContainer>
  )
}
