import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import AdminRoute from '../components/AdminRoute'
import PageContainer from '../components/PageContainer'
import { clearCategoryCreateError, createCategory, fetchCategories } from '../features/catalog/categoriesSlice'
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../features/catalog/productsSlice'
import { toast } from 'sonner'
import type { Product } from '../types'
import { getCategoryLabel } from '../utils/productDisplay'

function parseImageUrls(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

type Tab = 'categories' | 'products'

function AdminContent() {
  const dispatch = useAppDispatch()
  const categories = useAppSelector((s) => s.categories.items)
  const categoriesError = useAppSelector((s) => s.categories.createError)
  const categoriesBusy = useAppSelector((s) => s.categories.createStatus === 'loading')
  const products = useAppSelector((s) => s.products.list)
  const listStatus = useAppSelector((s) => s.products.listStatus)

  const [tab, setTab] = useState<Tab>('categories')

  const [catName, setCatName] = useState('')
  const [catDescription, setCatDescription] = useState('')

  const [pName, setPName] = useState('')
  const [pDescription, setPDescription] = useState('')
  const [pPrice, setPPrice] = useState('')
  const [pStock, setPStock] = useState('')
  const [pCategoryId, setPCategoryId] = useState('')
  const [pImages, setPImages] = useState('')
  const [pIsActive, setPIsActive] = useState(true)
  const [productErr, setProductErr] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const [editStock, setEditStock] = useState<Record<string, string>>({})
  const [editPrice, setEditPrice] = useState<Record<string, string>>({})

  useEffect(() => {
    void dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    if (tab !== 'products') return
    void dispatch(fetchProducts({ page: 1, limit: 100 }))
  }, [dispatch, tab])

  useEffect(() => {
    if (categories.length && !pCategoryId) {
      setPCategoryId(categories[0]._id)
    }
  }, [categories, pCategoryId])

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearCategoryCreateError())
    void dispatch(createCategory({ name: catName.trim(), description: catDescription.trim() || undefined }))
      .unwrap()
      .then(() => {
        toast.success('Category created')
        setCatName('')
        setCatDescription('')
      })
      .catch((err: unknown) => toast.error(String(err)))
  }

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    setProductErr(null)
    const price = Number(pPrice)
    const stock = Number(pStock)
    const images = parseImageUrls(pImages)
    if (!pName.trim() || !pDescription.trim() || !pCategoryId) {
      const msg = 'Name, description, and category are required.'
      setProductErr(msg)
      toast.error(msg)
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      const msg = 'Price must be a valid non-negative number.'
      setProductErr(msg)
      toast.error(msg)
      return
    }
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      const msg = 'Stock must be a non-negative whole number.'
      setProductErr(msg)
      toast.error(msg)
      return
    }
    if (images.length < 1) {
      const msg = 'Add at least one image URL.'
      setProductErr(msg)
      toast.error(msg)
      return
    }
    void dispatch(
      createProduct({
        name: pName.trim(),
        description: pDescription.trim(),
        price,
        stock,
        category: pCategoryId,
        images,
        isActive: pIsActive,
      })
    )
      .unwrap()
      .then(() => {
        toast.success('Product created')
        setPName('')
        setPDescription('')
        setPPrice('')
        setPStock('')
        setPImages('')
        setPIsActive(true)
      })
      .catch((err: string) => {
        setProductErr(err)
        toast.error(err)
      })
  }

  const startEditRow = (p: Product) => {
    setEditStock((s) => ({ ...s, [p._id]: String(p.stock) }))
    setEditPrice((s) => ({ ...s, [p._id]: String(p.price) }))
  }

  const saveRow = async (p: Product) => {
    setProductErr(null)
    const stock = Number(editStock[p._id])
    const price = Number(editPrice[p._id])
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      const msg = 'Stock must be a non-negative integer.'
      setProductErr(msg)
      toast.error(msg)
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      const msg = 'Price must be a valid non-negative number.'
      setProductErr(msg)
      toast.error(msg)
      return
    }
    setSavingId(p._id)
    try {
      await dispatch(updateProduct({ id: p._id, body: { stock, price } })).unwrap()
      toast.success('Product updated')
    } catch (err) {
      const msg = String(err)
      setProductErr(msg)
      toast.error(msg)
    } finally {
      setSavingId(null)
    }
  }

  const removeProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setProductErr(null)
    try {
      await dispatch(deleteProduct(id)).unwrap()
      toast.success('Product deleted')
    } catch (err) {
      const msg = String(err)
      setProductErr(msg)
      toast.error(msg)
    }
  }

  return (
    <PageContainer className="py-10">
      <div className="flex flex-col gap-4 border-b border-surface-muted pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-text">Admin</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage categories and inventory. Storefront uses the same catalog endpoints shoppers see.
          </p>
        </div>
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">
          ← Back to shop
        </Link>
      </div>

      <div className="mt-6 flex gap-2 border-b border-surface-muted pb-px">
        <button
          type="button"
          onClick={() => setTab('categories')}
          className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
            tab === 'categories' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text'
          }`}
        >
          Categories
        </button>
        <button
          type="button"
          onClick={() => setTab('products')}
          className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
            tab === 'products' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text'
          }`}
        >
          Products
        </button>
      </div>

      {tab === 'categories' ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <form
            onSubmit={handleCreateCategory}
            className="space-y-4 rounded-2xl border border-surface-muted bg-surface p-6 shadow-sm"
          >
            <h2 className="font-display text-xl font-semibold text-text">New category</h2>
            <label className="block text-sm font-medium text-text">
              Name
              <input
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
              />
            </label>
            <label className="block text-sm font-medium text-text">
              Description
              <textarea
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
              />
            </label>
            {categoriesError ? (
              <p className="text-sm text-red-600" role="alert">
                {categoriesError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={categoriesBusy}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {categoriesBusy ? 'Creating…' : 'Create category'}
            </button>
          </form>

          <div className="rounded-2xl border border-surface-muted bg-surface p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-text">Active categories (storefront)</h2>
            <ul className="mt-4 max-h-[28rem] space-y-2 overflow-auto text-sm">
              {categories.map((c) => (
                <li
                  key={c._id}
                  className="flex justify-between gap-2 rounded-lg border border-surface-muted bg-background px-3 py-2"
                >
                  <span className="font-medium text-text">{c.name}</span>
                  <span className="truncate font-mono text-xs text-text-muted" title={c._id}>
                    {c._id.slice(-8)}
                  </span>
                </li>
              ))}
              {!categories.length ? <li className="text-text-muted">No categories yet. Create one to use in products.</li> : null}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <form
            onSubmit={handleCreateProduct}
            className="grid gap-4 rounded-2xl border border-surface-muted bg-surface p-6 shadow-sm md:grid-cols-2"
          >
            <h2 className="font-display text-xl font-semibold text-text md:col-span-2">New product</h2>
            <label className="block text-sm font-medium text-text md:col-span-2">
              Name
              <input
                required
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
              />
            </label>
            <label className="block text-sm font-medium text-text md:col-span-2">
              Description
              <textarea
                required
                value={pDescription}
                onChange={(e) => setPDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
              />
            </label>
            <label className="block text-sm font-medium text-text">
              Price (₹)
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={pPrice}
                onChange={(e) => setPPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
              />
            </label>
            <label className="block text-sm font-medium text-text">
              Stock
              <input
                required
                type="number"
                min={0}
                step={1}
                value={pStock}
                onChange={(e) => setPStock(e.target.value)}
                className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
              />
            </label>
            <label className="block text-sm font-medium text-text md:col-span-2">
              Category
              <select
                required
                value={pCategoryId}
                onChange={(e) => setPCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 text-text"
              >
                {!categories.length ? <option value="">Create a category first</option> : null}
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-text md:col-span-2">
              Image URLs (one per line or comma-separated)
              <textarea
                required
                value={pImages}
                onChange={(e) => setPImages(e.target.value)}
                rows={3}
                placeholder="https://…"
                className="mt-1 w-full rounded-xl border border-surface-muted bg-background px-3 py-2 font-mono text-sm text-text"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-text md:col-span-2">
              <input type="checkbox" checked={pIsActive} onChange={(e) => setPIsActive(e.target.checked)} />
              Active on storefront
            </label>
            {productErr ? (
              <p className="md:col-span-2 text-sm text-red-600" role="alert">
                {productErr}
              </p>
            ) : null}
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark md:col-span-2"
            >
              Create product
            </button>
          </form>

          <div className="overflow-hidden rounded-2xl border border-surface-muted bg-surface shadow-sm">
            <h2 className="border-b border-surface-muted px-6 py-4 font-display text-lg font-semibold text-text">
              Inventory ({listStatus === 'loading' ? '…' : products.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-muted text-sm">
                <thead className="bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-text">Product</th>
                    <th className="px-4 py-3 text-left font-semibold text-text">Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-text">Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-text">Stock</th>
                    <th className="px-4 py-3 text-right font-semibold text-text">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-muted">
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td className="px-4 py-3">
                        <Link to={`/product/${p._id}`} className="font-medium text-primary hover:underline">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{getCategoryLabel(p.category)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={editPrice[p._id] ?? String(p.price)}
                          onChange={(e) => setEditPrice((x) => ({ ...x, [p._id]: e.target.value }))}
                          onFocus={() => startEditRow(p)}
                          className="w-24 rounded-lg border border-surface-muted bg-background px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={editStock[p._id] ?? String(p.stock)}
                          onChange={(e) => setEditStock((x) => ({ ...x, [p._id]: e.target.value }))}
                          onFocus={() => startEditRow(p)}
                          className="w-20 rounded-lg border border-surface-muted bg-background px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={savingId === p._id}
                          onClick={() => void saveRow(p)}
                          className="mr-2 font-semibold text-primary hover:underline disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeProduct(p._id)}
                          className="font-semibold text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!products.length && listStatus === 'succeeded' ? (
              <p className="px-6 py-8 text-center text-text-muted">No products yet. Create one above.</p>
            ) : null}
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  )
}
