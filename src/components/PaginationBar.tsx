import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setShopFilters } from '../features/catalog/productsSlice'

export default function PaginationBar() {
  const dispatch = useAppDispatch()
  const { page, pages } = useAppSelector((s) => s.products.listMeta)

  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => dispatch(setShopFilters({ page: page - 1 }))}
        className="inline-flex items-center gap-1 rounded-xl border border-surface-muted bg-surface px-4 py-2 text-sm font-medium text-text disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <span className="text-sm text-text-muted">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => dispatch(setShopFilters({ page: page + 1 }))}
        className="inline-flex items-center gap-1 rounded-xl border border-surface-muted bg-surface px-4 py-2 text-sm font-medium text-text disabled:opacity-40"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
