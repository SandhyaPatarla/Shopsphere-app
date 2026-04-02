import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import ProductCard from '../components/ProductCard'
import ShopToolbar from '../components/ShopToolbar'
import PaginationBar from '../components/PaginationBar'
import PageContainer from '../components/PageContainer'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchCategories } from '../features/catalog/categoriesSlice'
import { fetchProducts } from '../features/catalog/productsSlice'
import type { ProductListParams } from '../types'

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showAdminDenied, setShowAdminDenied] = useState(false)
  const dispatch = useAppDispatch()
  const categories = useAppSelector((s) => s.categories.items)
  const filters = useAppSelector((s) => s.products.filters)
  const products = useAppSelector((s) => s.products.list)
  const listStatus = useAppSelector((s) => s.products.listStatus)
  const error = useAppSelector((s) => s.products.error)

  useEffect(() => {
    void dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const st = location.state as { adminDenied?: boolean } | undefined
    if (st?.adminDenied) {
      setShowAdminDenied(true)
      navigate('.', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  useEffect(() => {
    const params: ProductListParams = {
      page: filters.page,
      limit: filters.limit,
      ...(filters.categoryId ? { category: filters.categoryId } : {}),
      ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
      ...(filters.minPrice !== '' && !Number.isNaN(Number(filters.minPrice))
        ? { minLimit: Number(filters.minPrice) }
        : {}),
      ...(filters.maxPrice !== '' && !Number.isNaN(Number(filters.maxPrice))
        ? { maxLimit: Number(filters.maxPrice) }
        : {}),
    }
    void dispatch(fetchProducts(params))
  }, [
    dispatch,
    filters.page,
    filters.limit,
    filters.categoryId,
    filters.search,
    filters.minPrice,
    filters.maxPrice,
  ])

  return (
    <>
      <HeroSection />
      <PageContainer className="space-y-8 py-10">
        {showAdminDenied ? (
          <div
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            Admin access only. Sign in with an account that has the <strong>admin</strong> role (JWT should include{' '}
            <code className="rounded bg-white/80 px-1">role</code>).
          </div>
        ) : null}
        <ShopToolbar categories={categories} />

        {listStatus === 'failed' && error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {listStatus === 'loading' ? (
          <p className="text-center text-text-muted">Loading produce…</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {!products.length && listStatus === 'succeeded' ? (
          <p className="text-center text-text-muted">No products match these filters.</p>
        ) : null}

        <PaginationBar />
      </PageContainer>
    </>
  )
}
