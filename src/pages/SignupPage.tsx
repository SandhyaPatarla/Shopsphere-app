import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { clearAuthError, signup } from '../features/auth/authSlice'
import { mergeGuestCartToServer } from '../features/cart/cartSlice'
import PageContainer from '../components/PageContainer'

export default function SignupPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const status = useAppSelector((s) => s.auth.status)
  const authError = useAppSelector((s) => s.auth.error)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearAuthError())
    void dispatch(signup({ name, email, password, role: 'user' }))
      .unwrap()
      .then(async () => {
        try {
          await dispatch(mergeGuestCartToServer()).unwrap()
        } catch {
          /* keep guest cart on failure */
        }
        navigate('/', { replace: true })
      })
      .catch(() => {})
  }

  return (
    <PageContainer className="flex min-h-[60vh] flex-col justify-center py-16">
      <div className="mx-auto w-full max-w-md">
      <h1 className="font-display text-3xl font-bold text-text">Create account</h1>
      <p className="mt-2 text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-surface-muted bg-surface p-6 shadow-sm">
        <label className="block text-sm font-medium text-text">
          Name
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
          />
        </label>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
          />
        </label>
        <p className="text-xs text-text-muted">
          Your backend may limit password length — use what your API allows.
        </p>
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
          {status === 'loading' ? 'Creating…' : 'Sign up'}
        </button>
      </form>
      </div>
    </PageContainer>
  )
}
