import { Star } from 'lucide-react'
import type { Review } from '../types'

interface ReviewListProps {
  reviews: Review[]
}

function reviewerName(review: Review): string {
  const u = review.user
  if (typeof u === 'object' && u && 'name' in u) return u.name
  return 'Customer'
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews.length) {
    return (
      <p className="rounded-xl border border-dashed border-surface-muted bg-background px-4 py-6 text-center text-sm text-text-muted">
        No reviews yet. Be the first to share your thoughts after you try this item.
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r._id} className="rounded-xl border border-surface-muted bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-text">{reviewerName(r)}</span>
            <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < r.rating ? 'fill-current' : 'text-surface-muted'}`}
                />
              ))}
            </span>
            <span className="text-xs text-text-muted">
              {new Date(r.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-2 text-sm text-text">{r.comment}</p>
        </li>
      ))}
    </ul>
  )
}
