import { Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setShopFilters } from '../features/catalog/productsSlice'
import type { Category } from '../types'

interface ShopToolbarProps {
  categories: Category[]
}

export default function ShopToolbar({ categories }: ShopToolbarProps) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s) => s.products.filters)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-surface-muted bg-surface p-4 shadow-sm md:flex-row md:flex-wrap md:items-end">
      <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm font-medium text-text">
        Search
        <span className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => dispatch(setShopFilters({ search: e.target.value, page: 1 }))}
            placeholder="Apples, kale, berries…"
            className="w-full rounded-xl border border-surface-muted bg-background py-2.5 pl-10 pr-3 text-text outline-none ring-primary/30 focus:ring-2"
          />
        </span>
      </label>

      <label className="flex min-w-[180px] flex-col gap-1 text-sm font-medium text-text">
        Category
        <select
          value={filters.categoryId}
          onChange={(e) => dispatch(setShopFilters({ categoryId: e.target.value, page: 1 }))}
          className="w-full rounded-xl border border-surface-muted bg-background py-2.5 px-3 text-text outline-none ring-primary/30 focus:ring-2"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[100px] flex-col gap-1 text-sm font-medium text-text">
        Min ₹
        <input
          type="number"
          min={0}
          step="0.01"
          value={filters.minPrice}
          onChange={(e) => dispatch(setShopFilters({ minPrice: e.target.value, page: 1 }))}
          className="w-full rounded-xl border border-surface-muted bg-background py-2.5 px-3 text-text outline-none ring-primary/30 focus:ring-2"
        />
      </label>

      <label className="flex min-w-[100px] flex-col gap-1 text-sm font-medium text-text">
        Max ₹
        <input
          type="number"
          min={0}
          step="0.01"
          value={filters.maxPrice}
          onChange={(e) => dispatch(setShopFilters({ maxPrice: e.target.value, page: 1 }))}
          className="w-full rounded-xl border border-surface-muted bg-background py-2.5 px-3 text-text outline-none ring-primary/30 focus:ring-2"
        />
      </label>
    </div>
  )
}
