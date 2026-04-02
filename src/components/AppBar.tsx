import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Leaf, LogOut, ShoppingBag, User } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchCart } from '../features/cart/cartSlice'
import { logout } from '../features/auth/authSlice'
import { clearCartState } from '../features/cart/cartSlice'
import { resetCheckout } from '../features/checkout/checkoutSlice'
import { selectCartLineCount } from '../utils/cartSelectors'
import PageContainer from './PageContainer'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10'
  }`

export default function AppBar() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.token)
  const user = useAppSelector((s) => s.auth.user)
  const isAdmin = user?.role === 'admin'
  const cartCount = useAppSelector(selectCartLineCount)

  useEffect(() => {
    if (token) void dispatch(fetchCart())
  }, [token, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearCartState())
    dispatch(resetCheckout())
  }

  return (
    <header className="sticky top-0 z-50 border-b border-primary-dark/20 bg-primary shadow-card">
      <PageContainer className="flex h-16 items-center justify-between gap-2 sm:gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Leaf className="h-5 w-5 text-accent-bright" aria-hidden />
          </span>
          Shopsphere
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex" aria-label="Main">
          <NavLink to="/" end className={navLinkClass}>
            Shop
          </NavLink>
          {token ? (
            <NavLink to="/orders" className={navLinkClass}>
              Orders
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {token ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-white/80 sm:inline" title={user?.email}>
                <User className="mb-0.5 mr-1 inline h-4 w-4" aria-hidden />
                {user?.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-2 text-sm font-medium text-white hover:bg-white/25 sm:px-3"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-2 py-2 text-sm font-medium text-white/90 hover:bg-white/10 sm:px-3"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-white px-2 py-2 text-sm font-semibold text-primary shadow hover:bg-surface-muted sm:px-3"
              >
                Sign up
              </Link>
            </>
          )}

          <Link
            to="/cart"
            className="relative rounded-lg p-2.5 text-white hover:bg-white/10"
            aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ''}`}
          >
            <ShoppingBag className="h-6 w-6" aria-hidden />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-primary bg-accent-bright px-0.5 text-[10px] font-bold leading-none text-primary-dark">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </PageContainer>
    </header>
  )
}
