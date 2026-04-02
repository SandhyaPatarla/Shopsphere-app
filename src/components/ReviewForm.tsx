import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createReview } from '../features/reviews/reviewsSlice'

interface ReviewFormProps {
  productId: string
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.token)
  const createStatus = useAppSelector((s) => s.reviews.createStatus)
  const error = useAppSelector((s) => s.reviews.error)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  if (!token) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void dispatch(createReview({ productId, rating, comment }))
      .unwrap()
      .then(() => {
        setComment('')
        setRating(5)
      })
      .catch(() => {})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-surface-muted bg-surface-muted/50 p-4">
      <h3 className="font-display text-lg font-semibold text-text">Write a review</h3>
      <label className="block text-sm font-medium text-text">
        Rating
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 w-full max-w-xs rounded-xl border border-surface-muted bg-surface px-3 py-2 text-text"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} — {n === 5 ? 'Love it' : n === 1 ? 'Not for me' : 'OK'}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-text">
        Comment
        <textarea
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-surface-muted bg-surface px-3 py-2 text-text"
          placeholder="How was the freshness and flavor?"
        />
      </label>
      {error && createStatus === 'failed' ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={createStatus === 'loading'}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {createStatus === 'loading' ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
